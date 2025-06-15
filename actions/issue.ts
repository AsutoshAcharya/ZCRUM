"use server";
import { db } from "@/lib/prisma";
import { checkUserAuthorization } from "./checkUserAuthorization";
import { pusherServer } from "@/lib/pusher";

async function triggerBoardUpdate(sprintId: string, updatedBy?: string) {
  if (!sprintId) return;
  await pusherServer.trigger(`update-board-${sprintId}`, "update-board", {
    message: "Update Board",
    sprintId,
    updatedBy,
  });
}

async function notifyAssignee(issue: any, currentUserId: string) {
  if (issue?.assigneeId && issue.assigneeId !== currentUserId) {
    await db.notification.create({
      data: {
        userId: issue.assigneeId,
        type: "ASSIGNED",
        message: `You have been assigned to issue ${issue.title}`,
        issueId: issue.id,
      },
    });

    await pusherServer.trigger(
      `issue-created-${issue.assigneeId}`,
      "issue-assigned",
      {
        message: "Issue created",
        issue,
      }
    );
  }
}

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
  //generate notifications is someone else assigns an issue
  if (user?.id !== issue.assigneeId && issue?.assigneeId) {
    await notifyAssignee(issue, user?.id!);
  }

  //for sprint refetch
  await triggerBoardUpdate(data.sprintId);
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

export async function updateIssueOrder(updatedIssues: any, sprintId: string) {
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

  await triggerBoardUpdate(sprintId);
  return { status: true };
}

export async function deleteIssue(issueId: string) {
  const { userId } = await checkUserAuthorization({});
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  if (!user) throw new Error("User not found");
  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue) throw new Error("Issue not found");
  if (issue.reporterId !== user.id)
    throw new Error("You don't have permission to delete the issue");
  const sprintId = String(issue?.sprintId);
  await db.issue.delete({ where: { id: issueId } });

  await triggerBoardUpdate(sprintId, user.id);
  return { success: true };
}

export async function updateIssue(issueId: string, data: any) {
  const { userId, orgId } = await checkUserAuthorization({});
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  if (!user) throw new Error("User not found");
  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });
  if (!issue) throw new Error("Issue not found");
  if (issue.project.organizationId !== orgId) throw new Error("Unauthorized");
  try {
    const updateIssue = await db.issue.update({
      where: {
        id: issueId,
      },
      data: {
        statusId: data?.statusId,
        priority: data?.priority,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });
    await triggerBoardUpdate(updateIssue.sprintId!);
    return updateIssue;
  } catch (error: any) {
    throw new Error("Error updating issue:" + error?.message);
  }
}
