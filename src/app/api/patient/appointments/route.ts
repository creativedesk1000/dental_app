import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPatientAppointments, bookPatientAppointment } from "@/services/patient-portal.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await getPatientAppointments(session.user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.doctorId || !body.date) {
      return NextResponse.json(
        { success: false, message: "Doctor and Date are required" },
        { status: 400 }
      );
    }

    const appointment = await bookPatientAppointment(session.user.id, body);
    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to book appointment" },
      { status: 500 }
    );
  }
}
