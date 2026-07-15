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
import { createClinicSchema } from "@/lib/validations/clinic";
import { createClinic, listClinics } from "@/services/clinic.service";

export async function GET() {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.CLINICS_READ);

    const clinics = await listClinics();
    return apiSuccess(clinics);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.CLINICS_CREATE);

    const body = await req.json();
    const input = createClinicSchema.parse(body);
    const clinic = await createClinic(input, user.id);

    return apiSuccess(clinic, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
