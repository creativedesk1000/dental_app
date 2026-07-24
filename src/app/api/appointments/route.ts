import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  handleApiError,
} from "@/lib/api-response";
import {
  getAuthSession,
  requirePermission,
  toSessionUser,
} from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import { z } from "zod";

const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.APPOINTMENTS_READ);

    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId");
    const filter = getTenantFilter(user, clinicId);

    // DOCTOR role: only see their own appointments
    const where: Record<string, unknown> = { ...filter };
    if (user.role === "DOCTOR") {
      where.doctorId = user.id;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, name: true, email: true } },
      },
    });

    return apiSuccess(appointments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.APPOINTMENTS_CREATE);

    const filter = getTenantFilter(user);

    const clinicId = "clinicId" in filter ? filter.clinicId : null;
    if (!clinicId) {
      return apiError("Clinic ID is required", 400);
    }

    const body = await req.json();
    const input = createAppointmentSchema.parse(body);

    // DOCTOR role: auto-assign to self, cannot create appointments for other doctors
    const doctorId = user.role === "DOCTOR" ? user.id : input.doctorId;

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(input.date),
        notes: input.notes,
        clinicId,
        patientId: input.patientId,
        doctorId,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, name: true, email: true } },
      },
    });

    return apiSuccess(appointment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

