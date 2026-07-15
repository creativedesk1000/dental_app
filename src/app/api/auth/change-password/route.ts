import {
  apiSuccess,
  handleApiError,
  apiError,
} from "@/lib/api-response";
import { getAuthSession, toSessionUser } from "@/lib/auth-guard";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { changePasswordSchema } from "@/lib/validations/auth";
import { changePassword } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`change-password:${ip}`, 5, 60_000);
    if (!limit.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const session = await getAuthSession();
    const user = toSessionUser(session);

    const body = await req.json();
    const input = changePasswordSchema.parse(body);
    const result = await changePassword(
      user.id,
      input,
      session.user.sessionTokenId
    );

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
