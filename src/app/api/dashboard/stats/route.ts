import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  handleApiError,
} from "@/lib/api-response";
import { getAuthSession, toSessionUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);

    if (!user.clinicId) {
      return apiSuccess({
        totalPatients: 0,
        todayAppointments: 0,
        doctors: 0,
        revenue: 0,
        activeUsers: 0,
      });
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const isDoctor = user.role === "DOCTOR";

    // DOCTOR role: scope stats to their own data only
    const patientWhere = isDoctor
      ? {
          clinicId: user.clinicId,
          appointments: { some: { doctorId: user.id } },
        }
      : { clinicId: user.clinicId };

    const appointmentWhere = isDoctor
      ? {
          clinicId: user.clinicId,
          doctorId: user.id,
          date: { gte: startOfToday, lte: endOfToday },
        }
      : {
          clinicId: user.clinicId,
          date: { gte: startOfToday, lte: endOfToday },
        };

    const [
      totalPatients,
      todayAppointments,
      doctors,
      activeSessions,
      subscription,
    ] = await Promise.all([
      prisma.patient.count({ where: patientWhere }),
      prisma.appointment.count({ where: appointmentWhere }),
      prisma.user.count({
        where: { clinicId: user.clinicId, role: "DOCTOR" },
      }),
      prisma.userSession.count({
        where: {
          expiresAt: { gt: now },
          user: { clinicId: user.clinicId },
        },
      }),
      prisma.subscription.findUnique({
        where: { clinicId: user.clinicId },
        select: { plan: true, status: true },
      }),
    ]);

    const planRevenueMap: Record<string, number> = {
      STARTER: 149,
      GROWTH: 299,
      ENTERPRISE: 499,
    };
    const revenue =
      subscription && subscription.status === "ACTIVE"
        ? planRevenueMap[subscription.plan] ?? 0
        : 0;

    return apiSuccess({
      totalPatients,
      todayAppointments,
      doctors: isDoctor ? 1 : doctors, // For doctor, show 1 (themselves)
      revenue,
      activeUsers: activeSessions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
