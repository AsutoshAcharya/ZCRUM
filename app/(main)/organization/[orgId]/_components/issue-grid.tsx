"use client";
import IssueCard from "@/components/issue-card";
import { IssueStatus } from "@/lib/generated/prisma";
import { useRouter } from "next/navigation";

function IssueGrid({ issues }: { issues: any }) {
  const router = useRouter();
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
          onClick={() => {
            router.push(`/project/${issue.projectId}?sprint=${issue.sprintId}`);
          }}
        />
      ))}
    </div>
  );
}
export default IssueGrid;
