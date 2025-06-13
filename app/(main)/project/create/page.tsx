"use client";

import OrgSwitcher from "@/components/org-switcher";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/useFetch";
import { createProject } from "@/actions/projects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader, Loader2Icon } from "lucide-react";

const CreateProjectPage = () => {
  const { isLoaded: isOrgLoaded, membership } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(projectSchema),
  });
  const router = useRouter();

  useEffect(() => {
    if (isOrgLoaded && isUserLoaded && membership) {
      setIsAdmin(membership.role === "org:admin");
    }
  }, [isOrgLoaded, isUserLoaded, membership]);

  const {
    data: project,
    isLoading,
    fn: createProjectFn,
  } = useFetch(createProject);

  useEffect(() => {
    if (project) {
      reset();
      toast.success("Project created successfully");
      router.push(`/project/${project.id}`);
    }
  }, [project]);

  async function onSubmit(data: Shape.ProjectPayload) {
    createProjectFn(data);
  }

  if (!isOrgLoaded || !isUserLoaded) return null;
  if (!isAdmin)
    return (
      <div className="flex flex-col  gap-2 items-center">
        <span className="text-2xl gradient-title">
          Oops! Only admins can create projects.
        </span>
        <OrgSwitcher />
      </div>
    );
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-6xl text-center font-bold mb-8 gradient-title">
        Create New Project
      </h1>
      <form
        className="flex flex-col space-y-4"
        onSubmit={handleSubmit((data) => onSubmit(data))}
      >
        <div>
          <Input
            id="name"
            className="bg-slate-950"
            placeholder="Project Name"
            {...register("name")}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors?.name?.message}</p>
          )}
        </div>
        <div>
          <Input
            id="key"
            className="bg-slate-950"
            placeholder="Project Key: (Ex:RFCE)"
            {...register("key")}
            disabled={isLoading}
          />
          {errors.key && (
            <p className="text-red-500 text-sm mt-1">{errors?.key?.message}</p>
          )}
        </div>
        <div>
          <Textarea
            id="description"
            className="bg-slate-950 h-28"
            placeholder="project description"
            {...register("description")}
            disabled={isLoading}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors?.description?.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="bg-blue-400 text-white hover:bg-blue-300"
          size="lg"
          disabled={isLoading}
        >
          {isLoading && <Loader className="animate-spin" />} Create Project
        </Button>
      </form>
    </div>
  );
};

export default CreateProjectPage;
