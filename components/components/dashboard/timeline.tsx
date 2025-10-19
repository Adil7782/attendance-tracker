"use client"
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Users, AlertCircle, ChevronDown, ChevronRight, Plus, Repeat } from 'lucide-react';
import { Prisma } from '@prisma/client';
import TaskRecommendation from '@/app/(dashboard)/analytics/tasks/_components/AssignUser';
import Link from 'next/link';

// Add type definitions


// Use Prisma payload type for a single task
type TaskType = Prisma.TaskGetPayload<{
  include: {
    assignments: {
      include: {
        user: true
      }
    }
  }
}>;

interface TaskTimelineManagerProps {
  tasks: TaskType[];
  isSE?: boolean; // 👈 added this
}

// Component now accepts an array of tasks returned by findMany()
const TaskTimelineManager = ({ tasks, isSE }: TaskTimelineManagerProps) => {
  const [view, setView] = useState<'gantt' | 'calendar'>('gantt');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showAddDependency, setShowAddDependency] = useState<string | null>(null);
  const [showRecurring, setShowRecurring] = useState<string | null>(null);

  // Sample data structure based on your schema


  const priorityColors: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const statusColors: Record<string, string> = {
    'Pending': 'bg-gray-400',
    'In Progress': 'bg-blue-500',
    'Completed': 'bg-green-500',
    'Blocked': 'bg-red-500'
  };

  const toggleTaskExpansion = (taskId: string): void => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getDaysInMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getTaskPosition = (task: TaskType) => {
    const start = new Date(selectedMonth);
    start.setDate(1);
    const end = new Date(selectedMonth);
    end.setDate(getDaysInMonth(selectedMonth));

    const taskStart = new Date(task.createdAt as unknown as string || task.createdAt);
    const taskEnd = new Date(task.deadline!);

    const totalDays = getDaysInMonth(selectedMonth);
    const startDay = Math.max(1, taskStart.getDate());
    const endDay = Math.min(totalDays, taskEnd.getDate());

    const left = ((startDay - 1) / totalDays) * 100;
    const width = ((endDay - startDay + 1) / totalDays) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const isOverdue = (deadline: Date): boolean => {
    return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
  };

  const getDependentTasks = (taskId: string): TaskType[] => {
    return tasks.filter(t => (t as any).dependencies?.includes(taskId));
  };



  const GanttView: React.FC = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const newDate = new Date(selectedMonth);
              newDate.setMonth(newDate.getMonth() - 1);
              setSelectedMonth(newDate);
            }}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Prev
          </button>
          <h3 className="text-lg font-semibold">
            {selectedMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={() => {
              const newDate = new Date(selectedMonth);
              newDate.setMonth(newDate.getMonth() + 1);
              setSelectedMonth(newDate);
            }}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Next →
          </button>
        </div>
        <div className="flex gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Low</span>
          </div>
        </div>
      </div>

      {/* Timeline header */}
      <div className="flex border-b border-gray-300">
        <div className="w-64 p-2 font-semibold bg-gray-100">Task</div>
        <div className="flex-1 flex bg-gray-50">
          {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => (
            <div
              key={i}
              className="flex-1 text-center text-xs p-1 border-l border-gray-200"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      {tasks.map((task) => (
        <div key={task.id} className="border-b border-gray-200">
          <div className="flex items-start">
            <div className="w-64 p-3 bg-white">
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleTaskExpansion(task.id)}
                  className="mt-1"
                >
                  {expandedTasks.has(task.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">
                      {(task as any).title ?? "Untitled"}
                    </h4>
                    {(task as any).type === "recurring" && (
                      <Repeat className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        priorityColors[(task as any).priority ?? "low"]
                      }`}
                    ></span>
                    <span className="text-xs text-gray-600">
                      {(task.assignments ?? []).length} assigned
                    </span>
                  </div>
                  {isOverdue(task.deadline as unknown as Date) && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>Overdue</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 relative h-16 bg-gray-50">
              <div
                className={`absolute top-4 h-8 ${
                  priorityColors[(task as any).priority ?? "low"]
                } bg-opacity-70 rounded flex items-center justify-center text-white text-xs font-medium`}
                style={getTaskPosition(task)}
              >
                {task.assignments && task.assignments[0]?.user?.name
                  ? task.assignments[0].user.name.split(" ")[0]
                  : "—"}
              </div>

              {/* Dependency lines */}
              {((task as any).dependencies?.length ?? 0) > 0 && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute top-8 left-0 w-2 h-0.5 bg-purple-500"></div>
                </div>
              )}
            </div>
          </div>

          {/* Expanded details */}
          {expandedTasks.has(task.id) && (
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Description</h5>
                  <p className="text-sm text-gray-700">
                    {(task as any).description ?? ""}
                  </p>

                  <div className="mt-3">
                    <h5 className="font-medium text-sm mb-2">Deadline</h5>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      {new Date(task.deadline!).toLocaleDateString()}
                    </div>
                  </div>

                  {(task as any).recurring && (
                    <div className="mt-3">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Repeat className="w-4 h-4" />
                        Recurring Task
                      </h5>
                      <p className="text-sm text-gray-700">
                        Repeats {(task as any).recurring.interval} on{" "}
                        {(task as any).recurring.day}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Assignments ({(task.assignments ?? []).length})
                  </h5>
                  <div className="space-y-2">
                    {(task.assignments ?? []).map((assignment) => (
                      <div
                        key={
                          assignment.id ??
                          (assignment as any).user?.id ??
                          Math.random()
                        }
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {assignment.user?.name ?? "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {(assignment as any).project?.name ?? ""}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs text-white ${
                            statusColors[
                              (assignment as any).status ?? "Pending"
                            ]
                          }`}
                        >
                          {(assignment as any).status ?? "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {((task as any).dependencies?.length ?? 0) > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-sm mb-2">Dependencies</h5>
                      <div className="space-y-1">
                        {((task as any).dependencies ?? []).map(
                          (depId: string) => {
                            const depTask = tasks.find((t) => t.id === depId);
                            return depTask ? (
                              <div
                                key={depId}
                                className="text-sm text-gray-700 flex items-center gap-2"
                              >
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                {(depTask as any).title}
                              </div>
                            ) : null;
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {getDependentTasks(task.id).length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-sm mb-2">Blocks</h5>
                      <div className="space-y-1">
                        {getDependentTasks(task.id).map((depTask) => (
                          <div
                            key={depTask.id}
                            className="text-sm text-gray-700 flex items-center gap-2"
                          >
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            {(depTask as any).title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Task button - always visible */}
      {!isSE && (
        <div className="fixed bottom-4 right-4">
          <Link href={"/analytics/tasks/create-new"}>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">Add Task</span>
          </button>
          </Link>
        </div>
      )}
    </div>
  );

  const CalendarView: React.FC = () => {
    const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();
    const daysInMonth = getDaysInMonth(selectedMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const getTasksForDay = (day: number | null): TaskType[] => {
      if (!day) return [];
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
      return tasks.filter(task => {
        const deadline = new Date(task.deadline!);
        return deadline.getDate() === day &&
               deadline.getMonth() === date.getMonth() &&
               deadline.getFullYear() === date.getFullYear();
      });
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedMonth(newDate);
              }}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← Prev
            </button>
            <h3 className="text-lg font-semibold">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedMonth(newDate);
              }}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-sm p-2 bg-gray-100 rounded">
              {day}
            </div>
          ))}

          {days.map((day, idx) => {
            const dayTasks = getTasksForDay(day);
            const isToday = day &&
              day === new Date().getDate() &&
              selectedMonth.getMonth() === new Date().getMonth() &&
              selectedMonth.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={idx}
                className={`min-h-24 p-2 border rounded ${
                  !day ? 'bg-gray-50' : isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                }`}
              >
                {day && (
                  <>
                    <div className="font-semibold text-sm mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayTasks.map(task => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded ${priorityColors[((task as any).priority ?? 'low')]} bg-opacity-20 border-l-2 ${priorityColors[((task as any).priority ?? 'low')]}`}
                        >
                          <div className="font-medium truncate">{(task as any).title}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Users className="w-3 h-3" />
                            <span>{(task.assignments ?? []).length}</span>
                            {(task as any).type === 'recurring' && (
                              <Repeat className="w-3 h-3 ml-auto" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Task Timeline Manager
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('gantt')}
            className={`px-4 py-2 rounded ${
              view === 'gantt' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Gantt View
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded ${
              view === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

                    {!isSE && (  <div className="m-6"><TaskRecommendation/></div>)}


      {view === 'gantt' ? <GanttView /> : <CalendarView />}
    </div>
  );
};

export default TaskTimelineManager;