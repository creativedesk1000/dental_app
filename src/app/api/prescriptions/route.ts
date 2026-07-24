import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listPrescriptions, createPrescription } from "@/services/prescription.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.clinicId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const doctorId = searchParams.get("doctorId") || undefined;
    const treatmentId = searchParams.get("treatmentId") || undefined;

    const data = await listPrescriptions({
      clinicId: session.user.clinicId,
      patientId,
      doctorId,
      treatmentId,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch prescriptions" },
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
    if (!body.medication || !body.dosage || !body.patientId) {
      return NextResponse.json(
        { success: false, message: "Medication, Dosage, and Patient ID are required" },
        { status: 400 }
      );
    }

    const prescription = await createPrescription({
      ...body,
      clinicId: session.user.clinicId,
      doctorId: body.doctorId || session.user.id,
    });

    return NextResponse.json({ success: true, data: prescription }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create prescription" },
      { status: 500 }
    );
  }
}
