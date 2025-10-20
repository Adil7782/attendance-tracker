// The original file, now refactored
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { formatDuration } from '@/lib/time';
import { Prisma, User } from '@prisma/client';
import ClockCard from '@/components/components/dashboard/clockCard';
import WorkStatusCard from '@/components/components/dashboard/workStatusCard';
import TaskStatsCard from '@/components/components/dashboard/taskStatsCard';
import ProfileCard from '@/components/components/dashboard/profileCard';
import HolidayCalendar from '@/components/components/dashboard/calenderCompo';
import AttendanceHistoryTable from '@/components/components/dashboard/attendanceHistory';


// ... (Keep your type definitions: AttendanceRecord, TaskStats, Holiday, UserWithRelations)
interface TaskStats {
  pending: number;
  inProgress: number;
  completed: number;
}

type UserWithRelations = Prisma.UserGetPayload<{
    include: {
      attendances: true
      taskAssignments: { include: { task: true } }
    }
  }>

export default function AttendanceDashboard({ userData }: { userData: UserWithRelations }) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [loginTime, setLoginTime] = useState<Date | null>(null);
  const [workDuration, setWorkDuration] = useState<number>(0);
  const [isClient, setIsClient] = useState<boolean>(false);
  const router = useRouter();

  // Task stats calculation remains here as it depends on userData
  const taskStats = userData.taskAssignments.reduce(
    (acc, next) => {
      if (next.status === 'Pending') acc.pending++;
      else if (next.status === 'Ongoing') acc.inProgress++;
      else if (next.status === 'Complete') acc.completed++;
      return acc;
    },
    { pending: 0, inProgress: 0, completed: 0 }
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const savedLoginTime = localStorage.getItem('loginTime');
    if (savedLoginTime) {
      const parsedLoginTime = new Date(savedLoginTime);
      setLoginTime(parsedLoginTime);
      setIsWorking(true);
      const diff = Math.floor((new Date().getTime() - parsedLoginTime.getTime()) / 1000);
      setWorkDuration(diff);
    }
  }, [isClient]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorking && loginTime) {
      interval = setInterval(() => {
        const diff = Math.floor((new Date().getTime() - loginTime.getTime()) / 1000);
        setWorkDuration(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorking, loginTime]);

  const handleStartWork = async () => {
    const now = new Date();
    setLoginTime(now);
    setIsWorking(true);
    setWorkDuration(0);
    if (isClient) {
      localStorage.setItem('loginTime', now.toISOString());
    }
    try {
      await axios.post('/api/attendance/start', {
        userId: userData.id,
        loginTime: now.toISOString(),
      });
      router.refresh();
    } catch (error) {
      console.error("Error starting work:", error);
    }
  };

  const handleEndWork = async () => {
    setIsWorking(false);
    setLoginTime(null);
    if (isClient) {
      localStorage.removeItem('loginTime');
    }
    try {
      await axios.post('/api/attendance/end', {
        userId: userData.id,
        logoutTime: new Date().toISOString(),
        workDuration: formatDuration(workDuration),
      });
      router.refresh();
    } catch (error) {
      console.error("Error ending work:", error);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Dashboard</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClockCard currentTime={currentTime} />
          <WorkStatusCard
            isWorking={isWorking}
            loginTime={loginTime}
            workDuration={workDuration}
            handleStartWork={handleStartWork}
            handleEndWork={handleEndWork}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProfileCard userData={userData} />
          <TaskStatsCard taskStats={taskStats} />
          <HolidayCalendar />
        </div>

        <AttendanceHistoryTable attendances={userData.attendances} />
      </div>
    </div>
  );
}