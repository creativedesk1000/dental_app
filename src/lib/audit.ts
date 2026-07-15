import { prisma } from "@/lib/prisma";

type AuditParams = {
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  userId?: string | null;
  clinicId: string;
};

export async function createAuditLog(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details ? JSON.stringify(params.details) : null,
        userId: params.userId,
        clinicId: params.clinicId,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
