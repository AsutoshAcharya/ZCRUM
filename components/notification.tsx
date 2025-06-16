"use client";
import {
  deleteNotification,
  getUserNotifications,
  markRead,
} from "@/actions/notification";
import useFetch from "@/hooks/useFetch";
import { getPusherClient } from "@/lib/pusher";
import { Bell, Check, CheckCheck, Eye, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Notification = ({ userId }: { userId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    fn: getNotifications,
    isLoading,
    data: notifications,
    setData: setNotifications,
  } = useFetch(getUserNotifications);

  useEffect(() => {
    if (!userId) return;
    const channelName = `issue-created-${userId}`;
    const pusherClient = getPusherClient();
    const channel = pusherClient.subscribe(channelName);
    channel.bind("issue-assigned", (data: any) => {
      console.log("Received event data:", data);
      getNotifications(userId);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusherClient.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    getNotifications(userId);
  }, [userId]);

  const totalUnread = useMemo(() => {
    return notifications?.filter((n) => !n.read).length || 0;
  }, [notifications, isLoading]);

  const { data, fn: markReadFn } = useFetch(markRead);

  async function handleMarkAsRead(notificationId: string) {
    setNotifications((prev) =>
      prev?.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    toast.success("Notification marked as read");
    await markReadFn(notificationId, userId);
  }

  async function handleMarkAllAsRead() {
    setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
    await markReadFn("", userId, true);
  }

  async function handleDeleteAll() {
    setNotifications([]);
    toast.success("All notifications has been deleted");
    await deleteNotification(userId);
  }

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const router = useRouter();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-120 p-2" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-3">
            {totalUnread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications && notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAll}
                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>
        <Separator />

        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-2">
              {notifications.map((notification, index: number) => (
                <Card
                  key={notification.id || index}
                  className={`mb-2 border-0 shadow-none ${
                    !notification.read
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : "bg-transparent"
                  }`}
                  onClick={() => {
                    router.push(
                      `/project/${notification?.issue?.projectId}?sprint=${notification?.issue?.sprintId}`
                    );
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }

                    setIsOpen(false);
                  }}
                >
                  <CardContent className="p-3 cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                          <p className="text-sm font-medium truncate">
                            New Notification
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 italic font-semibold">
                          {notification.message || "No message content"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 justify-center flex-shrink-0 my-auto">
                        {!notification.read && (
                          <Tooltip>
                            <TooltipTrigger
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>Mark as read</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default Notification;
