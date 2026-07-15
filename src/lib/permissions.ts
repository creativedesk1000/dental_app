import { Role } from "@prisma/client";

export const PERMISSIONS = {
  ADMIN_ACCESS: "admin:access",
  CLINICS_CREATE: "clinics:create",
  CLINICS_READ: "clinics:read",
  CLINICS_UPDATE: "clinics:update",
  CLINICS_DELETE: "clinics:delete",
  CLINICS_SUSPEND: "clinics:suspend",
  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",
  SESSIONS_READ: "sessions:read",
  SESSIONS_REVOKE: "sessions:revoke",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: {
  name: PermissionName;
  description: string;
}[] = [
  { name: PERMISSIONS.ADMIN_ACCESS, description: "Access platform admin area" },
  { name: PERMISSIONS.CLINICS_CREATE, description: "Create clinics" },
  { name: PERMISSIONS.CLINICS_READ, description: "View clinics" },
  { name: PERMISSIONS.CLINICS_UPDATE, description: "Edit clinics" },
  { name: PERMISSIONS.CLINICS_DELETE, description: "Delete clinics" },
  { name: PERMISSIONS.CLINICS_SUSPEND, description: "Suspend or activate clinics" },
  { name: PERMISSIONS.USERS_CREATE, description: "Create users" },
  { name: PERMISSIONS.USERS_READ, description: "View users" },
  { name: PERMISSIONS.USERS_UPDATE, description: "Edit users" },
  { name: PERMISSIONS.USERS_DELETE, description: "Delete users" },
  { name: PERMISSIONS.SETTINGS_READ, description: "View clinic settings" },
  { name: PERMISSIONS.SETTINGS_UPDATE, description: "Update clinic settings" },
  { name: PERMISSIONS.SESSIONS_READ, description: "View active sessions" },
  { name: PERMISSIONS.SESSIONS_REVOKE, description: "Revoke active sessions" },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionName[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS.map((p) => p.name),
  CLINIC_ADMIN: [
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.SESSIONS_READ,
    PERMISSIONS.SESSIONS_REVOKE,
  ],
  DOCTOR: [PERMISSIONS.SETTINGS_READ, PERMISSIONS.USERS_READ],
  RECEPTIONIST: [
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
  ],
};

export function roleHasPermission(
  role: Role,
  permission: PermissionName,
  rolePermissionMap?: Map<Role, Set<string>>
): boolean {
  if (rolePermissionMap) {
    return rolePermissionMap.get(role)?.has(permission) ?? false;
  }
  return DEFAULT_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function roleHasAnyPermission(
  role: Role,
  permissions: PermissionName[],
  rolePermissionMap?: Map<Role, Set<string>>
): boolean {
  return permissions.some((p) => roleHasPermission(role, p, rolePermissionMap));
}
