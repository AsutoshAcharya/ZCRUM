"use server";
import { db } from "@/lib/prisma";
import { checkUserAuthorization } from "./checkUserAuthorization";

export async function getUserNotifications(userId: string) {
  await checkUserAuthorization({});
  const notifications = db.notification.findMany({
    where: {
      userId,
    },
    include: { issue: true },
    orderBy: { createdAt: "desc" },
  });
  return notifications;
}

export async function markRead(
  notificationId: string,
  userId: string,
  bulkMark: boolean = false
) {
  await checkUserAuthorization({});

  if (bulkMark) {
    if (!userId) throw new Error("User not found");
    const bulkMarkRead = await db.notification.updateMany({
      where: {
        userId: userId,
      },
      data: {
        read: true,
      },
    });
    return { success: true, bulkMarkRead };
  }
  const markedRead = await db.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      read: true,
    },
  });
  return { success: true, markedRead };
}

export async function deleteNotification(userId: string) {
  await checkUserAuthorization({});

  await db.notification.deleteMany({
    where: {
      userId,
    },
  });

  return { success: true, message: "Notifications deleted" };
}
