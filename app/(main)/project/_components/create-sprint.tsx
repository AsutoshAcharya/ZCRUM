"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { type FC, useState } from "react";
import { useForm } from "react-hook-form";
import { addDays, format } from "date-fns";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sprintSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "react-day-picker/dist/style.css";
import useFetch from "@/hooks/useFetch";
import { createSprint } from "@/actions/sprint";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SprintFormData = z.infer<typeof sprintSchema>;

interface Props {
  projectTitle: string;
  projectId: string;
  projectKey: string;
  sprintKey: number;
}

const SprintCreationForm: FC<Props> = ({
  projectTitle,
  projectId,
  projectKey,
  sprintKey,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState<Shape.DateRange>({
    from: new Date(),
    to: addDays(new Date(), 14),
  });

  const form = useForm<SprintFormData>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: `${projectKey}-${sprintKey}`,
      startDate: new Date(),
      endDate: addDays(new Date(), 14),
    },
  });

  const router = useRouter();
  const { isLoading, fn: createSprintFn } = useFetch(createSprint);
  const onSubmit = async (data: SprintFormData) => {
    await createSprintFn(projectId, {
      ...data,
      startDate: dateRange.from,
      endDate: dateRange.to,
    });
    setShowForm(false);
    toast.success("Sprint created successfully");
    router.refresh();
  };

  return (
    <div className="flex justify-between items-start">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
        {projectTitle}
      </h1>

      <Button onClick={() => setShowForm(true)}>Create New Sprint</Button>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="sm:max-w-[500px]"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
            <DialogDescription>
              Set up a new sprint for your project. Define the sprint duration.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sprint name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Sprint Duration</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DayPicker
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        const from = range?.from;
                        const to = range?.to;
                        if (from && to) {
                          setDateRange({
                            from,
                            to,
                          });
                          form.setValue("startDate", from);
                          form.setValue("endDate", to);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      classNames={{
                        chevron: "fill-blue-500",
                        range_start: "bg-blue-700",
                        range_end: "bg-blue-700",
                        range_middle: "bg-blue-400",
                        day_button: "border-none",
                        today: "border-2 border-blue-700",
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.endDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.endDate.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {isLoading && <Loader className="animate-spin" />} Create
                  Sprint
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SprintCreationForm;
