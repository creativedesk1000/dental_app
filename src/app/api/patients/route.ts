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
import { createPatientSchema } from "@/lib/validations/patient";
import { createPatient, listPatients } from "@/services/patient.service";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.PATIENTS_READ);

    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId");
    const search = searchParams.get("search");

    const patients = await listPatients(user, clinicId, search);
    return apiSuccess(patients);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.PATIENTS_CREATE);

    const body = await req.json();
    const input = createPatientSchema.parse(body);
    const patient = await createPatient(user, input);

    return apiSuccess(patient, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

