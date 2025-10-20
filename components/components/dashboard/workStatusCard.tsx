// components/WorkStatusCard.tsx
"use client";

import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { formatDuration, formatTime } from '@/lib/time';

interface WorkStatusCardProps {
  isWorking: boolean;
  loginTime: Date | null;
  workDuration: number;
  handleStartWork: () => void;
  handleEndWork: () => void;
}

export default function WorkStatusCard({
  isWorking,
  loginTime,
  workDuration,
  handleStartWork,
  handleEndWork,
}: WorkStatusCardProps) {
  return (
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
              <span className="text-gray-900 font-semibold">
                {loginTime ? formatTime(loginTime) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Duration:</span>
              <span className="text-green-600 font-bold text-xl">
                {formatDuration(workDuration)}
              </span>
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
  );
}