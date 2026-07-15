import {
  apiSuccess,
  handleApiError,
  apiError,
} from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { resendVerificationSchema } from "@/lib/validations/auth";
import { resendVerificationEmail } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`resend-verification:${ip}`, 3, 60_000);
    if (!limit.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const body = await req.json();
    const input = resendVerificationSchema.parse(body);
    const result = await resendVerificationEmail(input.email);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
