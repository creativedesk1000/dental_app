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
import { updateDoctorProfileSchema } from "@/lib/validations/doctor";
import {
  deleteDoctor,
  getDoctorById,
  updateDoctor,
} from "@/services/doctor.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.DOCTORS_READ);

    const { id } = await context.params;
    const doctor = await getDoctorById(user, id);
    return apiSuccess(doctor);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.DOCTORS_UPDATE);

    const { id } = await context.params;
    const body = await req.json();
    const input = updateDoctorProfileSchema.parse(body);
    const doctor = await updateDoctor(user, id, input);

    return apiSuccess(doctor);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.DOCTORS_DELETE);

    const { id } = await context.params;
    const result = await deleteDoctor(user, id);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

