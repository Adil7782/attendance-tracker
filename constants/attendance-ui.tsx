"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, LogIn, LogOut, Calendar, CheckCircle, XCircle, AlertCircle, User, Briefcase, FileText } from 'lucide-react';

// Defining types for our data structures
interface User {
  name: string;
  email: string;
  role: string;
  phone: string;
}

interface AttendanceRecord {
  id: number;
  date: string;
  loginTime: string;
  logoutTime: string;
  duration: string;
}

interface TaskStats {
  pending: number;
  inProgress: number;
  completed: number;
}

interface LeaveBalance {
  casual: number;
  sick: number;
  annual: number;
}

export default function AttendanceDashboard() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [loginTime, setLoginTime] = useState<Date | null>(null);
  const [workDuration, setWorkDuration] = useState<number>(0);
  const router = useRouter();

  // Mock user data with the User interface
  const user: User = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Developer",
    phone: "+1 234 567 8900"
  };

  // Mock attendance history with the AttendanceRecord interface
  const [attendanceHistory] = useState<AttendanceRecord[]>([
    { id: 1, date: "2025-10-18", loginTime: "09:00 AM", logoutTime: "06:00 PM", duration: "9h 0m" },
    { id: 2, date: "2025-10-17", loginTime: "08:45 AM", logoutTime: "05:30 PM", duration: "8h 45m" },
    { id: 3, date: "2025-10-16", loginTime: "09:15 AM", logoutTime: "06:15 PM", duration: "9h 0m" },
    { id: 4, date: "2025-10-15", loginTime: "08:30 AM", logoutTime: "05:45 PM", duration: "9h 15m" },
  ]);

  // Mock task statistics with the TaskStats interface
  const taskStats: TaskStats = {
    pending: 5,
    inProgress: 3,
    completed: 12
  };

  // Mock leave balance with the LeaveBalance interface
  const leaveBalance: LeaveBalance = {
    casual: 8,
    sick: 5,
    annual: 12
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate work duration
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

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/attendance/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.email, loginTime: now.toISOString() }),
      });
      console.log("start", user.email, now.toISOString())
      if (!response.ok) {
        throw new Error('Failed to record login time');
      }

      // On successful API call, you can redirect or refresh the page
      router.push('/dashboard?status=working'); // Example of redirecting
      // Or, to just refresh the data on the current page:
      // router.refresh();

    } catch (error) {
      console.error("Error starting work:", error);
      // Optionally, handle the error in the UI
    }
  };

  const handleEndWork = async () => {
    setIsWorking(false);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/attendance/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.email, logoutTime: new Date().toISOString() }),
      });
      console.log("end",new Date().toISOString())

      if (!response.ok) {
        throw new Error('Failed to record logout time');
      }
      
      router.push('/dashboard?status=ended'); // Example of redirecting

    } catch (error) {
      console.error("Error ending work:", error);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-LK', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-LK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        {/* Current Time & Work Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clock Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center mb-4">
              <Clock className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-semibold">Current Time</h2>
            </div>
            <div className="text-5xl font-bold mb-2">{formatTime(currentTime)}</div>
            <div className="text-lg opacity-90">{formatDate(currentTime)}</div>
          </div>

          {/* Work Status Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Work Status</h2>
            
            {!isWorking ? (
              <button
                onClick={handleStartWork}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors"
              >
                <LogIn className="w-6 h-6 mr-2" />
                Start Work
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium">Login Time:</span>
                    <span className="text-gray-900 font-semibold">{loginTime ? formatTime(loginTime) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Duration:</span>
                    <span className="text-green-600 font-bold text-xl">{formatDuration(workDuration)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleEndWork}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors"
                >
                  <LogOut className="w-6 h-6 mr-2" />
                  End Work
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Info & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 mr-2 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-800">Profile</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-800">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium text-gray-800">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-800">{user.phone}</p>
              </div>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Briefcase className="w-6 h-6 mr-2 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-800">Tasks</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                  <span className="text-gray-700">Pending</span>
                </div>
                <span className="font-bold text-yellow-600 text-xl">{taskStats.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-gray-700">In Progress</span>
                </div>
                <span className="font-bold text-blue-600 text-xl">{taskStats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  <span className="text-gray-700">Completed</span>
                </div>
                <span className="font-bold text-green-600 text-xl">{taskStats.completed}</span>
              </div>
            </div>
          </div>

          {/* Leave Balance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-800">Leave Balance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Casual Leave</span>
                <span className="font-bold text-indigo-600">{leaveBalance.casual} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Sick Leave</span>
                <span className="font-bold text-indigo-600">{leaveBalance.sick} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Annual Leave</span>
                <span className="font-bold text-indigo-600">{leaveBalance.annual} days</span>
              </div>
              <button className="w-full mt-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Apply for Leave
              </button>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 mr-2 text-indigo-600" />
            <h3 className="text-2xl font-semibold text-gray-800">Recent Attendance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Login Time</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Logout Time</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">{record.date}</td>
                    <td className="py-3 px-4 text-gray-800">{record.loginTime}</td>
                    <td className="py-3 px-4 text-gray-800">{record.logoutTime}</td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{record.duration}</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        Present
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}