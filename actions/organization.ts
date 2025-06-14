"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { checkUserAuthorization } from "./checkUserAuthorization";

export async function getOrganization(slug: string) {
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User Not Found");
    }
    const clerk = await clerkClient();
    const organization = await clerk.organizations.getOrganization({ slug });

    if (!organization) {
      return null;
    }

    const { data: membership } =
      await clerk.organizations.getOrganizationMembershipList({
        organizationId: organization.id,
      });

    const userMembership = membership.find(
      (m) => m?.publicUserData?.userId === userId
    );

    return userMembership || null;
  } catch (error) {
    return null;
  }
}

export async function getProjects(organizationId: string) {
  const { userId } = await auth();
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User Not Found");
    }

    const projects = await db.project.findMany({
      where: {
        organizationId,
      },
      orderBy: { createdAt: "desc" },
    });
    return projects;
  } catch (error) {}
}

export async function getOrganizationUsers(orgId: string) {
  await checkUserAuthorization({});
  const clerk = await clerkClient();

  const organizationMemberships =
    await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userIds = organizationMemberships?.data?.map((m) =>
    String(m.publicUserData?.userId)
  );

  const users = await db.user.findMany({
    where: {
      clerkUserId: {
        in: userIds,
      },
    },
  });

  return users;
}
