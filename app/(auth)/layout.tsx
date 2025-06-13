import React, { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return <div className="flex justify-center pt-20  pb-5">{children}</div>;
};

export default AuthLayout;
