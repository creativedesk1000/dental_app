import {
  apiSuccess,
  handleApiError,
  apiError,
} from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { verifyEmail } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`verify-email:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const body = await req.json();
    const input = verifyEmailSchema.parse(body);
    const result = await verifyEmail(input);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return apiError("Email and token are required", 400);
    }

    const result = await verifyEmail({ email, token });
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
