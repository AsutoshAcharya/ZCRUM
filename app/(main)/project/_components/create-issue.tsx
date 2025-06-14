"use client";
import { FC, useEffect } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IssueStatus } from "@/lib/generated/prisma";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { issueSchema } from "@/lib/validators";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/useFetch";
import { createIssue } from "@/actions/issue";
import { getOrganizationUsers } from "@/actions/organization";
import { BarLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { z } from "zod";
import MdEditor from "@uiw/react-md-editor";
import { toast } from "sonner";
export const issuePriorities = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

type IssueFormData = z.infer<typeof issueSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sprintId: string;
  status: IssueStatus;
  projectId: string;
  onIssueCreated: () => void;
  orgId: string;
}
const CreateIssue: FC<Props> = ({
  isOpen,
  onClose,
  sprintId,
  status,
  projectId,
  onIssueCreated,
  orgId,
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      priority: "MEDIUM",
      description: "",
      assigneeId: "",
    },
  });

  useEffect(() => {
    if (isOpen && orgId) {
      fetchUsers(orgId);
    }
  }, [isOpen, orgId]);

  const {
    isLoading: createIssueLoading,
    fn: createIssueFn,
    error,
    data: newIssue,
  } = useFetch(createIssue);

  const {
    isLoading: usersLoading,
    fn: fetchUsers,
    data: users,
  } = useFetch(getOrganizationUsers);
  async function onSubmit(data: IssueFormData) {
    console.log(data);
    console.log(status.name);
    const payload = {
      title: data.title,
      description: data.description,
      status: status.name,
      statusId: status.id,
      priority: data.priority,
      sprintId: sprintId,
      assigneeId: data.assigneeId,
    };
    await createIssueFn(projectId, payload);
  }
  useEffect(() => {
    if (newIssue) {
      reset();
      onClose();
      onIssueCreated();
      toast.success("Issue added successfully");
    }
  }, [newIssue, createIssueLoading]);
  console.log(users);
  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Issue</DrawerTitle>
        </DrawerHeader>
        {usersLoading && <BarLoader width={"100%"} color="#36d7b7" />}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-row items-center gap-4">
            <div className="flex-1/2">
              <label
                htmlFor="assigneeId"
                className="block text-sm font-medium mb-1"
              >
                Assignee
              </label>
              <Controller
                name="assigneeId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assigneeId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.assigneeId.message}
                </p>
              )}
            </div>
            <div className="flex-1/2">
              <label
                htmlFor="priority"
                className="block text-sm font-medium mb-1"
              >
                Priority
              </label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {issuePriorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <MdEditor value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {error && <p className="text-red-500 mt-2">{error.message}</p>}
          <Button
            type="submit"
            disabled={createIssueLoading}
            className="w-full"
          >
            {createIssueLoading ? (
              <div className="flex flex-row gap-2">
                <Loader className="animate-spin" />
                <p>Creating...</p>
              </div>
            ) : (
              "Create Issue"
            )}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateIssue;
