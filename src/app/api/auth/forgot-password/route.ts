import {
  apiSuccess,
  handleApiError,
  apiError,
} from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { forgotPassword } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`forgot-password:${ip}`, 5, 60_000);
    if (!limit.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const body = await req.json();
    const input = forgotPasswordSchema.parse(body);
    const result = await forgotPassword(input);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
