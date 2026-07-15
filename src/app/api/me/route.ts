import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  handleApiError,
} from "@/lib/api-response";
import { getAuthSession } from "@/lib/auth-guard";

export async function GET() {
  try {
    const session = await getAuthSession();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clinicId: true,
        emailVerified: true,
        image: true,
        lastLoginAt: true,
        clinic: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logo: true,
            status: true,
          },
        },
      },
    });

    return apiSuccess({ user, sessionTokenId: session.user.sessionTokenId });
  } catch (error) {
    return handleApiError(error);
  }
}
