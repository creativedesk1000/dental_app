import {
  apiSuccess,
  handleApiError,
} from "@/lib/api-response";
import {
  getAuthSession,
  requirePermission,
  toSessionUser,
} from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { getAdminStats } from "@/services/clinic.service";

export async function GET() {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.ADMIN_ACCESS);

    const stats = await getAdminStats();
    return apiSuccess(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
