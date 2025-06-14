"use server";

import { db } from "@/lib/prisma";
import { checkUserAuthorization } from "./checkUserAuthorization";
import { Sprint } from "@/lib/generated/prisma";

export async function createSprint(
  projectId: string,
  data: Shape.SprintPayload
) {
  const { orgId } = await checkUserAuthorization({});

  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });
  if (!project || project?.organizationId !== orgId) {
    return null;
  }
  const sprint = await db.sprint.create({
    data: {
      ...data,
      status: "PLANNED",
      projectId,
    },
  });

  return sprint;
}

export async function updateSprintStatus(
  sprintId: string,
  newStatus: Sprint["status"]
) {
  const { orgId } = await checkUserAuthorization({ checkForRole: true });
  try {
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      include: { project: true },
    });
    if (!sprint) throw new Error("Sprint not found");

    if (sprint.project.organizationId !== orgId)
      throw new Error("Unauthorized");

    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    if (newStatus === "ACTIVE" && (now < startDate || now > endDate)) {
      throw new Error("Cant start sprint outside of its date range");
    }

    if (newStatus === "COMPLETED" && sprint.status !== "ACTIVE") {
      throw new Error("Cant only complete an active sprint");
    }
    const updatedSprint = await db.sprint.update({
      where: {
        id: sprintId,
      },
      data: { status: newStatus },
    });
    return { success: true, sprint: updatedSprint };
  } catch (error: any) {
    throw new Error(error?.message);
  }
}
