import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return apiSuccess(clinics);
  } catch (error) {
    return handleApiError(error);
  }
}
