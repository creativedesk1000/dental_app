import { prisma } from "@/lib/prisma";
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
import { createDoctorProfileSchema } from "@/lib/validations/doctor";
import {
  createDoctor,
  listDoctors,
} from "@/services/doctor.service";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.DOCTORS_READ);

    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId");
    const search = searchParams.get("search");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const doctors = await listDoctors(user, clinicId, search, includeInactive);
    return apiSuccess(doctors);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.DOCTORS_CREATE);

    const body = await req.json();
    const input = createDoctorProfileSchema.parse(body);
    const doctor = await createDoctor(user, input);

    return apiSuccess(doctor, 201);
  } catch (error) {
    return handleApiError(error);
  }
}


