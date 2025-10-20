// components/ClockCard.tsx
"use client";

import React from 'react';
import { Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/time';

interface ClockCardProps {
  currentTime: Date;
}

export default function ClockCard({ currentTime }: ClockCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
      <div className="flex items-center mb-4">
        <Clock className="w-8 h-8 mr-3" />
        <h2 className="text-2xl font-semibold">Current Time</h2>
      </div>
      <div className="text-5xl font-bold mb-2">{formatTime(currentTime)}</div>
      <div className="text-lg opacity-90">{formatDate(currentTime)}</div>
    </div>
  );
}