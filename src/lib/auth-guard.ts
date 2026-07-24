import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { ApiException } from "@/lib/api-response";
import {
  type PermissionName,
  roleHasPermission,
  roleHasAnyPermission,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/tenant";

let permissionCache: Map<Role, Set<string>> | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function loadPermissionCache() {
  const now = Date.now();
  if (permissionCache && now - cacheLoadedAt < CACHE_TTL) {
    return permissionCache;
  }

  const records = await prisma.rolePermission.findMany({
    include: { permission: true },
  });

  const map = new Map<Role, Set<string>>();
  for (const record of records) {
    if (!map.has(record.role)) map.set(record.role, new Set());
    map.get(record.role)!.add(record.permission.name);
  }

  permissionCache = map;
  cacheLoadedAt = now;
  return map;
}

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiException("Unauthorized", 401);
  }
  return session;
}

export function toSessionUser(session: Awaited<ReturnType<typeof getAuthSession>>): SessionUser {
  return {
    id: session.user.id,
    role: session.user.role,
    clinicId: session.user.clinicId,
  };
}

export async function requirePermission(
  user: SessionUser,
  permission: PermissionName
) {
  const cache = await loadPermissionCache();
  // If DB cache doesn't have permissions for this role, fall back to default hardcoded permissions
  if (!cache.has(user.role)) {
    cache.set(user.role, new Set(DEFAULT_ROLE_PERMISSIONS[user.role] || []));
  }
  if (!roleHasPermission(user.role, permission, cache)) {
    throw new ApiException("Insufficient permissions", 403);
  }
}

export async function requireAnyPermission(
  user: SessionUser,
  permissions: PermissionName[]
) {
  const cache = await loadPermissionCache();
  // If DB cache doesn't have permissions for this role, fall back to default hardcoded permissions
  if (!cache.has(user.role)) {
    cache.set(user.role, new Set(DEFAULT_ROLE_PERMISSIONS[user.role] || []));
  }
  if (!roleHasAnyPermission(user.role, permissions, cache)) {
    throw new ApiException("Insufficient permissions", 403);
  }
}

export async function requireRoles(user: SessionUser, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new ApiException("Insufficient permissions", 403);
  }
}
