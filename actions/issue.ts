"use server";
import { db } from "@/lib/prisma";
import { checkUserAuthorization } from "./checkUserAuthorization";
import { pusherServer } from "@/lib/pusher";

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
  console.log(issue);
  if (issue?.assigneeId) {
    await db.notification.create({
      data: {
        userId: issue?.assigneeId,
        type: "ASSIGNED",
        message: `You have been assigned to issue ${issue.title}`,
        issueId: issue.id,
      },
    });
    console.log("assignedId server", issue?.assigneeId);
    await pusherServer.trigger(
      `issue-created-${issue?.assigneeId}`,
      "issue-assigned",
      { message: "Issue created", issue }
    );
  }
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

export async function updateIssueOrder(updatedIssues: any) {
  await checkUserAuthorization({});

  await db.$transaction(async (prisma) => {
    for (const issue of updatedIssues) {
      const issueId = String(issue?.id);
      await prisma.issue.update({
        where: {
          id: issueId,
        },
        data: {
          statusId: issue?.statusId,
          order: issue?.order,
        },
      });
    }
  });
  return { status: true };
}
