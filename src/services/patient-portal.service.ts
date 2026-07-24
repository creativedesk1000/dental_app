import { prisma } from "@/lib/prisma";
import { Appointment, Treatment, Prescription, Notification, Patient, User } from "@prisma/client";

export async function getPatientForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      patientRecord: true,
      clinic: true,
    },
  });

  if (!user) return null;

  let patient = user.patientRecord;
  if (!patient && user.clinicId) {
    // If patient record doesn't exist yet, auto-link or create
    const names = (user.name || "Patient User").split(" ");
    const firstName = names[0] || "Patient";
    const lastName = names.slice(1).join(" ") || "User";

    patient = await prisma.patient.create({
      data: {
        userId: user.id,
        clinicId: user.clinicId,
        firstName,
        lastName,
        email: user.email,
      },
    });
  }

  return { user, patient };
}

export async function getPatientProfile(userId: string) {
  const data = await getPatientForUser(userId);
  if (!data || !data.patient) throw new Error("Patient not found");

  return {
    id: data.patient.id,
    firstName: data.patient.firstName,
    lastName: data.patient.lastName,
    email: data.patient.email || data.user.email,
    phone: data.patient.phone,
    dob: data.patient.dob,
    medicalHistory: data.patient.medicalHistory,
    allergies: data.patient.allergies,
    emergencyContact: data.patient.emergencyContact,
    clinicName: data.user.clinic?.name || "Dental Clinic",
  };
}

export async function updatePatientProfile(
  userId: string,
  input: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    medicalHistory?: string;
    allergies?: string;
    emergencyContact?: string;
  }
) {
  const data = await getPatientForUser(userId);
  if (!data || !data.patient) throw new Error("Patient not found");

  return prisma.patient.update({
    where: { id: data.patient.id },
    data: {
      ...(input.firstName && { firstName: input.firstName }),
      ...(input.lastName && { lastName: input.lastName }),
      ...(input.phone && { phone: input.phone }),
      ...(input.medicalHistory !== undefined && { medicalHistory: input.medicalHistory }),
      ...(input.allergies !== undefined && { allergies: input.allergies }),
      ...(input.emergencyContact !== undefined && { emergencyContact: input.emergencyContact }),
    },
  });
}

export async function getPatientDashboardData(userId: string) {
  const data = await getPatientForUser(userId);
  if (!data || !data.patient) {
    return {
      upcomingAppointment: null,
      pastAppointmentsCount: 0,
      activeTreatment: null,
      recentPrescriptions: [],
      unreadNotificationsCount: 0,
      assignedDoctor: null,
    };
  }

  const patientId = data.patient.id;

  const upcomingAppointment = await prisma.appointment.findFirst({
    where: {
      patientId,
      date: { gte: new Date() },
      status: { notIn: ["CANCELLED", "COMPLETED"] },
    },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          doctorProfile: { select: { specialty: true } },
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const pastAppointmentsCount = await prisma.appointment.count({
    where: { patientId },
  });

  const activeTreatment = await prisma.treatment.findFirst({
    where: {
      patientId,
      status: { in: ["PLANNED", "IN_PROGRESS"] },
    },
    include: {
      doctor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const recentPrescriptions = await prisma.prescription.findMany({
    where: { patientId },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      doctor: { select: { id: true, name: true } },
    },
  });

  const unreadNotificationsCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return {
    upcomingAppointment,
    pastAppointmentsCount,
    activeTreatment,
    recentPrescriptions,
    unreadNotificationsCount,
    clinicName: data.user.clinic?.name || "Dental Clinic",
  };
}

export async function getPatientAppointments(userId: string) {
  const data = await getPatientForUser(userId);
  if (!data || !data.patient) return [];

  return prisma.appointment.findMany({
    where: { patientId: data.patient.id },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          doctorProfile: { select: { specialty: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function bookPatientAppointment(
  userId: string,
  input: { doctorId: string; date: string; notes?: string }
) {
  const data = await getPatientForUser(userId);
  if (!data || !data.patient || !data.user.clinicId) {
    throw new Error("Patient or clinic context missing");
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: data.patient.id,
      doctorId: input.doctorId,
      clinicId: data.user.clinicId,
      date: new Date(input.date),
      notes: input.notes,
      status: "SCHEDULED",
    },
    include: {
      doctor: { select: { id: true, name: true } },
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      clinicId: data.user.clinicId,
      title: "Appointment Booked",
      message: `Your appointment is scheduled for ${new Date(input.date).toLocaleString()}`,
      type: "APPOINTMENT",
    },
  });

  return appointment;
}

export async function updatePatientAppointment(
  userId: string,
  appointmentId: string,
  input: { status?: string; newDate?: string }
) {
  const data = await getPatientForUser(userId);
  if (!data || !data.patient) throw new Error("Patient not found");

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, patientId: data.patient.id },
  });

  if (!appointment) throw new Error("Appointment not found");

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      ...(input.status && { status: input.status }),
      ...(input.newDate && { date: new Date(input.newDate) }),
    },
  });
}

export async function getPatientTreatments(userId: string) {
  const data = await getPatientForUser(userId);
  if (!data || !data.patient) return [];

  return prisma.treatment.findMany({
    where: { patientId: data.patient.id },
    include: {
      doctor: { select: { id: true, name: true } },
      prescriptions: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPatientPrescriptions(userId: string) {
  const data = await getPatientForUser(userId);
  if (!data || !data.patient) return [];

  return prisma.prescription.findMany({
    where: { patientId: data.patient.id },
    include: {
      doctor: { select: { id: true, name: true } },
      treatment: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPatientNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}
