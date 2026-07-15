import { z } from "zod";
import { ClinicStatus } from "@prisma/client";

export const createClinicSchema = z.object({
  name: z.string().min(2),
  subdomain: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9-]+$/),
  logo: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  adminName: z.string().min(2).optional(),
  adminEmail: z.string().email().optional(),
  adminPassword: z.string().min(8).optional(),
});

export const updateClinicSchema = z.object({
  name: z.string().min(2).optional(),
  logo: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.nativeEnum(ClinicStatus).optional(),
});
