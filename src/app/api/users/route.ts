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
import { createUserSchema } from "@/lib/validations/user";
import { createUser, listUsers } from "@/services/user.service";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.USERS_READ);

    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId") || undefined;
    const users = await listUsers(user, clinicId);

    return apiSuccess(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.USERS_CREATE);

    const body = await req.json();
    const input = createUserSchema.parse(body);
    const created = await createUser(user, input);

    return apiSuccess(created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
