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
import { createScheduleSchema } from "@/lib/validations/doctor";
import {
  getWorkingHours,
  upsertWorkingHours,
} from "@/services/doctor.service";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.DOCTORS_SCHEDULE);

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return apiSuccess([]);
    }

    const schedules = await getWorkingHours(user, doctorId);
    return apiSuccess(schedules);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.DOCTORS_SCHEDULE);

    const body = await req.json();
    const { doctorId, schedules } = body;

    if (!doctorId) {
      return apiSuccess({ error: "doctorId is required" });
    }

    const parsedSchedules = schedules.map((s: Record<string, unknown>) =>
      createScheduleSchema.parse(s)
    );

    const result = await upsertWorkingHours(user, doctorId, parsedSchedules);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

