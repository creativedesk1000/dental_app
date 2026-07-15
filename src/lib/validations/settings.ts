import { z } from "zod";

export const updateSettingsSchema = z.object({
  timezone: z.string().min(1).optional(),
  language: z.string().min(2).max(10).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  businessHours: z.string().optional().nullable(),
});
