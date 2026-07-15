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
import { updateSettingsSchema } from "@/lib/validations/settings";
import { getSettings, updateSettings } from "@/services/settings.service";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.SETTINGS_READ);

    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId") || undefined;
    const settings = await getSettings(user, clinicId);

    return apiSuccess(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    const user = toSessionUser(session);
    await requirePermission(user, PERMISSIONS.SETTINGS_UPDATE);

    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId") || undefined;
    const body = await req.json();
    const input = updateSettingsSchema.parse(body);
    const settings = await updateSettings(user, input, clinicId);

    return apiSuccess(settings);
  } catch (error) {
    return handleApiError(error);
  }
}
