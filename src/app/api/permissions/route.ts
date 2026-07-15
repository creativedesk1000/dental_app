import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  handleApiError,
} from "@/lib/api-response";
import { getAuthSession } from "@/lib/auth-guard";
import { ALL_PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  try {
    await getAuthSession();

    const dbPermissions = await prisma.permission.findMany({
      orderBy: { name: "asc" },
      include: {
        rolePermissions: {
          select: { role: true },
        },
      },
    });

    if (dbPermissions.length === 0) {
      return apiSuccess(ALL_PERMISSIONS);
    }

    return apiSuccess(
      dbPermissions.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        roles: p.rolePermissions.map((rp) => rp.role),
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}
