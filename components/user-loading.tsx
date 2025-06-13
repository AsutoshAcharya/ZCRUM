"use client";
import { useOrganization, useUser } from "@clerk/nextjs";
import { BarLoader } from "react-spinners";
const UserLoading = () => {
  const { isLoaded } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  return (
    <>
      {!isLoaded || !isUserLoaded ? (
        <BarLoader className="mb-4" width="100%" color="#3bd7b7" />
      ) : (
        <></>
      )}
    </>
  );
};

export default UserLoading;
