import { prisma } from "@/lib/prisma";
import { ApiException } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { getTenantFilter, type SessionUser } from "@/lib/tenant";
import type { z } from "zod";
import type { updateSettingsSchema } from "@/lib/validations/settings";

type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export async function getSettings(actor: SessionUser, clinicId?: string) {
  const filter = getTenantFilter(actor, clinicId);
  const resolvedClinicId =
    "clinicId" in filter ? filter.clinicId : clinicId;

  if (!resolvedClinicId) {
    throw new ApiException("Clinic ID is required", 400);
  }

  let settings = await prisma.settings.findUnique({
    where: { clinicId: resolvedClinicId },
    include: {
      clinic: {
        select: {
          id: true,
          name: true,
          logo: true,
          email: true,
          phone: true,
          address: true,
        },
      },
    },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: { clinicId: resolvedClinicId },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            logo: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
    });
  }

  return settings;
}

export async function updateSettings(
  actor: SessionUser,
  input: UpdateSettingsInput,
  clinicId?: string
) {
  const filter = getTenantFilter(actor, clinicId);
  const resolvedClinicId =
    "clinicId" in filter ? filter.clinicId : clinicId;

  if (!resolvedClinicId) {
    throw new ApiException("Clinic ID is required", 400);
  }

  const settings = await prisma.settings.upsert({
    where: { clinicId: resolvedClinicId },
    create: { clinicId: resolvedClinicId, ...input },
    update: input,
    include: {
      clinic: {
        select: {
          id: true,
          name: true,
          logo: true,
          email: true,
          phone: true,
          address: true,
        },
      },
    },
  });

  await createAuditLog({
    action: "SETTINGS_UPDATED",
    entity: "Settings",
    entityId: settings.id,
    userId: actor.id,
    clinicId: resolvedClinicId,
    details: input,
  });

  return settings;
}
