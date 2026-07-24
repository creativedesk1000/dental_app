import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createNotification(data: {
  userId: string;
  clinicId: string;
  title: string;
  message: string;
  type?: NotificationType;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      clinicId: data.clinicId,
      title: data.title,
      message: data.message,
      type: data.type || "GENERAL",
    },
  });
}

export async function markAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}
