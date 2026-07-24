import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiException } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { getTenantFilter, type SessionUser } from "@/lib/tenant";
import type { z } from "zod";
import type {
  createDoctorProfileSchema,
  updateDoctorProfileSchema,
  createScheduleSchema,
  updateScheduleSchema,
  createLeaveSchema,
  updateLeaveSchema,
} from "@/lib/validations/doctor";

type CreateDoctorInput = z.infer<typeof createDoctorProfileSchema>;
type UpdateDoctorInput = z.infer<typeof updateDoctorProfileSchema>;
type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
type UpdateLeaveInput = z.infer<typeof updateLeaveSchema>;

const doctorSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  clinicId: true,
  doctorProfile: {
    select: {
      id: true,
      specialty: true,
      qualification: true,
      experienceYears: true,
      consultationFee: true,
      licenseNumber: true,
      bio: true,
      isActive: true,
    },
  },
  _count: {
    select: { appointments: true },
  },
};

export async function listDoctors(
  actor: SessionUser,
  clinicId?: string | null,
  search?: string | null,
  includeInactive?: boolean
) {
  const filter = getTenantFilter(actor, clinicId);

  const where: Record<string, unknown> = {
    ...filter,
    role: "DOCTOR",
  };

  if (!includeInactive) {
    where.OR = [
      { doctorProfile: { isActive: true } },
      { doctorProfile: null },
    ];
  }

  if (search) {
    where.AND = [
      where.OR || {},
      {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { doctorProfile: { specialty: { contains: search, mode: "insensitive" } } },
        ],
      },
    ];
    delete where.OR;
  }

  return prisma.user.findMany({
    where,
    orderBy: { name: "asc" },
    select: doctorSelect,
  });
}

export async function getDoctorById(actor: SessionUser, id: string) {
  const doctor = await prisma.user.findFirst({
    where: { id, role: "DOCTOR" },
    select: {
      ...doctorSelect,
      doctorSchedule: {
        orderBy: { dayOfWeek: "asc" },
      },
      leaves: {
        where: { status: { in: ["PENDING", "APPROVED"] } },
        orderBy: { startDate: "desc" },
        take: 10,
      },
      clinic: { select: { id: true, name: true } },
    },
  });

  if (!doctor) {
    throw new ApiException("Doctor not found", 404);
  }

  getTenantFilter(actor, doctor.clinicId);
  return doctor;
}

export async function createDoctor(actor: SessionUser, input: CreateDoctorInput) {
  const clinicId =
    actor.role === "SUPER_ADMIN"
      ? input.clinicId
      : actor.clinicId;

  if (!clinicId) {
    throw new ApiException("Clinic ID is required", 400);
  }

  getTenantFilter(actor, clinicId);

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new ApiException("Email already exists", 409);
  }

  const password = input.password || "Doctor@123";
  const hashedPassword = await bcrypt.hash(password, 12);

  const doctor = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: "DOCTOR",
      clinicId,
      doctorProfile: {
        create: {
          specialty: input.specialty || null,
          qualification: input.qualification || null,
          experienceYears: input.experienceYears || null,
          consultationFee: input.consultationFee || null,
          licenseNumber: input.licenseNumber || null,
          bio: input.bio || null,
          isActive: input.isActive ?? true,
        },
      },
    },
    select: doctorSelect,
  });

  await createAuditLog({
    action: "DOCTOR_CREATED",
    entity: "Doctor",
    entityId: doctor.id,
    userId: actor.id,
    clinicId,
    details: { name: doctor.name, email: doctor.email },
  });

  return doctor;
}

