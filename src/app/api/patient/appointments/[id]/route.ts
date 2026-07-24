import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updatePatientAppointment } from "@/services/patient-portal.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const updated = await updatePatientAppointment(session.user.id, id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update appointment" },
      { status: 500 }
    );
  }
}
