import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPatientProfile, updatePatientProfile } from "@/services/patient-portal.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await getPatientProfile(session.user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updatePatientProfile(session.user.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
