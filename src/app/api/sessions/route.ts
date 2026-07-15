import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  handleApiError,
} from "@/lib/api-response";
import {
  getAuthSession,
  requirePermission,
  toSessionUser,
} from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import {
  listUserSessions,
  revokeAllOtherSessions,
  revokeUserSession,
} from "@/services/auth.service";

export async function GET() {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.SESSIONS_READ);

    const sessions = await listUserSessions(user.id);
    const currentTokenId = session.user.sessionTokenId;

    return apiSuccess(
      sessions.map((s) => ({
        ...s,
        isCurrent: s.tokenId === currentTokenId,
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.SESSIONS_REVOKE);

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");
    const revokeAll = searchParams.get("all") === "true";

    if (revokeAll) {
      const result = await revokeAllOtherSessions(
        user.id,
        session.user.sessionTokenId
      );
      return apiSuccess(result);
    }

    if (!sessionId) {
      return handleApiError(new Error("Session id or all=true is required"));
    }

    const result = await revokeUserSession(
      user.id,
      sessionId,
      session.user.sessionTokenId
    );
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
