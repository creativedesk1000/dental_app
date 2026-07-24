import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPatientDashboardData } from "@/services/patient-portal.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await getPatientDashboardData(session.user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch patient dashboard" },
      { status: 500 }
    );
  }
}
