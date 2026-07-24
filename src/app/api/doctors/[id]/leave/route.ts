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
import { createLeaveSchema } from "@/lib/validations/doctor";
import {
  createLeave,
  listLeaves,
  updateLeaveStatus,
} from "@/services/doctor.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.DOCTORS_LEAVE);

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const leaves = await listLeaves(user, id, status || undefined);
    return apiSuccess(leaves);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.DOCTORS_LEAVE);

    const { id } = await context.params;
    const body = await req.json();

    // Support both creating leave and updating status
    if (body.status && ["APPROVED", "REJECTED"].includes(body.status)) {
      const result = await updateLeaveStatus(user, body.leaveId || id, {
        status: body.status,
      });
      return apiSuccess(result);
    }

    const input = createLeaveSchema.parse(body);
    const leave = await createLeave(user, id, input);

    return apiSuccess(leave, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

