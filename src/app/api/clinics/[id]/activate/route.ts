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
import { activateClinic } from "@/services/clinic.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.CLINICS_SUSPEND);

    const { id } = await context.params;
    const clinic = await activateClinic(id, user.id);
    return apiSuccess(clinic);
  } catch (error) {
    return handleApiError(error);
  }
}
