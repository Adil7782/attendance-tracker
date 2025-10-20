// components/ProfileCard.tsx
import React from 'react';
import { User2Icon } from 'lucide-react';
import { User } from '@prisma/client';

interface ProfileCardProps {
  userData: User;
}

export default function ProfileCard({ userData }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <User2Icon className="w-6 h-6 mr-2 text-indigo-600" />
        <h3 className="text-xl font-semibold text-gray-800">Profile</h3>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium text-gray-800">{userData.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium text-gray-800">{userData.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-medium text-gray-800">{userData.role}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p className="font-medium text-gray-800">{userData.phone}</p>
        </div>
      </div>
    </div>
  );
}