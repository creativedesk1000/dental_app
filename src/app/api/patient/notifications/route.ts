import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPatientNotifications, markNotificationAsRead } from "@/services/patient-portal.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await getPatientNotifications(session.user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch notifications" },
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

    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json({ success: false, message: "Missing notificationId" }, { status: 400 });
    }

    await markNotificationAsRead(session.user.id, notificationId);
    return NextResponse.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
