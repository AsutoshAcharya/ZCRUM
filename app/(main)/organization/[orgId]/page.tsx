import { getOrganization } from "@/actions/organization";
import OrgSwitcher from "@/components/org-switcher";
import React from "react";
import ProjectList from "./_components/project-list";

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
        <div className="container mx-auto p-2">
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start">
            <h1 className="text-5xl font-bold gradient-title pb-2">
              {organization.organization.name}'s Project
            </h1>
            <OrgSwitcher />
          </div>
          <div className="mb-4">
            <ProjectList orgId={organization.organization.id} />
          </div>
          <div className="mb-8">Show user assigned reported issues</div>
        </div>
      )}
    </>
  );
};

export default Organization;
