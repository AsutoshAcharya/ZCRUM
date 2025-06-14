"use client";
import { FC, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sprint } from "@/lib/generated/prisma";
import { formatDistanceToNow, isAfter, isBefore } from "date-fns";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useFetch from "@/hooks/useFetch";
import { updateSprintStatus } from "@/actions/sprint";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";

interface Props {
  sprint: Sprint;
  sprints: Array<Sprint>;
  onSprintChange: (sprint: Sprint) => void;
  projectId: string;
}

const SprintManager: FC<Props> = ({
  sprint,
  sprints,
  onSprintChange,
  projectId,
}) => {
  const [status, setStatus] = useState(sprint.status);
  const sd = new Date(sprint.startDate);
  const ed = new Date(sprint.endDate);
  const now = new Date();
  const canStart =
    isBefore(now, ed) && isAfter(now, sd) && status === "PLANNED";

  const canEnd = status === "ACTIVE";

  const router = useRouter();
  function getStatusText(): string {
    if (status === "COMPLETED") return "Sprint Ended";
    if (status === "ACTIVE" && isAfter(now, ed))
      return `Overdue by ${formatDistanceToNow(ed)}`;
    if (status === "PLANNED" && isBefore(now, sd))
      return `Starts in  ${formatDistanceToNow(sd)}`;
    else return "";
  }

  const {
    fn: updateStatus,
    isLoading,
    data: updatedStatus,
  } = useFetch(updateSprintStatus);
  async function handleStatusChange(newStatus: Sprint["status"]) {
    await updateStatus(sprint.id, newStatus).catch((err) =>
      toast.error("Something went wrong!")
    );
  }
  useEffect(() => {
    if (updatedStatus && updatedStatus?.success) {
      setStatus(updatedStatus.sprint.status);
      onSprintChange({
        ...sprint,
        status: updatedStatus.sprint.status,
      });
    }
  }, [updatedStatus]);

  return (
    <>
      <div className="w-full flex justify-between items-center gap-4">
        <Select
          value={sprint.id}
          onValueChange={(value) => {
            const selectedSprint = sprints.find((s) => s.id === value);
            onSprintChange(selectedSprint!);
            setStatus(selectedSprint?.status!);
          }}
        >
          <SelectTrigger className="bg-slate-950 self-start w-full">
            <SelectValue placeholder="Select Sprint" className="w-full" />
          </SelectTrigger>
          <SelectContent>
            {sprints.map((s) => (
              <SelectItem value={s.id} key={s.id}>
                {s.name} ({format(sprint.startDate, "MMM d, yyyy")}) - (
                {format(sprint.endDate, "MMM d, yyyy")})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canStart && (
          <Button
            className="bg-green-900 text-white"
            disabled={isLoading}
            onClick={() => handleStatusChange("ACTIVE")}
          >
            Start Sprint
          </Button>
        )}
        {canEnd && (
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => handleStatusChange("COMPLETED")}
          >
            End Sprint
          </Button>
        )}
      </div>
      {isLoading && <BarLoader width="100%" className="mt-2" color="#36d7b7" />}
      {getStatusText() && (
        <Badge className="mt-3 ml-1 self-start">{getStatusText()}</Badge>
      )}
    </>
  );
};

export default SprintManager;
