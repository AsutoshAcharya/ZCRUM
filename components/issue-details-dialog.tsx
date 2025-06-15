import { deleteIssue, updateIssue } from "@/actions/issue";
import useFetch from "@/hooks/useFetch";
import { useOrganization, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

import React, { FC, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ExternalLink, Loader } from "lucide-react";
import { BarLoader } from "react-spinners";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { IssueStatus } from "@/lib/generated/prisma";
import MDEditor from "@uiw/react-md-editor";
import UserAvatar from "./user-avatar";
interface Props {
  open: boolean;
  onClose: () => void;
  issue: any;
  onDelete: () => void;
  onUpdate: (val: any) => void;
  borderColor: string;
  statuses: Array<IssueStatus>;
}
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const IssueDetailsDialog: FC<Props> = ({
  open,
  onClose,
  issue,
  onDelete,
  onUpdate,
  borderColor,
  statuses,
}) => {
  const [status, setStatus] = useState(
    statuses.find((s) => s.id === issue?.statusId) || statuses[0]
  );
  const [priority, setPriority] = useState(issue.priority);
  const { user } = useUser();
  const { membership } = useOrganization();
  const router = useRouter();
  const pathname = usePathname();
  console.warn(status);
  const {
    isLoading: deleteLoading,
    error: deleteError,
    fn: deleteIssueFn,
    data: deleted,
  } = useFetch(deleteIssue);

  const {
    isLoading: updateLoading,
    error: updateError,
    fn: updateIssueFn,
    data: updated,
  } = useFetch(updateIssue);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      await deleteIssueFn(issue.id);
    }
  };

  const handleStatusChange = async (newStatusId: string) => {
    setStatus(statuses.find((s) => s.id === newStatusId)!);
    await updateIssueFn(issue.id, { statusId: newStatusId, priority });
  };

  const handlePriorityChange = async (newPriority: string) => {
    setPriority(newPriority);
    await updateIssueFn(issue.id, {
      statusId: status.id,
      priority: newPriority,
    });
  };

  useEffect(() => {
    if (deleted) {
      onClose();
      onDelete();
    }
    if (updated) {
      onUpdate(updated);
    }
  }, [deleted, updated, deleteLoading, updateLoading]);

  const canChange =
    user?.id === issue.reporter.clerkUserId || membership?.role === "org:admin";

  const handleGoToProject = () => {
    router.push(`/project/${issue.projectId}?sprint=${issue.sprintId}`);
  };

  const isProjectPage = !pathname.startsWith("/project/");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-3xl">{issue.title}</DialogTitle>
            {isProjectPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoToProject}
                title="Go to Project"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        {(updateLoading || deleteLoading) && (
          <BarLoader width={"100%"} color="#36d7b7" />
        )}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Select value={status.id} onValueChange={handleStatusChange}>
              <SelectTrigger className="">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses?.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onValueChange={handlePriorityChange}
              disabled={!canChange}
            >
              <SelectTrigger className={`border ${borderColor} rounded`}>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <h4 className="font-semibold">Description</h4>
            <MDEditor.Markdown
              className="rounded px-2 py-1"
              source={issue.description ? issue.description : "--"}
            />
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Assignee</h4>
              <UserAvatar user={issue.assignee} />
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Reporter</h4>
              <UserAvatar user={issue.reporter} />
            </div>
          </div>
          {canChange && (
            <Button
              onClick={handleDelete}
              disabled={deleteLoading}
              variant="destructive"
            >
              {deleteLoading ? (
                <>
                  <Loader className="animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Issue"
              )}
            </Button>
          )}
          {(deleteError || updateError) && (
            <p className="text-red-500">
              {deleteError?.message || updateError?.message}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetailsDialog;
