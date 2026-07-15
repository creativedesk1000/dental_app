import bcrypt from "bcryptjs";
import { ClinicStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiException } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import type { z } from "zod";
import type {
  createClinicSchema,
  updateClinicSchema,
} from "@/lib/validations/clinic";

type CreateClinicInput = z.infer<typeof createClinicSchema>;
type UpdateClinicInput = z.infer<typeof updateClinicSchema>;

export async function listClinics() {
  return prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: {
        select: { status: true, plan: true },
      },
      _count: { select: { users: true } },
    },
  });
}

export async function getClinicById(id: string) {
  const clinic = await prisma.clinic.findUnique({
    where: { id },
    include: {
      subscription: true,
      settings: true,
      _count: { select: { users: true } },
    },
  });

  if (!clinic) {
    throw new ApiException("Clinic not found", 404);
  }

  return clinic;
}

export async function createClinic(
  input: CreateClinicInput,
  actorId?: string
) {
  const existing = await prisma.clinic.findUnique({
    where: { subdomain: input.subdomain },
  });
  if (existing) {
    throw new ApiException("Subdomain already taken", 409);
  }

  if (input.adminEmail) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.adminEmail },
    });
    if (existingUser) {
      throw new ApiException("Admin email already exists", 409);
    }
  }

  const clinic = await prisma.$transaction(async (tx) => {
    const created = await tx.clinic.create({
      data: {
        name: input.name,
        subdomain: input.subdomain,
        logo: input.logo,
        email: input.email,
        phone: input.phone,
        address: input.address,
      },
    });

    await tx.settings.create({ data: { clinicId: created.id } });
    await tx.subscription.create({ data: { clinicId: created.id } });

    if (input.adminEmail && input.adminPassword) {
      const hashedPassword = await bcrypt.hash(input.adminPassword, 12);
      await tx.user.create({
        data: {
          name: input.adminName || "Clinic Admin",
          email: input.adminEmail,
          password: hashedPassword,
          role: Role.CLINIC_ADMIN,
          clinicId: created.id,
        },
      });
    }

    return created;
  });

  await createAuditLog({
    action: "CLINIC_CREATED",
    entity: "Clinic",
    entityId: clinic.id,
    userId: actorId,
    clinicId: clinic.id,
    details: { name: clinic.name, subdomain: clinic.subdomain },
  });

  return getClinicById(clinic.id);
}

export async function updateClinic(
  id: string,
  input: UpdateClinicInput,
  actorId?: string
) {
  await getClinicById(id);

  const clinic = await prisma.clinic.update({
    where: { id },
    data: input,
    include: {
      subscription: true,
      _count: { select: { users: true } },
    },
  });

  await createAuditLog({
    action: "CLINIC_UPDATED",
    entity: "Clinic",
    entityId: clinic.id,
    userId: actorId,
    clinicId: clinic.id,
    details: input,
  });

  return clinic;
}

export async function deleteClinic(id: string, actorId?: string) {
  const clinic = await getClinicById(id);

  await prisma.clinic.delete({ where: { id } });

  await createAuditLog({
    action: "CLINIC_DELETED",
    entity: "Clinic",
    entityId: id,
    userId: actorId,
    clinicId: id,
    details: { name: clinic.name },
  });

  return { message: "Clinic deleted" };
}

export async function suspendClinic(id: string, actorId?: string) {
  return updateClinicStatus(id, ClinicStatus.SUSPENDED, "CLINIC_SUSPENDED", actorId);
}

export async function activateClinic(id: string, actorId?: string) {
  return updateClinicStatus(id, ClinicStatus.ACTIVE, "CLINIC_ACTIVATED", actorId);
}

async function updateClinicStatus(
  id: string,
  status: ClinicStatus,
  action: string,
  actorId?: string
) {
  const clinic = await prisma.clinic.update({
    where: { id },
    data: { status },
    include: {
      subscription: true,
      _count: { select: { users: true } },
    },
  });

  await createAuditLog({
    action,
    entity: "Clinic",
    entityId: clinic.id,
    userId: actorId,
    clinicId: clinic.id,
    details: { status },
  });

  return clinic;
}

export async function getAdminStats() {
  const [
    totalClinics,
    activeClinics,
    suspendedClinics,
    totalUsers,
    activeSubscriptions,
    recentClinics,
    activeSessions,
  ] = await Promise.all([
    prisma.clinic.count(),
    prisma.clinic.count({ where: { status: ClinicStatus.ACTIVE } }),
    prisma.clinic.count({ where: { status: ClinicStatus.SUSPENDED } }),
    prisma.user.count({ where: { role: { not: Role.SUPER_ADMIN } } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.clinic.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        address: true,
        createdAt: true,
        status: true,
      },
    }),
    prisma.userSession.count({
      where: { expiresAt: { gt: new Date() } },
    }),
  ]);

  return {
    totalClinics,
    activeClinics,
    suspendedClinics,
    totalUsers,
    activeSubscriptions,
    onlineUsers: activeSessions,
    recentClinics,
  };
}
