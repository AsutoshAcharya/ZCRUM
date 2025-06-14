"use client";

import { FC, useState, KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader, X } from "lucide-react";
import { toast } from "sonner";
import useFetch from "@/hooks/useFetch";
import { addWorkflowStatus } from "@/actions/sprint";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
}

const AddWorkflowStatus: FC<Props> = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [statuses, setStatuses] = useState<Array<string>>([]);
  const router = useRouter();

  function addStatus() {
    const trimmed = value.trim();
    if (!trimmed || statuses.includes(trimmed))
      return toast.warning("Status already added add a different status");
    setStatuses((prev) => [...prev, trimmed]);
    setValue("");
  }

  const { fn: addWorkflow, isLoading, data } = useFetch(addWorkflowStatus);

  const removeStatus = (statusToRemove: string) => {
    console.log("here");
    setStatuses((prev) => prev.filter((s) => s !== statusToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addStatus();
    }
  };

  async function handleSave() {
    await addWorkflow(projectId, statuses);
  }

  useEffect(() => {
    if (data && data.success) {
      toast.success("Workflow statuses added successfully");
      setOpen(false);
      setStatuses([]);
      router.refresh();
    }
  }, [data]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Workflow Status</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[500px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Add Workflow Status</DialogTitle>
            <DialogDescription>
              Set up the columns (statuses) that will appear on the sprint
              board.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="w-full flex flex-row gap-4">
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={30}
                placeholder="e.g. TODO, In Progress"
              />
              <Button onClick={addStatus}>Add</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {statuses.map((s, idx) => (
                <Badge key={idx} className="pr-6 relative">
                  {s}
                  <button
                    type="button"
                    onClick={() => removeStatus(s)}
                    className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-500 focus:outline-none"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2 mt-4 justify-end">
              <Button
                disabled={statuses.length === 0 || isLoading}
                onClick={handleSave}
              >
                {isLoading && <Loader className="animate-spin" />} Save Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddWorkflowStatus;
