import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiException } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { getTenantFilter, type SessionUser } from "@/lib/tenant";
import type { z } from "zod";
import type {
  createUserSchema,
  updateUserSchema,
} from "@/lib/validations/user";

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export async function listUsers(actor: SessionUser, clinicId?: string) {
  const filter = getTenantFilter(actor, clinicId);

  return prisma.user.findMany({
    where: {
      ...filter,
      role: { not: Role.SUPER_ADMIN },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      clinicId: true,
      emailVerified: true,
      lastLoginAt: true,
      image: true,
      clinic: { select: { id: true, name: true } },
    },
  });
}

export async function getUserById(actor: SessionUser, id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      clinicId: true,
      emailVerified: true,
      lastLoginAt: true,
      image: true,
      clinic: { select: { id: true, name: true } },
    },
  });

  if (!user || user.role === Role.SUPER_ADMIN) {
    throw new ApiException("User not found", 404);
  }

  getTenantFilter(actor, user.clinicId);
  return user;
}

export async function createUser(
  actor: SessionUser,
  input: CreateUserInput
) {
  const clinicId =
    actor.role === Role.SUPER_ADMIN
      ? input.clinicId
      : actor.clinicId;

  if (!clinicId) {
    throw new ApiException("Clinic ID is required", 400);
  }

  getTenantFilter(actor, clinicId);

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new ApiException("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      clinicId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      clinicId: true,
    },
  });

  await createAuditLog({
    action: "USER_CREATED",
    entity: "User",
    entityId: user.id,
    userId: actor.id,
    clinicId,
    details: { email: user.email, role: user.role },
  });

  return user;
}

export async function updateUser(
  actor: SessionUser,
  id: string,
  input: UpdateUserInput
) {
  const existing = await getUserById(actor, id);

  if (input.email && input.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (emailTaken) {
      throw new ApiException("Email already exists", 409);
    }
  }

  const data: UpdateUserInput & { password?: string } = { ...input };
  if (input.password) {
    data.password = await bcrypt.hash(input.password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      clinicId: true,
    },
  });

  if (existing.clinicId) {
    await createAuditLog({
      action: "USER_UPDATED",
      entity: "User",
      entityId: user.id,
      userId: actor.id,
      clinicId: existing.clinicId,
      details: { ...input, password: input.password ? "[redacted]" : undefined },
    });
  }

  return user;
}

export async function deleteUser(actor: SessionUser, id: string) {
  const existing = await getUserById(actor, id);

  if (existing.id === actor.id) {
    throw new ApiException("Cannot delete your own account", 400);
  }

  await prisma.user.delete({ where: { id } });

  if (existing.clinicId) {
    await createAuditLog({
      action: "USER_DELETED",
      entity: "User",
      entityId: id,
      userId: actor.id,
      clinicId: existing.clinicId,
    });
  }

  return { message: "User deleted" };
}
