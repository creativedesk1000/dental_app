import {
  apiSuccess,
  handleApiError,
  apiError,
} from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { resetPassword } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`reset-password:${ip}`, 5, 60_000);
    if (!limit.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const body = await req.json();
    const input = resetPasswordSchema.parse(body);
    const result = await resetPassword(input);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
