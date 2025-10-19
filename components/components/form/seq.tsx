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
import {  CheckCircle2, Loader2, Zap, Users, FolderKanban, AlertCircle, MoveUp, MoveDown, X, ArrowRight, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Mock types - replace with your actual Prisma types
type User = {
  id: string
  name: string
  email: string
}

type Project = {
  id: string
  name: string
  assignments: Array<{ user: User }>
}

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
  isSequential: z.boolean().default(false),
});

type ProjectsProps = {
  projects: Project[],
  initialData?: any | null,
  mode?: string
  taskId?: string
}

export default function TaskForm({ projects, initialData, mode, taskId }: ProjectsProps) {
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [orderedUserIds, setOrderedUserIds] = useState<string[]>([]);
  const [isSequential, setIsSequential] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.task.title || "",
      description: initialData?.task.description || "",
      priority: initialData?.task.priority || "",
      remark: initialData?.task.remark || "",
      projectIds: initialData?.project?.id ? [initialData.project.id] : [],
      userIds: initialData?.user.id ? [initialData.user.id] : [],
      deadline: initialData?.task.deadline || undefined,
      isSequential: false,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    if (initialData?.project?.id) {
      handleSelectProject([initialData.project.id]);
    }
  }, [initialData]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Prepare payload based on mode
    const payload = isSequential 
      ? {
          ...values,
          usersWithSequence: orderedUserIds.map((userId, index) => ({
            userId,
            sequence: index + 1
          }))
        }
      : values;

    console.log("Submitting:", payload);

    if (mode === "create") {
      try {
        // Replace with your actual API call
        // const res = await axios.post("/api/tasks", payload);
        toast.success("Task created successfully!");
        form.reset();
        setUsers([]);
        setOrderedUserIds([]);
        setIsSequential(false);
      } catch (error) {
        console.error("ERROR", error);
        toast.error("Failed to create task");
      }
    } else {
      try {
        // Replace with your actual API call
        // const res = await axios.put(`/api/tasks/update/${taskId}`, payload);
        toast.success("Task updated successfully!");
      } catch (error) {
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
    
    // Clean up invalid users
    const currentUserIds = isSequential ? orderedUserIds : (form.getValues("userIds") || []);
    const validUserIds = currentUserIds.filter(id => 
      uniqueUsers.some(u => u.id === id)
    );
    
    if (validUserIds.length !== currentUserIds.length) {
      if (isSequential) {
        setOrderedUserIds(validUserIds);
      }
      form.setValue("userIds", validUserIds);
    }
  }

  const handleSequentialToggle = (checked: boolean) => {
    setIsSequential(checked);
    form.setValue("isSequential", checked);
    
    if (checked) {
      // Convert current selection to ordered list
      const currentUserIds = form.getValues("userIds") || [];
      setOrderedUserIds(currentUserIds);
    } else {
      // Keep the users but remove ordering
      form.setValue("userIds", orderedUserIds);
    }
  }

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (isSequential) {
      let newOrdered: string[];
      if (checked) {
        newOrdered = [...orderedUserIds, userId];
      } else {
        newOrdered = orderedUserIds.filter(id => id !== userId);
      }
      setOrderedUserIds(newOrdered);
      form.setValue("userIds", newOrdered);
    } else {
      const currentIds = form.getValues("userIds") || [];
      const newValue = checked
        ? [...currentIds, userId]
        : currentIds.filter((id) => id !== userId);
      form.setValue("userIds", newValue);
    }
  }

  const moveUser = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...orderedUserIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setOrderedUserIds(newOrder);
    form.setValue("userIds", newOrder);
  }

  const removeUser = (userId: string) => {
    const newOrder = orderedUserIds.filter(id => id !== userId);
    setOrderedUserIds(newOrder);
    form.setValue("userIds", newOrder);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              {mode === "create" ? "Create New Task" : "Update Task"}
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-3">
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
                          className="min-h-[100px] text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
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

                {/* Sequential Toggle */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowRight className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-900">Sequential Task Assignment</h3>
                      </div>
                      <p className="text-sm text-slate-600">
                        Enable this to assign tasks in a specific order. Each team member must complete their part before the next person can start.
                      </p>
                    </div>
                    <Switch
                      checked={isSequential}
                      onCheckedChange={handleSequentialToggle}
                      disabled={isSubmitting}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                </div>

                {/* Team Assignment Section */}
                <FormField
                  control={form.control}
                  name="userIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        {isSequential ? "Sequential Team Assignment" : "Assign Team Members"} 
                        <span className="text-rose-500">*</span>
                      </FormLabel>

                      {/* User Selection Button */}
                      <Popover open={usersOpen} onOpenChange={setUsersOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              disabled={isSubmitting || users.length === 0}
                              className="w-full justify-start text-left font-normal h-auto min-h-[48px] border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                            >
                              {!isSequential && field.value?.length > 0 ? (
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
                                  {users.length === 0 ? "Select projects first..." : isSequential ? "Add team members in order..." : "Select team members..."}
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
                                  checked={isSequential ? orderedUserIds.includes(user.id) : field.value?.includes(user.id)}
                                  onCheckedChange={(checked) => handleUserToggle(user.id, !!checked)}
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

                      {/* Sequential Ordered List */}
                      {isSequential && orderedUserIds.length > 0 && (
                        <div className="mt-4 space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            Execution Order:
                          </p>
                          {orderedUserIds.map((userId, index) => {
                            const user = users.find(u => u.id === userId);
                            return (
                              <div
                                key={userId}
                                className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200 shadow-sm"
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                                  {index + 1}
                                </div>
                                <span className="flex-1 font-medium text-slate-900">{user?.name}</span>
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    disabled={index === 0}
                                    onClick={() => moveUser(index, 'up')}
                                    className="h-8 w-8 p-0 hover:bg-slate-100"
                                  >
                                    <MoveUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    disabled={index === orderedUserIds.length - 1}
                                    onClick={() => moveUser(index, 'down')}
                                    className="h-8 w-8 p-0 hover:bg-slate-100"
                                  >
                                    <MoveDown className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeUser(userId)}
                                    className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <FormDescription className="text-slate-500">
                        {isSequential 
                          ? "Users will complete tasks in the order shown above"
                          : "Choose who will work on this task"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          className="min-h-[80px] text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
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
                      setOrderedUserIds([]);
                      setIsSequential(false);
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