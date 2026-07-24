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
import {
  getAvailability,
  listDoctors,
} from "@/services/doctor.service";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.DOCTORS_READ);

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const clinicId = searchParams.get("clinicId");

    if (!startDate || !endDate) {
      return apiSuccess([]);
    }

    // If no specific doctor, return availability for all doctors
    if (!doctorId) {
      const doctors = await listDoctors(user, clinicId);
      const allAvailability = await Promise.all(
        doctors.map((doc) =>
          getAvailability(user, doc.id, startDate, endDate).then((avail) => ({
            doctorId: doc.id,
            doctorName: doc.name,
            availability: avail,
          }))
        )
      );
      return apiSuccess(allAvailability);
    }

    const availability = await getAvailability(user, doctorId, startDate, endDate);
    return apiSuccess(availability);
  } catch (error) {
    return handleApiError(error);
  }
}

