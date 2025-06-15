import { getUserIssues } from "@/actions/issue";
import IssueCard from "@/components/issue-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueStatus } from "@/lib/generated/prisma";
import React, { Suspense } from "react";
import IssueGrid from "./issue-grid";

const UserIssues = async ({ userId }: { userId: string }) => {
  const issues = await getUserIssues();

  if (issues.length === 0) {
    return <></>;
  }

  const assignedIssues = issues.filter(
    (issue) => issue?.assignee?.clerkUserId === userId
  );
  const reportedIssues = issues.filter(
    (issue) => issue?.reporter?.clerkUserId === userId
  );

  return (
    <>
      <h1 className="text-4xl font-bold gradient-title mb-4">My Issues</h1>

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList>
          <TabsTrigger value="assigned" className="cursor-pointer">
            Assigned to You
          </TabsTrigger>
          <TabsTrigger value="reported" className="cursor-pointer">
            Reported by You
          </TabsTrigger>
        </TabsList>
        <TabsContent value="assigned">
          <Suspense fallback={<div>Loading...</div>}>
            <IssueGrid issues={assignedIssues} />
          </Suspense>
        </TabsContent>
        <TabsContent value="reported">
          <Suspense fallback={<div>Loading...</div>}>
            <IssueGrid issues={reportedIssues} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default UserIssues;
