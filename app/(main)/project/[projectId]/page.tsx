import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import SprintCreationForm from "../_components/create-sprint";
import SprintBoard from "../_components/sprint-board";

const SingleProject = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const projectId = (await params).projectId;
  const project = await getProject(projectId);
  console.log(project);
  if (!project) notFound();
  return (
    <div className="container mx-auto p-4">
      {/* Sprint Creation */}
      <SprintCreationForm
        projectTitle={project.name}
        projectId={project.id}
        projectKey={project.key}
        sprintKey={project.sprints?.length + 1}
        hasWorkflow={project.statuses.length > 0}
      />
      {project.sprints.length > 0 ? (
        <SprintBoard
          sprints={project.sprints}
          projectId={projectId}
          orgId={project.organizationId}
          statuses={project.statuses}
        />
      ) : (
        <div>Create Sprint</div>
      )}
    </div>
  );
};

export default SingleProject;
