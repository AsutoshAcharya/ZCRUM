"use client";

import { OrganizationSwitcher, SignedIn } from "@clerk/clerk-react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const OrgSwitcher = () => {
  const { isLoaded } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const pathName = usePathname();
  return (
    <>
      {!isLoaded || !isUserLoaded ? null : (
        <div>
          <SignedIn>
            <OrganizationSwitcher
              hidePersonal
              afterCreateOrganizationUrl="/onboarding/:slug"
              afterSelectOrganizationUrl="/organization/:slug"
              createOrganizationMode="modal"
              appearance={{
                elements: {
                  rootBox: "border border-gray-300 rounded-md px-5 py-2",
                  triggerButton: "text-white",
                },
              }}
            />
          </SignedIn>
        </div>
      )}
    </>
  );
};

export default OrgSwitcher;
