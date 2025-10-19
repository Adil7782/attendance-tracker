"use client"

import { TrendingUp, Sparkles, Loader2, AlertTriangle, CheckCircle2, Target, Lightbulb } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Prisma, Project } from "@prisma/client"
import { useEffect, useState } from "react"
import axios from "axios"

export const description = "A multiple bar chart"

const chartConfig = {
  completed: {
    label: "Completed",
    color: "#22c55e",
  },
  ongoing: {
    label: "Ongoing",
    color: "#eab308",
  },
  pending: {
    label: "Pending",
    color: "#3b82f6",
  },
  Tasks: {
    label: "Tasks",
    color: "#0A2472",
  },
} satisfies ChartConfig

type propType = Prisma.ProjectGetPayload<{
  include: {
    TaskAssignment: {
      include: {
        task: true
      }
    }
  }
}>

interface AIResponse {
  summary: string;
  statistics: {
    totalProjects: number;
    totalTasks: number;
    totalCompleted: number;
    totalPending: number;
    totalOngoing: number;
    overallCompletionRate: number;
  };
}

export function ChartBarMultiple({ projects }: { projects: propType[] }) {
  const [chartData, setchartData] = useState<any>([])
  const [aiSummary, setAiSummary] = useState<string>("")
  const [aiStatistics, setAiStatistics] = useState<AIResponse["statistics"] | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState<string>("")

  useEffect(() => {
    getCalulatedData()
  }, [projects])

  const getCalulatedData = async () => {
    const names = projects.map((p) => {
      const taskCount = p.TaskAssignment.length;
      const completed = p.TaskAssignment.filter((ta) => ta.status === "Complete").length
      const pending = p.TaskAssignment.filter((ta) => ta.status === "Pending").length
      const ongoing = p.TaskAssignment.filter((ta) => ta.status === "Ongoing").length
      return {
        name: p.name,
        taskCount,
        completed,
        pending,
        ongoing
      }
    })
    
    console.log(names)
    setchartData(names)
    
    // Fetch AI summary
    setIsLoadingAI(true)
    setAiError("")
    try {
      const res = await axios.post("/api/gemini/askProject", { projects: names });
      console.log(res.data)
      setAiSummary(res.data.summary)
      setAiStatistics(res.data.statistics)
    } catch (error) {
      console.error("Error fetching AI summary:", error)
      setAiError("Failed to generate AI insights. Please try again.")
    } finally {
      setIsLoadingAI(false)
    }
  }

  const parseSummary = (text: string) => {
    const sections = {
      executiveSummary: "",
      priorities: [] as string[],
      insights: [] as string[],
      recommendations: [] as string[]
    }

    const lines = text.split('\n')
    let currentSection = ""

    lines.forEach(line => {
      const trimmed = line.trim()
      
      if (trimmed.includes("Executive Summary")) {
        currentSection = "executive"
      } else if (trimmed.includes("Project Priorities")) {
        currentSection = "priorities"
      } else if (trimmed.includes("Performance Insights")) {
        currentSection = "insights"
      } else if (trimmed.includes("Recommendations")) {
        currentSection = "recommendations"
      } else if (trimmed && !trimmed.startsWith("#")) {
        if (currentSection === "executive" && !trimmed.startsWith("*")) {
          sections.executiveSummary += trimmed + " "
        } else if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
          const content = trimmed.replace(/^\*+\s*/, "").replace(/^-\s*/, "")
          if (content) {
            if (currentSection === "priorities") sections.priorities.push(content)
            else if (currentSection === "insights") sections.insights.push(content)
            else if (currentSection === "recommendations") sections.recommendations.push(content)
          }
        }
      }
    })

    return sections
  }

  const summary = aiSummary ? parseSummary(aiSummary) : null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Task Status</CardTitle>
          <CardDescription>
            Overview of task distribution across {projects.length} project{projects.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + '...' : value}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <ChartTooltip
                  content={<ChartTooltipContent
                    indicator="dashed"
                    labelFormatter={(value) => `Project: ${value}`}
                  />}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar
                  dataKey="taskCount"
                  fill={chartConfig.Tasks.color}
                  radius={[4, 4, 0, 0]}
                  name="Tasks"
                  stackId="a"
                />
                <Bar
                  dataKey="pending"
                  fill={chartConfig.pending.color}
                  radius={[4, 4, 0, 0]}
                  name="Pending"
                  stackId="d"
                />
                <Bar
                  dataKey="ongoing"
                  fill={chartConfig.ongoing.color}
                  radius={[4, 4, 0, 0]}
                  name="Ongoing"
                  stackId="c"
                />
                <Bar
                  dataKey="completed"
                  fill={chartConfig.completed.color}
                  radius={[4, 4, 0, 0]}
                  name="Completed"
                  stackId="b"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* AI Insights Card */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Project Insights
          </CardTitle>
          <CardDescription>
            Intelligent analysis powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAI && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                <Loader2 className="h-10 w-10 animate-spin text-purple-600 relative" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-purple-900">Analyzing your projects...</p>
                <p className="text-xs text-muted-foreground">AI is reviewing task distribution and patterns</p>
              </div>
            </div>
          )}

          {aiError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Failed to generate insights</p>
                <p className="text-xs text-red-600 mt-1">{aiError}</p>
              </div>
            </div>
          )}

          {!isLoadingAI && !aiError && summary && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              {aiStatistics && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 shadow-sm">
                    <p className="text-xs font-medium text-blue-700 mb-1">Total Tasks</p>
                    <p className="text-3xl font-bold text-blue-900">{aiStatistics.totalTasks}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200 shadow-sm">
                    <p className="text-xs font-medium text-green-700 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-900">{aiStatistics.totalCompleted}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-sky-50 to-sky-100/50 rounded-xl border border-sky-200 shadow-sm">
                    <p className="text-xs font-medium text-sky-700 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-sky-900">{aiStatistics.totalPending}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 shadow-sm">
                    <p className="text-xs font-medium text-amber-700 mb-1">Ongoing</p>
                    <p className="text-3xl font-bold text-amber-900">{aiStatistics.totalOngoing}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 shadow-sm">
                    <p className="text-xs font-medium text-purple-700 mb-1">Progress</p>
                    <p className="text-3xl font-bold text-purple-900">{aiStatistics.overallCompletionRate}%</p>
                  </div>
                </div>
              )}

              {/* Executive Summary */}
              {summary.executiveSummary && (
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-2 text-slate-900">Executive Summary</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {summary.executiveSummary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Priorities */}
              {summary.priorities.length > 0 && (
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Target className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-3 text-slate-900">Priority Projects</h3>
                      <div className="space-y-3">
                        {summary.priorities.map((priority, index) => {
                          const parts = priority.split(':')
                          const projectName = parts[0].replace(/^\*+\s*/, '').trim()
                          const reason = parts[1]?.trim() || ''
                          
                          return (
                            <div key={index} className="flex items-start gap-3 p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 font-semibold shrink-0">
                                #{index + 1}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-900">{projectName}</p>
                                {reason && (
                                  <p className="text-xs text-slate-600 mt-1">{reason}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Insights */}
              {summary.insights.length > 0 && (
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-3 text-slate-900">Performance Insights</h3>
                      <div className="space-y-2.5">
                        {summary.insights.map((insight, index) => {
                          const parts = insight.split(':')
                          const label = parts[0].replace(/^\*+\s*/, '').trim()
                          const content = parts.slice(1).join(':').trim()
                          
                          return (
                            <div key={index} className="flex items-start gap-2.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                <span className="font-medium text-slate-900">{label}:</span> {content}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {summary.recommendations.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-3 text-slate-900">Recommended Actions</h3>
                      <div className="space-y-3">
                        {summary.recommendations.map((recommendation, index) => {
                          const parts = recommendation.split(':')
                          const title = parts[0].replace(/^\*+\s*/, '').trim()
                          const description = parts.slice(1).join(':').trim()
                          
                          return (
                            <div key={index} className="p-3 bg-white rounded-lg border border-green-200">
                              <div className="flex items-start gap-2.5">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-700 font-semibold text-xs shrink-0">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-slate-900 mb-1">{title}</p>
                                  <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoadingAI && !aiError && !aiSummary && (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 text-purple-300" />
              <p className="text-sm font-medium">No AI insights available yet</p>
              <p className="text-xs mt-1">Analysis will appear here once projects are loaded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}