import {
  apiError,
  apiSuccess,
  handleApiError,
} from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  registerClinicSchema,
} from "@/lib/validations/auth";
import { registerClinic } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`register:${ip}`, 5, 60_000);
    if (!limit.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const body = await req.json();
    const input = registerClinicSchema.parse(body);
    const result = await registerClinic(input);

    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
