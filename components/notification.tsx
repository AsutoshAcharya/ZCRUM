"use client";

import { useAuth } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import Pusher from "pusher-js";
import { useEffect } from "react";

const Notification = () => {
  const { userId } = useAuth();
  useEffect(() => {
    if (!userId) return;
    console.log("here");
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
    });

    const channel = pusher.subscribe(`issue-created-${userId}`);
    console.log(`issue-created-${userId}`);
    channel.bind("issue-assigned", (data: any) => {
      console.log("📬 New issue assigned:", data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  return (
    <div>
      <Bell />
    </div>
  );
};

export default Notification;
