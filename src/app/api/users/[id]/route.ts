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
import { updateUserSchema } from "@/lib/validations/user";
import {
  deleteUser,
  getUserById,
  updateUser,
} from "@/services/user.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.USERS_READ);

    const { id } = await context.params;
    const target = await getUserById(user, id);
    return apiSuccess(target);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.USERS_UPDATE);

    const { id } = await context.params;
    const body = await req.json();
    const input = updateUserSchema.parse(body);
    const updated = await updateUser(user, id, input);

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.USERS_DELETE);

    const { id } = await context.params;
    const result = await deleteUser(user, id);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
