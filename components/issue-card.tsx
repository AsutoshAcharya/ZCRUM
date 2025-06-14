import { Issue, IssueStatus } from "@/lib/generated/prisma";
import React, { FC, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import UserAvatar from "./user-avatar";
import { formatDistanceToNow } from "date-fns";
import Grow from "./ui/grow";
interface Props {
  issue: any;
  issueStatus: IssueStatus;
  showStatus?: boolean;
  onDelete: () => void;
  onUpdate: () => void;
}
const priorityColor: any = {
  LOW: "border-green-600",
  MEDIUM: "border-yellow-300",
  HIGH: "border-orange-400",
  URGENT: "border-red-400",
};

const IssueCard: FC<Props> = ({
  issue,
  showStatus,
  issueStatus,
  onDelete,
  onUpdate,
}) => {
  const [open, setOpen] = useState(false);
  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  return (
    <>
      <Grow>
        <Card
          className={`border-0 border-t-2 ${
            priorityColor[issue?.priority]
          } rounded-lg cursor-pointer transition-shadow hover:shadow-lg hover:shadow-blue-500/30`}
        >
          <CardHeader className={``}>
            <CardTitle>{issue.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 -mt-3">
            {showStatus && issueStatus?.name && (
              <Badge variant="outline">{issueStatus?.name}</Badge>
            )}
            <Badge variant="outline">{issue?.priority}</Badge>
          </CardContent>
          <CardFooter>
            <UserAvatar user={issue?.assignee} />
            <div className="text-xs text-gray-400 w-full">
              Created {created}
            </div>
          </CardFooter>
        </Card>
      </Grow>
      {open && <></>}
    </>
  );
};

export default IssueCard;
