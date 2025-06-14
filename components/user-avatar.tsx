import React, { FC } from "react";
import { AvatarImage, Avatar, AvatarFallback } from "./ui/avatar";
import toAvatar from "@/lib/toAvatar";
interface Props {
  user: any;
}
const UserAvatar: FC<Props> = ({ user }) => {
  return (
    <div className="flex items-center space-x-2 w-full">
      <Avatar className="w-10 h-10">
        <AvatarImage src={user?.imageUrl} alt={toAvatar(user?.name)} />
        <AvatarFallback>{user ? toAvatar(user?.name) : "?"}</AvatarFallback>
      </Avatar>
      <span className="text-xs text-gray-500">
        {user ? user?.name : "Unassigned"}
      </span>
    </div>
  );
};

export default UserAvatar;
