"use client";
import { Sprint } from "@/lib/generated/prisma";
import { FC, useState } from "react";
import SprintManager from "./sprint-manager";
interface Props {
  sprints: Array<Sprint>;
  projectId: string;
  orgId: string;
}
const SprintBoard: FC<Props> = ({ sprints, projectId, orgId }) => {
  const [currentSprint, setCurrentSprint] = useState(
    sprints.find((s) => s.status === "ACTIVE") || sprints[0]
  );
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
    </div>
  );
};

export default SprintBoard;
