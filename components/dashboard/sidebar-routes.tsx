"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { SIDEBAR_ROUTES } from '@/constants'
import { ScrollArea } from '../ui/scroll-area'

const SidebarRoutes = ({ 
    role, 
    onNavigate 
}: { 
    role: string
    onNavigate?: () => void 
}) => {
    const pathname = usePathname()
    const [expandedCategories, setExpandedCategories] = useState<number[]>([0])

    const visibleCategories = SIDEBAR_ROUTES.filter(category => {
  if (role === "software-engineer") {
    // SE: only show categories that have at least one route starting with /se-dashboard/

    
  return category.routes.some(route =>
      route.href.startsWith("/se-dashboard/")  
    )
  } else if (role === "admin") {
    // Non-SE: exclude any category where all routes are /se-dashboard
    return category.routes.some(route => !route.href.startsWith("/se-dashboard/"))
  }
  else if (role === "viewer") {
    return category.routes.some(route => route.href.startsWith("/analytics/")
)
  }
})

    const toggleCategory = (idx: number) => {
        setExpandedCategories(prev => 
            prev.includes(idx) 
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
        )
    }

    return (
        <ScrollArea className="h-full px-3 py-4">
            <div className="space-y-2">
                {visibleCategories.map((category, idx) => (
                    <div key={idx} className="space-y-1">
                        {/* Category Header */}
                        <button
                            onClick={() => toggleCategory(idx)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                                "text-slate-300 hover:text-white",
                                "hover:bg-slate-800/50 transition-all duration-200",
                                "group relative overflow-hidden",
                                expandedCategories.includes(idx) && "bg-slate-800/30 text-white"
                            )}
                        >
                            {/* Icon */}
                            {category.icon && (
                                <div className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    expandedCategories.includes(idx) 
                                        ? "bg-blue-500/20 text-blue-400" 
                                        : "bg-slate-800/50 text-slate-400 group-hover:text-slate-300"
                                )}>
                                    <category.icon className="w-4 h-4" />
                                </div>
                            )}
                            
                            {/* Text */}
                            <span className="text-sm font-semibold flex-1 text-left">
                                {category.categoryName}
                            </span>
                            
                            {/* Chevron */}
                            <ChevronRight
                                className={cn(
                                    "w-4 h-4 transition-transform duration-300",
                                    expandedCategories.includes(idx) && "rotate-90"
                                )}
                            />

                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Routes */}
                        <div
                            className={cn(
                                "overflow-hidden transition-all duration-300 ease-in-out ml-2",
                                expandedCategories.includes(idx)
                                    ? "max-h-[800px] opacity-100"
                                    : "max-h-0 opacity-0"
                            )}
                        >
                            <div className="space-y-1 py-1 pl-3 border-l-2 border-slate-800/50">
                                {category.routes.map((route) => {
                                    const isVisible = role !== "viewer" || route.href.startsWith("/analytics/")
                                    const isActive = pathname === route.href
                                    
                                    return (
                                        isVisible && (
                                            <Link
                                                href={route.href}
                                                key={route.href}
                                                onClick={onNavigate}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                                                    "text-sm font-medium transition-all duration-200",
                                                    "group relative overflow-hidden",
                                                    isActive
                                                        ? "text-white bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                                                        : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                                                )}
                                            >
                                                {/* Icon */}
                                                <route.icon className={cn(
                                                    "w-4 h-4 transition-colors",
                                                    isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                                                )} />
                                                
                                                {/* Label */}
                                                <span>{route.label}</span>

                                                {/* Active indicator */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full" />
                                                )}

                                                {/* Hover effect */}
                                                {!isActive && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-700/0 via-slate-700/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </Link>
                                        )
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

export default SidebarRoutes