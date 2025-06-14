import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import SprintCreationForm from "../_components/create-sprint";

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
    <div className=" container mx-auto">
      {/* Sprint Creation */}
      <SprintCreationForm
        projectTitle={project.name}
        projectId={project.id}
        projectKey={project.key}
        sprintKey={project.sprints?.length + 1}
      />
      {project.sprints.length > 0 ? <></> : <div>Create Sprint</div>}
    </div>
  );
};

export default SingleProject;
