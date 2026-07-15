import { Role } from "@prisma/client";
import {
  apiSuccess,
  handleApiError,
} from "@/lib/api-response";
import { getAuthSession } from "@/lib/auth-guard";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  try {
    await getAuthSession();

    const roles = Object.values(Role).map((role) => ({
      name: role,
      label: role
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" "),
      permissions: DEFAULT_ROLE_PERMISSIONS[role],
    }));

    return apiSuccess(roles);
  } catch (error) {
    return handleApiError(error);
  }
}
