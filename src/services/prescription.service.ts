import { prisma } from "@/lib/prisma";

export async function listPrescriptions(params: {
  clinicId: string;
  patientId?: string;
  doctorId?: string;
  treatmentId?: string;
}) {
  return prisma.prescription.findMany({
    where: {
      clinicId: params.clinicId,
      ...(params.patientId && { patientId: params.patientId }),
      ...(params.doctorId && { doctorId: params.doctorId }),
      ...(params.treatmentId && { treatmentId: params.treatmentId }),
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      doctor: { select: { id: true, name: true } },
      treatment: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPrescription(data: {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  treatmentId?: string;
}) {
  return prisma.prescription.create({
    data: {
      medication: data.medication,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration,
      instructions: data.instructions,
      clinicId: data.clinicId,
      patientId: data.patientId,
      doctorId: data.doctorId,
      treatmentId: data.treatmentId,
    },
  });
}
