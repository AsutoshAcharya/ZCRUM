"use server";

import { db } from "@/lib/prisma";
import { checkUserAuthorization } from "./checkUserAuthorization";

export default async function createSprint(
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