export async function updateDoctor(
  actor: SessionUser,
  id: string,
  input: UpdateDoctorInput
) {
  const existing = await prisma.user.findFirst({
    where: { id, role: "DOCTOR" },
    include: { doctorProfile: true, clinic: { select: { id: true } } },
  });

  if (!existing) {
    throw new ApiException("Doctor not found", 404);
  }

  getTenantFilter(actor, existing.clinicId!);

  if (input.email && input.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (emailTaken) {
      throw new ApiException("Email already exists", 409);
    }
  }

  const { name, email, ...profileFields } = input;

  const doctor = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      doctorProfile: {
        upsert: {
          create: {
            specialty: profileFields.specialty || null,
            qualification: profileFields.qualification || null,
            experienceYears: profileFields.experienceYears || null,
            consultationFee: profileFields.consultationFee || null,
            licenseNumber: profileFields.licenseNumber || null,
            bio: profileFields.bio || null,
            isActive: profileFields.isActive ?? true,
          },
          update: {
            ...(profileFields.specialty !== undefined && { specialty: profileFields.specialty }),
            ...(profileFields.qualification !== undefined && { qualification: profileFields.qualification }),
            ...(profileFields.experienceYears !== undefined && { experienceYears: profileFields.experienceYears }),
            ...(profileFields.consultationFee !== undefined && { consultationFee: profileFields.consultationFee }),
            ...(profileFields.licenseNumber !== undefined && { licenseNumber: profileFields.licenseNumber }),
            ...(profileFields.bio !== undefined && { bio: profileFields.bio }),
            ...(profileFields.isActive !== undefined && { isActive: profileFields.isActive }),
          },
        },
      },
    },
    select: doctorSelect,
  });

  await createAuditLog({
    action: "DOCTOR_UPDATED",
    entity: "Doctor",
    entityId: doctor.id,
    userId: actor.id,
    clinicId: existing.clinicId!,
    details: { name: doctor.name, email: doctor.email },
  });

  return doctor;
}

export async function deleteDoctor(actor: SessionUser, id: string) {
  const existing = await prisma.user.findFirst({
    where: { id, role: "DOCTOR" },
    include: { clinic: { select: { id: true } } },
  });

  if (!existing) {
    throw new ApiException("Doctor not found", 404);
  }

  getTenantFilter(actor, existing.clinicId!);

  // Delete associated appointments, schedules, leaves, profile
  await prisma.appointment.deleteMany({ where: { doctorId: id } });
  await prisma.doctorSchedule.deleteMany({ where: { userId: id } });
  await prisma.leave.deleteMany({ where: { userId: id } });
  await prisma.doctorProfile.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  await createAuditLog({
    action: "DOCTOR_DELETED",
    entity: "Doctor",
    entityId: id,
    userId: actor.id,
    clinicId: existing.clinicId!,
    details: { name: existing.name },
  });

  return { message: "Doctor deleted" };
}

// --- Working Hours / Schedule ---

const DAY_ORDER: Record<string, number> = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
};

export async function getWorkingHours(actor: SessionUser, doctorId: string) {
  const doctor = await prisma.user.findFirst({
    where: { id: doctorId, role: "DOCTOR" },
    select: { clinicId: true },
  });

  if (!doctor) {
    throw new ApiException("Doctor not found", 404);
  }

  getTenantFilter(actor, doctor.clinicId!);

  const schedules = await prisma.doctorSchedule.findMany({
    where: { userId: doctorId },
    orderBy: { dayOfWeek: "asc" },
  });

  // Sort by day order
  schedules.sort((a, b) => DAY_ORDER[a.dayOfWeek] - DAY_ORDER[b.dayOfWeek]);

  return schedules;
}

export async function upsertWorkingHours(
  actor: SessionUser,
  doctorId: string,
  schedules: CreateScheduleInput[]
) {
  const doctor = await prisma.user.findFirst({
    where: { id: doctorId, role: "DOCTOR" },
    select: { clinicId: true },
  });

  if (!doctor) {
    throw new ApiException("Doctor not found", 404);
  }

  getTenantFilter(actor, doctor.clinicId!);

  // Validate time ranges
  for (const schedule of schedules) {
    if (schedule.startTime >= schedule.endTime) {
      throw new ApiException(
        `End time must be after start time for ${schedule.dayOfWeek}`,
        400
      );
    }
  }

  // Delete existing schedules and recreate
  await prisma.doctorSchedule.deleteMany({
    where: { userId: doctorId },
  });

  const created = await Promise.all(
    schedules.map((s) =>
      prisma.doctorSchedule.create({
        data: {
          userId: doctorId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isAvailable: s.isAvailable ?? true,
          slotDuration: s.slotDuration ?? 30,
        },
      })
    )
  );

  await createAuditLog({
    action: "DOCTOR_SCHEDULE_UPDATED",
    entity: "DoctorSchedule",
    entityId: doctorId,
    userId: actor.id,
    clinicId: doctor.clinicId!,
    details: { schedules: schedules.length },
  });

  created.sort((a, b) => DAY_ORDER[a.dayOfWeek] - DAY_ORDER[b.dayOfWeek]);
  return created;
}

// --- Availability ---

export async function getAvailability(
  actor: SessionUser,
  doctorId: string,
  startDateStr: string,
  endDateStr: string
) {
  const doctor = await prisma.user.findFirst({
    where: { id: doctorId, role: "DOCTOR" },
    select: { clinicId: true },
  });

  if (!doctor) {
    throw new ApiException("Doctor not found", 404);
  }

  getTenantFilter(actor, doctor.clinicId!);

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Get all schedules for the doctor
  const schedules = await prisma.doctorSchedule.findMany({
    where: { userId: doctorId, isAvailable: true },
  });

  // Get leaves that overlap with the date range
  const leaves = await prisma.leave.findMany({
    where: {
      userId: doctorId,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });

  const DAY_MAP: Record<number, string> = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
  };

  const scheduleMap = new Map<string, typeof schedules[0]>();
  for (const s of schedules) {
    scheduleMap.set(s.dayOfWeek, s);
  }

  const availability: Array<{
    date: string;
    dayOfWeek: string;
    isAvailable: boolean;
    startTime: string | null;
    endTime: string | null;
    slotDuration: number | null;
    leaveType: string | null;
  }> = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const dayName = DAY_MAP[current.getDay()];

    // Check if on leave
    const leave = leaves.find(
      (l) =>
        l.startDate <= new Date(dateStr) && l.endDate >= new Date(dateStr)
    );

    const schedule = scheduleMap.get(dayName);

    availability.push({
      date: dateStr,
      dayOfWeek: dayName,
      isAvailable: !leave && !!schedule,
      startTime: schedule?.startTime || null,
      endTime: schedule?.endTime || null,
      slotDuration: schedule?.slotDuration || null,
      leaveType: leave?.type || null,
    });

    current.setDate(current.getDate() + 1);
  }

  return availability;
}

// --- Leave Management ---

export async function listLeaves(
  actor: SessionUser,
  doctorId?: string,
  status?: string,
  clinicId?: string
) {
  const filter = getTenantFilter(actor, clinicId);

  const where: Record<string, unknown> = {
    ...filter,
  };

  if (doctorId) {
    where.userId = doctorId;
  }

  if (status) {
    where.status = status;
  }

  return prisma.leave.findMany({
    where,
    orderBy: { startDate: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          doctorProfile: {
            select: { specialty: true },
          },
        },
      },
      approvedBy: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function createLeave(
  actor: SessionUser,
  doctorId: string,
  input: CreateLeaveInput
) {
  const doctor = await prisma.user.findFirst({
    where: { id: doctorId, role: "DOCTOR" },
    select: { clinicId: true },
  });

  if (!doctor) {
    throw new ApiException("Doctor not found", 404);
  }

  getTenantFilter(actor, doctor.clinicId!);

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (endDate < startDate) {
    throw new ApiException("End date must be on or after start date", 400);
  }

  // Check for overlapping leaves
  const overlapping = await prisma.leave.findFirst({
    where: {
      userId: doctorId,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });

  if (overlapping) {
    throw new ApiException(
      "Leave already exists for this date range",
      409
    );
  }

  const leave = await prisma.leave.create({
    data: {
      userId: doctorId,
      startDate,
      endDate,
      reason: input.reason || null,
      type: input.type || "OTHER",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          doctorProfile: { select: { specialty: true } },
        },
      },
    },
  });

  await createAuditLog({
    action: "LEAVE_CREATED",
    entity: "Leave",
    entityId: leave.id,
    userId: actor.id,
    clinicId: doctor.clinicId!,
    details: {
      doctorId,
      startDate: input.startDate,
      endDate: input.endDate,
      type: leave.type,
    },
  });

  return leave;
}

export async function updateLeaveStatus(
  actor: SessionUser,
  leaveId: string,
  input: { status: "APPROVED" | "REJECTED" }
) {
  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
    include: { user: { select: { clinicId: true } } },
  });

  if (!leave) {
    throw new ApiException("Leave not found", 404);
  }

  getTenantFilter(actor, leave.user.clinicId!);

  if (leave.status !== "PENDING") {
    throw new ApiException("Leave is already " + leave.status.toLowerCase(), 400);
  }

  const updated = await prisma.leave.update({
    where: { id: leaveId },
    data: {
      status: input.status,
      approvedById: actor.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          doctorProfile: { select: { specialty: true } },
        },
      },
      approvedBy: {
        select: { id: true, name: true },
      },
    },
  });

  await createAuditLog({
    action: `LEAVE_${input.status}`,
    entity: "Leave",
    entityId: leave.id,
    userId: actor.id,
    clinicId: leave.user.clinicId!,
    details: {
      doctorId: leave.userId,
      status: input.status,
    },
  });

  return updated;
}

