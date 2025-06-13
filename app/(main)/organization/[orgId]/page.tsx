import { getOrganization } from "@/actions/organization";
import OrgSwitcher from "@/components/org-switcher";
import React from "react";

const Organization = async ({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) => {
  const orgId = (await params).orgId;
  const organization = await getOrganization(orgId);

  return (
    <>
      {!organization ? (
        <div>No organization found</div>
      ) : (
        <div className="container mx-auto">
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start">
            <h1 className="text-5xl font-bold gradient-title pb-2">
              {organization.organization.name}'s Project
            </h1>
            <OrgSwitcher />
          </div>
          <div className="mb-4">Show org projects</div>
          <div className="mb-8">Show user assigned reported issues</div>
        </div>
      )}
    </>
  );
};

export default Organization;
