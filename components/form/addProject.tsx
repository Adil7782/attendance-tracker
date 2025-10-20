"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Zap, AlertCircle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Project } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface AddProjectFormProps {
  initialData?: Project | null;
  projectId?: string;
  mode?: "create" | "edit";
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  url: z.string().url("Please enter a valid URL"),
  client: z.string().min(1, { message: "Client name is required" }),
  dbUrl: z.string().min(1, { message: "Database URL is required" }),
  factory: z.string().min(1, { message: "Factory name is required" }),
  unit: z.string().min(1, { message: "Unit selection is required" }),
});

const UNITS = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5","CCL-1B"];

const AddProjectForm = ({
  initialData,
  projectId,
  mode,
}: AddProjectFormProps) => {
  const router = useRouter();
  const isEditMode = mode !== "create"

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      url: initialData?.url || "",
      client: initialData?.client || "",
      dbUrl: initialData?.dbUrl || "",
      factory: initialData?.factory || "",
      unit: initialData?.unit || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (isEditMode) {
        await axios.put(`/api/project/update/${projectId}`, data);
        toast.success("Project updated successfully", {
          description: "Your changes have been saved.",
        });
      } else {
        await axios.post("/api/project", data);
        toast.success("Project created successfully", {
          description: "Your new project is ready to use.",
        });
        form.reset();
      }
      router.refresh();
      router.push("/projects");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";
      toast.error("Operation failed", {
        description: message,
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl mt-10 px-4 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-6 sm:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Project" : "Create New Project"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isEditMode
              ? "Update project details and configuration"
              : "Set up a new project with essential information"}
          </p>
        </div>

        {/* Form Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 sm:p-8">
            {/* Project Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-700">
                    Project Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g., Hameem Portal"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* Client */}
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-gray-700">
                      Client
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g., Hameem Industries"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Factory */}
              <FormField
                control={form.control}
                name="factory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-gray-700">
                      Factory
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g., AGL Manufacturing"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Unit */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-gray-700">
                      Unit
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* URL */}
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-gray-700">
                      Project URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        disabled={isSubmitting}
                        placeholder="https://portal.example.com"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            {/* Database URL - Full Width */}
            <FormField
              control={form.control}
              name="dbUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-700">
                    Database URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="postgresql://user:password@host/database"
                      className="font-mono text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <p className="mt-1 text-xs text-gray-500">
                    Keep this secure. Never share your database credentials.
                  </p>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-8">
              {isEditMode ? (
                <>
                  <Link href="/projects">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className={cn("h-4 w-4", isSubmitting && "hidden")} />
                    <Loader2
                      className={cn(
                        "h-4 w-4 animate-spin hidden",
                        isSubmitting && "flex"
                      )}
                    />
                    Update Project
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className={cn("h-4 w-4", isSubmitting && "hidden")} />
                    <Loader2
                      className={cn(
                        "h-4 w-4 animate-spin hidden",
                        isSubmitting && "flex"
                      )}
                    />
                    Create Project
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddProjectForm;