import { z } from "zod";

export const createDoctorProfileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  specialty: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0).optional().nullable(),
  consultationFee: z.number().min(0).optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  clinicId: z.string().optional(),
});

export const updateDoctorProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  specialty: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0).optional().nullable(),
  consultationFee: z.number().min(0).optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const createScheduleSchema = z.object({
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:mm format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:mm format"),
  isAvailable: z.boolean().optional(),
  slotDuration: z.number().int().min(5).max(120).optional(),
});

export const updateScheduleSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:mm format").optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:mm format").optional(),
  isAvailable: z.boolean().optional(),
  slotDuration: z.number().int().min(5).max(120).optional(),
});

export const createLeaveSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  reason: z.string().optional().nullable(),
  type: z.enum(["VACATION", "SICK", "PERSONAL", "OTHER"]).optional(),
});

export const updateLeaveSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  reason: z.string().optional().nullable(),
  type: z.enum(["VACATION", "SICK", "PERSONAL", "OTHER"]).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional(),
});

export const availabilityQuerySchema = z.object({
  doctorId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD").optional(),
  clinicId: z.string().optional(),
});

export type CreateDoctorProfileInput = z.infer<typeof createDoctorProfileSchema>;
export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type UpdateLeaveInput = z.infer<typeof updateLeaveSchema>;

