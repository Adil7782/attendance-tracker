"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, CheckCircle2, Loader2, Zap, Users, FolderKanban, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Prisma, User } from "@prisma/client"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/getUser"
import { cn } from "@/lib/utils"


const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  deadline: z.date({
    error: "Deadline is required",
  }),
  priority: z.string().min(1, "Please select a priority level"),
  remark: z.string().optional(),
  projectIds: z.array(z.string()).min(1, "Please select at least one project"),
  userIds: z.array(z.string()).min(1, "Please select at least one employee"),
});

type ProjectWithUsers = Prisma.ProjectGetPayload<{
  include: { assignments: { include: { user: true } } } 
}>

type initialDataTypes = Prisma.TaskAssignmentGetPayload<{
    include:{project:true,task:true,user:true}
}>

type ProjectsProps = {
  projects: ProjectWithUsers[],
  inititalData?:initialDataTypes | null,
  mode?:string
  taskId?:string
}

export default function TaskForm({projects,inititalData,mode,taskId}: ProjectsProps) {
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: inititalData?.task.title || "",
      description: inititalData?.task.description || "",
      priority: inititalData?.task.priority || "",
      remark: inititalData?.task.remark || "",
      projectIds: inititalData?.project?.id ? [inititalData.project.id] : [],
      userIds: inititalData?.user.id ? [inititalData.user.id] : [],
      deadline: inititalData?.task.deadline || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    if (inititalData?.project?.id) {
      handleSelectProject([inititalData.project.id]);
    }
  }, [inititalData]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const user = await getUser()
    if (mode && mode === "create") {
      try {
        const res = await axios.post("/api/tasks", {...values, email: user.email});
        toast.success("Task created successfully!");
        router.refresh();
        form.reset();
        setUsers([]);
      } catch (error: any) {
        console.error("ERROR", error);
        toast.error("Failed to create task");
      }
    } else {
      try {
        const res = await axios.put(`/api/tasks/update/${taskId}`, {...values,email: user.email});
        toast.success("Task updated successfully!");
        router.refresh();
        router.push("/tasks");
      } catch (error: any) {
        console.error("ERROR", error);
        toast.error("Failed to update task");
      }
    }
  }

  const handleSelectProject = (values: string[]) => {
    const selectedProjects = projects.filter(p => values.includes(p.id));
    const assignedUsers = selectedProjects.flatMap(p =>
      p.assignments.map(a => a.user)
    );
    const uniqueUsers = Array.from(
      new Map(assignedUsers.map(u => [u.id, u])).values()
    );
    
    setUsers(uniqueUsers);
    
    const currentUserIds = form.getValues("userIds") || [];
    const validUserIds = currentUserIds.filter(id => 
      uniqueUsers.some(u => u.id === id)
    );
    if (validUserIds.length !== currentUserIds.length) {
      form.setValue("userIds", validUserIds);
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-emerald-500",
      medium: "bg-amber-500",
      high: "bg-orange-500",
      critical: "bg-rose-500"
    };
    return colors[priority as keyof typeof colors] || "bg-gray-500";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py    -12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
         <div className="flex  justify-center items-center gap-8"> <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
            {mode === "create" ? "Create New Task" : "Update Task"}
          </h1></div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {mode === "create" 
              ? "Define your task details, assign team members, and set priorities to keep your project on track"
              : "Update task information and manage assignments"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 sm:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Task Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-900">
                        Task Title <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="e.g., Implement user authentication module"
                          className="h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500">
                        A clear, descriptive title for the task
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-900">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isSubmitting}
                          placeholder="Provide detailed information about requirements, goals, deliverables, and any specific instructions..."
                          className="min-h-[60px] text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500">
                        Optional but recommended for clarity
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Two Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Projects */}
                  <FormField
                    control={form.control}
                    name="projectIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <FolderKanban className="w-4 h-4 text-blue-600" />
                          Projects <span className="text-rose-500">*</span>
                        </FormLabel>
                        <Popover open={projectsOpen} onOpenChange={setProjectsOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                disabled={isSubmitting}
                                className="w-full justify-start text-left font-normal h-auto min-h-[48px] border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                              >
                                {field.value?.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {field.value.map((id) => {
                                      const project = projects.find(p => p.id === id);
                                      return (
                                        <Badge key={id} variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                          {project?.name}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">Select one or more projects...</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[320px] p-0" align="start">
                            <div className="p-4 space-y-2 max-h-[280px] overflow-y-auto">
                              {projects.map((project) => (
                                <div key={project.id} className="flex items-center space-x-3 hover:bg-slate-50 p-2.5 rounded-lg transition-colors">
                                  <Checkbox
                                    id={`project-${project.id}`}
                                    checked={field.value?.includes(project.id)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...(field.value || []), project.id]
                                        : field.value?.filter((id) => id !== project.id) || [];
                                      field.onChange(newValue);
                                      handleSelectProject(newValue);
                                    }}
                                    className="border-slate-400"
                                  />
                                  <label 
                                    htmlFor={`project-${project.id}`}
                                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                                  >
                                    {project.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription className="text-slate-500">
                          Link this task to relevant projects
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Priority */}
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          Priority Level <span className="text-rose-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select priority level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">
                              <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span className="font-medium">Low</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="medium">
                              <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span className="font-medium">Medium</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="high">
                              <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                                <span className="font-medium">High</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="critical">
                              <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                <span className="font-medium">Critical</span>
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-slate-500">
                          Set task urgency and importance
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Employees */}
                  <FormField
                    control={form.control}
                    name="userIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-600" />
                          Assign Team Members <span className="text-rose-500">*</span>
                        </FormLabel>
                        <Popover open={usersOpen} onOpenChange={setUsersOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                disabled={isSubmitting || users.length === 0}
                                className="w-full justify-start text-left font-normal h-auto min-h-[48px] border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                              >
                                {field.value?.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {field.value.map((id) => {
                                      const user = users.find((u) => u.id === id);
                                      return (
                                        <Badge key={id} variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                                          {user?.name}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">
                                    {users.length === 0 ? "Select projects first..." : "Select team members..."}
                                  </span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[320px] p-0" align="start">
                            <div className="p-4 space-y-2 max-h-[280px] overflow-y-auto">
                              {users.map((user) => (
                                <div key={user.id} className="flex items-center space-x-3 hover:bg-slate-50 p-2.5 rounded-lg transition-colors">
                                  <Checkbox
                                    id={`user-${user.id}`}
                                    checked={field.value?.includes(user.id)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...(field.value || []), user.id]
                                        : field.value?.filter((id) => id !== user.id) || [];
                                      field.onChange(newValue);
                                    }}
                                    className="border-slate-400"
                                  />
                                  <label 
                                    htmlFor={`user-${user.id}`}
                                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                                  >
                                    {user.name}
                                  </label>
                                </div>
                              ))}
                              {users.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-6">
                                  No team members available in selected projects
                                </p>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription className="text-slate-500">
                          Choose who will work on this task
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Deadline */}
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-green-600" />
                          Deadline <span className="text-rose-500">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                disabled={isSubmitting}
                                className="w-full h-12 pl-3 text-left font-normal border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                              >
                                {field.value ? (
                                  <span className="text-slate-900">{format(field.value, "PPP")}</span>
                                ) : (
                                  <span className="text-slate-400">Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 text-slate-400" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription className="text-slate-500">
                          Target completion date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Remark */}
                <FormField
                  control={form.control}
                  name="remark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-900">
                        Additional Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isSubmitting}
                          placeholder="Any special instructions, dependencies, or important context for this task..."
                          className="min-h-[40px] text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500">
                        Optional field for extra context
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                  <Button 
                    type="button"
                    variant='outline' 
                    className="h-12 text-base font-medium border-slate-300 hover:bg-slate-100"
                    onClick={() => {
                      form.reset();
                      setUsers([]);
                    }}
                    disabled={isSubmitting}
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all sm:ml-auto sm:min-w-[180px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        {mode === "create" ? "Create Task" : "Update Task"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Footer Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Fields marked with <span className="text-rose-500">*</span> are required
          </p>
        </div>
      </div>
    </div>
  );
}