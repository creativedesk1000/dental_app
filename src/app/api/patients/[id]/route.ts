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
import { updatePatientSchema } from "@/lib/validations/patient";
import {
  deletePatient,
  getPatientById,
  updatePatient,
} from "@/services/patient.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.PATIENTS_READ);

    const { id } = await context.params;
    const patient = await getPatientById(user, id);
    return apiSuccess(patient);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.PATIENTS_UPDATE);

    const { id } = await context.params;
    const body = await req.json();
    const input = updatePatientSchema.parse(body);
    const patient = await updatePatient(user, id, input);

    return apiSuccess(patient);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.PATIENTS_DELETE);

    const { id } = await context.params;
    const result = await deletePatient(user, id);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

