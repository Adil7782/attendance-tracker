// components/HolidayCalendar.tsx
"use client";

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';

export default function HolidayCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="bg-white rounded-lg shadow-md p-2">
      <div className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
      </div>
    </div>
  );
}