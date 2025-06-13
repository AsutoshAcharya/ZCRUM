"use server";
import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function createProject(data: Shape.ProjectPayload) {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!orgId) throw new Error("No organization selected");
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
