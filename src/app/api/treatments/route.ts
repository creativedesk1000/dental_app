import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listTreatments, createTreatment } from "@/services/treatment.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.clinicId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const doctorId = searchParams.get("doctorId") || undefined;
    const status = (searchParams.get("status") as any) || undefined;

    const data = await listTreatments({
      clinicId: session.user.clinicId,
      patientId,
      doctorId,
      status,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch treatments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.clinicId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title || !body.patientId) {
      return NextResponse.json(
        { success: false, message: "Title and Patient ID are required" },
        { status: 400 }
      );
    }

    const treatment = await createTreatment({
      ...body,
      clinicId: session.user.clinicId,
      doctorId: body.doctorId || session.user.id,
    });

    return NextResponse.json({ success: true, data: treatment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create treatment" },
      { status: 500 }
    );
  }
}
