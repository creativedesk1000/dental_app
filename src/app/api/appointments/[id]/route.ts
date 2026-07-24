import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  handleApiError,
  ApiException,
} from "@/lib/api-response";
import {
  getAuthSession,
  requirePermission,
  toSessionUser,
} from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { getTenantFilter } from "@/lib/tenant";
import { z } from "zod";

const updateAppointmentSchema = z.object({
  date: z.string().optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.APPOINTMENTS_READ);

    const { id } = await context.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, name: true, email: true } },
      },
    });

    if (!appointment) {
      throw new ApiException("Appointment not found", 404);
    }

    getTenantFilter(user, appointment.clinicId);
    return apiSuccess(appointment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.APPOINTMENTS_UPDATE);

    const { id } = await context.params;
    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiException("Appointment not found", 404);
    }

    getTenantFilter(user, existing.clinicId);

    // DOCTOR role: can only update their own appointments
    if (user.role === "DOCTOR" && existing.doctorId !== user.id) {
      throw new ApiException("You can only update your own appointments", 403);
    }

    const body = await req.json();
    const input = updateAppointmentSchema.parse(body);

    const data: Record<string, unknown> = {};
    if (input.date) data.date = new Date(input.date);
    if (input.notes !== undefined) data.notes = input.notes;
    if (input.status) data.status = input.status;
    if (input.doctorId) data.doctorId = input.doctorId;
    if (input.patientId) data.patientId = input.patientId;

    const appointment = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, name: true, email: true } },
      },
    });

    return apiSuccess(appointment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.APPOINTMENTS_DELETE);

    const { id } = await context.params;
    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiException("Appointment not found", 404);
    }

    getTenantFilter(user, existing.clinicId);

    await prisma.appointment.delete({ where: { id } });

    return apiSuccess({ message: "Appointment deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}

