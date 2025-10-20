// components/TaskStatsCard.tsx
import React from 'react';
import { Briefcase, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface TaskStats {
  pending: number;
  inProgress: number;
  completed: number;
}

interface TaskStatsCardProps {
  taskStats: TaskStats;
}

export default function TaskStatsCard({ taskStats }: TaskStatsCardProps) {
  return (
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
        <div className="flex justify-center mt-4">
  <a 
    href="https://task-tracker-r58v.vercel.app/" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200">
      Check Tasks
    </Button>
  </a>
</div>

      </div>
    </div>
  );
}