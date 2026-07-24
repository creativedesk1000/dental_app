import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listNotifications, createNotification, markAsRead } from "@/services/notification.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await listNotifications(session.user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch notifications" },
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
    if (!body.userId || !body.title || !body.message) {
      return NextResponse.json(
        { success: false, message: "userId, title, and message are required" },
        { status: 400 }
      );
    }

    const notification = await createNotification({
      ...body,
      clinicId: session.user.clinicId,
    });

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create notification" },
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

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: "Notification ID required" }, { status: 400 });
    }

    await markAsRead(id, session.user.id);
    return NextResponse.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}
