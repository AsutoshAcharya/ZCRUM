"use server";
import { db } from "@/lib/prisma";
import { checkUserAuthorization } from "./checkUserAuthorization";

export async function createIssue(projectId: string, data: any) {
  const { userId, orgId } = await checkUserAuthorization({});
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  const lastIssue = await db.issue.findFirst({
    where: {
      projectId,
      statusId: data.statusId,
    },
    orderBy: {
      order: "desc",
    },
  });
  const newOrder = lastIssue ? lastIssue.order + 1 : 0;
  const issue = await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      statusId: data.statusId,
      priority: data.priority,
      sprintId: data.sprintId,
      assigneeId: data.assigneeId || null,
      projectId: projectId,
      reporterId: user?.id!,
      order: newOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });
  return issue;
}
export async function getIssueForSprint(sprintId: string) {
  const {} = await checkUserAuthorization({});

  const issues = await db.issue.findMany({
    where: {
      sprintId: sprintId,
    },
    orderBy: [{ statusId: "asc" }, { order: "asc" }],
    include: {
      assignee: true,
      reporter: true,
      status: true,
    },
  });

  return issues;
}
