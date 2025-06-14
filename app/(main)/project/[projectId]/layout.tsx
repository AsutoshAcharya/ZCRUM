import { LoaderCircle } from "lucide-react";
import React, { ReactNode, Suspense } from "react";
import { BarLoader } from "react-spinners";

const ProjectLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mx-auto">
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center">
            <LoaderCircle className="animate-spin " />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
};

export default ProjectLayout;
