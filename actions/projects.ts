"use server";
import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

async function checkUserAuthorization({
  checkForRole = false,
}: {
  checkForRole?: boolean;
}): Promise<{
  userId: string;
  orgId: string;
}> {
  const { userId, orgId, orgRole } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!orgId) throw new Error("No organization selected");
  if (orgRole !== "org:admin" && checkForRole)
    throw new Error("Only organization admins can delete projects");
  return { userId, orgId };
}

export async function createProject(data: Shape.ProjectPayload) {
  const { userId, orgId } = await checkUserAuthorization({});
  const clerk = await clerkClient();
  const { data: membership } =
    await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userMembership = membership.find(
    (m) => m?.publicUserData?.userId === userId
  );
  if (!userMembership || userMembership.role !== "org:admin")
    throw new Error("Only organization admins can create projects");

  try {
    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data?.description,
        organizationId: orgId,
      },
    });
    return project;
  } catch (error: any) {
    throw new Error(`Error creating project: ${error?.message}`);
  }
}

export async function deleteProject(projectId: string) {
  const { orgId } = await checkUserAuthorization({ checkForRole: true });
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error(
      "Project not found or you don't have permission to delete it"
    );
  }
  await db.project.delete({
    where: {
      id: projectId,
    },
  });
  return { success: true };
}
