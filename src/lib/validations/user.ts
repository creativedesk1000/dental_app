import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role).refine((r) => r !== Role.SUPER_ADMIN, {
    message: "Cannot create super admin users via API",
  }),
  clinicId: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z
    .nativeEnum(Role)
    .refine((r) => r !== Role.SUPER_ADMIN, {
      message: "Cannot assign super admin role via API",
    })
    .optional(),
  password: z.string().min(8).optional(),
});
