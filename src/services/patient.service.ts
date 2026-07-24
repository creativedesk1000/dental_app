import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { sendPatientCredentialsEmail } from "@/lib/email";
import { ApiException } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { getTenantFilter, type SessionUser } from "@/lib/tenant";
import type { z } from "zod";
import type {
  createPatientSchema,
  updatePatientSchema,
} from "@/lib/validations/patient";

type CreatePatientInput = z.infer<typeof createPatientSchema>;
type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

export async function listPatients(
  actor: SessionUser,
  clinicId?: string | null,
  search?: string | null
) {
  const filter = getTenantFilter(actor, clinicId);

  const where: Record<string, unknown> = { ...filter };

  // DOCTOR role: only see patients they have appointments with
  if (actor.role === "DOCTOR") {
    where.appointments = {
      some: { doctorId: actor.id },
    };
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { appointments: true } },
    },
  });
}

export async function getPatientById(actor: SessionUser, id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      _count: { select: { appointments: true } },
      clinic: { select: { id: true, name: true } },
    },
  });

  if (!patient) {
    throw new ApiException("Patient not found", 404);
  }

  getTenantFilter(actor, patient.clinicId);

  return patient;
}

export async function createPatient(actor: SessionUser, input: CreatePatientInput) {
  const clinicId =
    actor.role === "SUPER_ADMIN"
      ? input.clinicId
      : actor.clinicId;

  if (!clinicId) {
    throw new ApiException("Clinic ID is required", 400);
  }

  getTenantFilter(actor, clinicId);

  // Ensure clinic exists and fetch its name
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) throw new ApiException("Clinic not found", 404);

  let userId: string | undefined = undefined;

  // Auto-create User account if email is provided
  if (input.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!existingUser) {
      const generatedPassword = Math.random().toString(36).slice(-8) + "A1!";
      const hashedPassword = await bcrypt.hash(generatedPassword, 12);

      const newUser = await prisma.user.create({
        data: {
          name: `${input.firstName} ${input.lastName}`,
          email: input.email,
          password: hashedPassword,
          role: Role.PATIENT,
          clinicId: clinic.id,
        },
      });
      userId = newUser.id;

      // Email credentials in background
      sendPatientCredentialsEmail(input.email, generatedPassword, clinic.name).catch(console.error);
    } else {
      userId = existingUser.id;
    }
  }

  const patient = await prisma.patient.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email || null,
      phone: input.phone || null,
      dob: input.dob ? new Date(input.dob) : null,
      clinicId,
      userId,
    },
    include: {
      _count: { select: { appointments: true } },
    },
  });

  await createAuditLog({
    action: "PATIENT_CREATED",
    entity: "Patient",
    entityId: patient.id,
    userId: actor.id,
    clinicId,
    details: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
    },
  });

  return patient;
}

export async function updatePatient(
  actor: SessionUser,
  id: string,
  input: UpdatePatientInput
) {
  const existing = await getPatientById(actor, id);

  const data: Record<string, unknown> = { ...input };
  if (input.dob) {
    data.dob = new Date(input.dob);
  }

  const patient = await prisma.patient.update({
    where: { id },
    data,
    include: {
      _count: { select: { appointments: true } },
    },
  });

  await createAuditLog({
    action: "PATIENT_UPDATED",
    entity: "Patient",
    entityId: patient.id,
    userId: actor.id,
    clinicId: existing.clinicId,
    details: input as Record<string, unknown>,
  });

  return patient;
}

export async function deletePatient(actor: SessionUser, id: string) {
  const existing = await getPatientById(actor, id);

  // Delete associated appointments first
  await prisma.appointment.deleteMany({
    where: { patientId: id },
  });

  await prisma.patient.delete({
    where: { id },
  });

  await createAuditLog({
    action: "PATIENT_DELETED",
    entity: "Patient",
    entityId: id,
    userId: actor.id,
    clinicId: existing.clinicId,
    details: {
      firstName: existing.firstName,
      lastName: existing.lastName,
    },
  });

  return { message: "Patient deleted" };
}

