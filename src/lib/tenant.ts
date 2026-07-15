import { Role } from "@prisma/client";
import { ApiException } from "@/lib/api-response";

export type SessionUser = {
  id: string;
  role: Role;
  clinicId: string | null;
};

export function requireClinicAccess(
  user: SessionUser,
  targetClinicId: string | null | undefined
) {
  if (user.role === Role.SUPER_ADMIN) return;

  if (!user.clinicId) {
    throw new ApiException("No clinic associated with this account", 403);
  }

  if (!targetClinicId || user.clinicId !== targetClinicId) {
    throw new ApiException("Access denied: clinic data is isolated", 403);
  }
}

export function getTenantFilter(
  user: SessionUser,
  requestedClinicId?: string | null
): { clinicId: string } | Record<string, never> {
  if (user.role === Role.SUPER_ADMIN) {
    if (requestedClinicId) {
      return { clinicId: requestedClinicId };
    }
    return {};
  }

  if (!user.clinicId) {
    throw new ApiException("No clinic associated with this account", 403);
  }

  if (requestedClinicId && requestedClinicId !== user.clinicId) {
    throw new ApiException("Access denied: clinic data is isolated", 403);
  }

  return { clinicId: user.clinicId };
}

export function requireRole(user: SessionUser, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new ApiException("Insufficient permissions", 403);
  }
}
