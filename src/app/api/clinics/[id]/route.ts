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
import { updateClinicSchema } from "@/lib/validations/clinic";
import {
  deleteClinic,
  getClinicById,
  updateClinic,
} from "@/services/clinic.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.CLINICS_READ);

    const { id } = await context.params;
    const clinic = await getClinicById(id);
    return apiSuccess(clinic);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.CLINICS_UPDATE);

    const { id } = await context.params;
    const body = await req.json();
    const input = updateClinicSchema.parse(body);
    const clinic = await updateClinic(id, input, user.id);

    return apiSuccess(clinic);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.CLINICS_DELETE);

    const { id } = await context.params;
    const result = await deleteClinic(id, user.id);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
