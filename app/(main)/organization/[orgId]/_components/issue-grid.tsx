"use client";
import IssueCard from "@/components/issue-card";
import { IssueStatus } from "@/lib/generated/prisma";

function IssueGrid({ issues }: { issues: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {issues.map((issue: any) => (
        <IssueCard
          key={String(issue?.id)}
          issue={issue}
          showStatus={true}
          onDelete={() => {}}
          onUpdate={() => {}}
          issueStatus={issue?.status as IssueStatus}
          statuses={[]}
        />
      ))}
    </div>
  );
}
export default IssueGrid;
