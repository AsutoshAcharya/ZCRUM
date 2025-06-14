"use client";
import { IssueStatus, Sprint } from "@/lib/generated/prisma";
import { FC, useState } from "react";
import SprintManager from "./sprint-manager";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateIssue from "./create-issue";
interface Props {
  sprints: Array<Sprint>;
  projectId: string;
  orgId: string;
  statuses: Array<IssueStatus>;
}
const SprintBoard: FC<Props> = ({ sprints, projectId, orgId, statuses }) => {
  const [currentSprint, setCurrentSprint] = useState(
    sprints.find((s) => s.status === "ACTIVE") || sprints[0]
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | null>(
    null
  );

  function handleAddIssue(status: IssueStatus) {
    setSelectedStatus(status);
    setIsDrawerOpen(true);
  }

  return (
    <div className="w-full">
      {/* Sprint Manager */}
      <SprintManager
        sprint={currentSprint}
        onSprintChange={(sprint) => setCurrentSprint(sprint)}
        sprints={sprints}
        projectId={projectId}
      />
      {/* Kanban Board */}
      {statuses?.length > 0 && (
        <DragDropContext onDragEnd={(e) => {}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-900 p-4 rounded-lg">
            {statuses.map((column) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    <h3 className="font-semibold mt-2 text-center">
                      {column.name}
                    </h3>

                    {/* Issues */}
                    {provided.placeholder}

                    {column.order === 0 &&
                      currentSprint.status !== "COMPLETED" && (
                        <Button
                          className="w-full"
                          variant="ghost"
                          onClick={() => handleAddIssue(column)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Create Issue
                        </Button>
                      )}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
      <CreateIssue
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sprintId={currentSprint.id}
        status={selectedStatus!}
        projectId={projectId}
        onIssueCreated={() => {}}
        orgId={orgId}
      />
    </div>
  );
};

export default SprintBoard;
