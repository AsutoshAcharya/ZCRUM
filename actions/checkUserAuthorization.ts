"use server";

import { auth } from "@clerk/nextjs/server";

export async function checkUserAuthorization({
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
