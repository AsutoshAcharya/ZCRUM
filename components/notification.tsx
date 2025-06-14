"use client";
import { getPusherClient } from "@/lib/pusher";
import { useAuth } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import Pusher from "pusher-js";
import { useEffect } from "react";

const Notification = () => {
  const { userId } = useAuth();
  useEffect(() => {
    if (!userId) return;
    const pusherClient = getPusherClient();
    const channel = pusherClient.subscribe(`issue-created-${userId}`);
    console.log(`issue-created-${userId}`);
    channel.bind("issue-assigned", (data: any) => {
      console.log("📬 New issue assigned:", data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusherClient.disconnect();
    };
  }, [userId]);

  return (
    <div>
      <Bell />
    </div>
  );
};

export default Notification;
