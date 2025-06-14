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
      status: data.status,
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
      status: data.status,
      statusId: data.statusId,
      priority: data.priority,
      projectId: projectId,
      sprintId: data.sprintId,
      reporterId: user?.id!,
      assigneeId: data.assigneeId || null,
      order: newOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });
  return issue;
}
