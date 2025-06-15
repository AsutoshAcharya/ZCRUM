"use client";
import { Issue, IssueStatus, Sprint } from "@/lib/generated/prisma";
import { FC, useEffect, useState } from "react";
import SprintManager from "./sprint-manager";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateIssue from "./create-issue";
import useFetch from "@/hooks/useFetch";
import { getIssueForSprint, updateIssueOrder } from "@/actions/issue";
import { BarLoader } from "react-spinners";
import IssueCard from "@/components/issue-card";
import { toast } from "sonner";
import { getPusherClient } from "@/lib/pusher";
import BoardFilters from "./board-filters";

function reorder(list: any, startIndex: number, endIndex: number) {
  const res = Array.from(list);
  const [removed] = res.splice(startIndex, 1);
  res.splice(endIndex, 0, removed);
  return res;
}
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

  const {
    isLoading: issuesLoading,
    error: issuesError,
    fn: fetchIssues,
    data: issues,
    setData: setIssues,
  } = useFetch(getIssueForSprint);

  const {
    isLoading: isUpdatingIssue,
    error: updateIssueError,
    fn: updateIssueOrderFn,
    data,
  } = useFetch(updateIssueOrder);
  const [filteredIssues, setFilteredIssues] = useState(issues);
  function handleFilterChange(newFilteredIssues: Array<any>) {
    setFilteredIssues(newFilteredIssues);
  }
  useEffect(() => {
    if (currentSprint.id) fetchIssues(currentSprint.id);
  }, [currentSprint.id]);
  async function onDragEnd(e: DropResult) {
    const sprintStatus = currentSprint.status;
    if (sprintStatus === "PLANNED")
      return toast.warning("Start the sprint to update board");
    if (sprintStatus === "COMPLETED")
      return toast.warning("Can not update board after sprint end");

    const { destination, source } = e;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;
    const newOrderedData = [...issues!];
    const sourceList = newOrderedData.filter(
      (l) => l.statusId === source.droppableId
    );

    const destinationList = newOrderedData.filter(
      (l) => l.statusId === destination.droppableId
    );

    if (source.droppableId === destination.droppableId) {
      const reorderdCards: Array<any> = reorder(
        sourceList,
        source.index,
        destination.index
      );
      reorderdCards.forEach((card, i) => {
        card.order = i;
      });
    } else {
      //remove card from the source list
      const [movedCard] = sourceList.splice(source.index, 1);

      //assign new list id to the moved card
      movedCard.statusId = destination.droppableId;

      //add new card to the destination list
      destinationList.splice(destination.index, 0, movedCard);

      //update order in source list
      sourceList.forEach((card, i) => {
        card.order = i;
      });
      //update order in destination list
      destinationList.forEach((card, i) => {
        card.order = i;
      });
    }
    const sortedIssues = newOrderedData.sort((a, b) => a.order - b.order);
    setIssues(sortedIssues);

    updateIssueOrderFn(sortedIssues, currentSprint.id);
  }

  useEffect(() => {
    if (!isDrawerOpen) {
      document.body.style.overflow = "auto";
    }
  }, [isDrawerOpen]);
  useEffect(() => {
    if (!currentSprint?.id) return;
    const channelName = `update-board-${currentSprint?.id}`;
    console.warn(channelName);
    const pusherClient = getPusherClient();
    const channel = pusherClient.subscribe(channelName);
    channel.bind("update-board", (data: any) => {
      console.warn(data);
      fetchIssues(currentSprint.id);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      // pusherClient.disconnect();
    };
  }, [currentSprint?.id]);
  if (issuesError) return <div>Error loading issues</div>;
  return (
    <>
      <div className="w-full">
        {/* Sprint Manager */}
        <SprintManager
          sprint={currentSprint}
          onSprintChange={(sprint) => setCurrentSprint(sprint)}
          sprints={sprints}
          projectId={projectId}
        />
        {issues && !issuesLoading && (
          <BoardFilters issues={issues} onFilterChange={handleFilterChange} />
        )}
        {updateIssueError && (
          <p className="text-red-500 mt-2">{updateIssueError?.message}</p>
        )}
        {(issuesLoading || isUpdatingIssue) && (
          <BarLoader width="100%" className="mt-2" color="#36d7b7" />
        )}
        {/* Kanban Board */}
        {statuses?.length > 0 && (
          <DragDropContext onDragEnd={(e) => onDragEnd(e)}>
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
                      {filteredIssues
                        ?.filter((issue) => issue.statusId === column.id)
                        .map((issue, idx) => (
                          <Draggable
                            key={issue.id}
                            draggableId={issue.id}
                            index={idx}
                            isDragDisabled={isUpdatingIssue}
                          >
                            {(provided) => (
                              <div
                                className="cursor-grab"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <IssueCard
                                  issue={issue}
                                  issueStatus={issue.status}
                                  showStatus={true}
                                  onDelete={() => {}}
                                  onUpdate={() => {}}
                                  statuses={statuses}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
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
      </div>
      {isDrawerOpen && (
        <CreateIssue
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sprintId={currentSprint.id}
          status={selectedStatus!}
          projectId={projectId}
          onIssueCreated={() => {}}
          orgId={orgId}
        />
      )}
    </>
  );
};

export default SprintBoard;
