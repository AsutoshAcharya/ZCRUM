"use client";
import { IssueStatus } from "@/lib/generated/prisma";
import React, { FC, HTMLAttributes, useState } from "react";
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

import IssueDetailsDialog from "./issue-details-dialog";
import { toast } from "sonner";
interface Props extends HTMLAttributes<HTMLDivElement> {
  issue: any;
  issueStatus: IssueStatus;
  showStatus?: boolean;
  onDelete: () => void;
  onUpdate: () => void;
  statuses: Array<IssueStatus>;
}
const priorityColor: any = {
  LOW: "border-green-600",
  MEDIUM: "border-yellow-300",
  HIGH: "border-orange-400",
  URGENT: "border-red-400",
};

const IssueCard: FC<Props> = ({
  issue,
  showStatus = false,
  issueStatus,
  onDelete,
  onUpdate,
  statuses,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  // const router = useRouter();
  // function onDeleteHandler(...params){
  //   router.refresh();
  //   onDelete(...params)
  // }
  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  return (
    <>
      {/* <Grow> */}
      <Card
        onClick={() => setOpen(true)}
        className={`border-0 border-t-2 ${
          priorityColor[issue?.priority]
        } rounded-lg transition-shadow hover:shadow-lg hover:shadow-blue-500/30`}
        {...rest}
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
          <div className="text-xs text-gray-400 w-full">Created {created}</div>
        </CardFooter>
      </Card>
      {/* </Grow> */}
      {open && (
        <IssueDetailsDialog
          open={open}
          onClose={() => setOpen(false)}
          issue={issue}
          onDelete={() => toast.success("Issue deleted successfully")}
          onUpdate={(updatedIssue) => {}}
          borderColor={priorityColor[issue?.priority]}
          statuses={statuses}
        />
      )}
    </>
  );
};

export default IssueCard;
