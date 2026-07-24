import { prisma } from "@/lib/prisma";
import { TreatmentStatus } from "@prisma/client";

export async function listTreatments(params: {
  clinicId: string;
  patientId?: string;
  doctorId?: string;
  status?: TreatmentStatus;
}) {
  return prisma.treatment.findMany({
    where: {
      clinicId: params.clinicId,
      ...(params.patientId && { patientId: params.patientId }),
      ...(params.doctorId && { doctorId: params.doctorId }),
      ...(params.status && { status: params.status }),
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, email: true } },
      doctor: { select: { id: true, name: true } },
      prescriptions: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTreatment(data: {
  title: string;
  description?: string;
  status?: TreatmentStatus;
  notes?: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
}) {
  return prisma.treatment.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || "PLANNED",
      notes: data.notes,
      clinicId: data.clinicId,
      patientId: data.patientId,
      doctorId: data.doctorId,
    },
  });
}

export async function updateTreatment(
  id: string,
  clinicId: string,
  data: {
    title?: string;
    description?: string;
    status?: TreatmentStatus;
    notes?: string;
    endDate?: Date;
  }
) {
  return prisma.treatment.updateMany({
    where: { id, clinicId },
    data,
  });
}
