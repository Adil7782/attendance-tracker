// components/AttendanceHistoryTable.tsx
import React from 'react';
import { FileText } from 'lucide-react';
import { Attendance } from '@prisma/client';
import { formatDate, formatTime } from '@/lib/time';

interface AttendanceHistoryTableProps {
  attendances: Attendance[];
}

export default function AttendanceHistoryTable({ attendances }: AttendanceHistoryTableProps) {
  return (
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
            {attendances.map((record) => (
              <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">{formatDate(record.loginTime)}</td>
                <td className="py-3 px-4 text-gray-800">{formatTime(record.loginTime)}</td>
                <td className="py-3 px-4 text-gray-800">
                  {record.logoutTime ? formatTime(record.logoutTime) : "-"}
                </td>
                <td className="py-3 px-4 text-gray-800 font-medium">
                  {record.availableTime ? record.availableTime : "-"}
                </td>
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
  );
}