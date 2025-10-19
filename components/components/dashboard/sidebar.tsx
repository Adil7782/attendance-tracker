"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import SidebarRoutes from "./sidebar-routes"
import SignOutButton from "../auth/signout-button"

const Sidebar = ({ role }: { role: string }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-lg hover:shadow-xl transition-all"
            >
                {isMobileOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Menu className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen z-50 
                    w-72 lg:w-64 xl:w-72
                    bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
                    border-r border-slate-800/50
                    shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="relative px-6 py-5 border-b border-slate-800/50 bg-gradient-to-r from-slate-800/30 to-transparent">
                        <Link 
                            href="/dashboard"
                            className="block group"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <Image
                                src='/task-tracker-logo.jpg'
                                alt="logo"
                                width={140}
                                height={240}
                                className="w-[220px] transition-transform group-hover:scale-105"
                            />
                        </Link>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    </div>

                    {/* Navigation Section */}
                    <div className="flex-1 overflow-hidden">
                        <SidebarRoutes 
                            role={role} 
                            onNavigate={() => setIsMobileOpen(false)}
                        />
                    </div>

                    {/* Sign Out Section */}
                    <div className="p-4 border-t border-slate-800/50 bg-gradient-to-t from-slate-950/80 to-transparent">
                        <SignOutButton />
                    </div>
                </div>

                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            </aside>
        </>
    )
}

export default Sidebar