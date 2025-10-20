"use client"

import { usePathname } from 'next/navigation';
import { Cog, ListTodo, Zap } from 'lucide-react';

import { HEADER_INFO } from '@/constants';


const DashboardHeader = () => {
  const pathname = usePathname();
  const filteredData = HEADER_INFO.filter(header => header.href === pathname);

  return (
    <header className='w-full h-[70px] px-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white flex justify-between items-center border-b border-gray-200'>
      {filteredData && filteredData.map((item) => (
        <div key={item.href} className='flex items-center gap-3'>
          {/* <item.icon className='w-7 h-7 text-voilet' /> */}
         
          {/* <h1 className='text-slate-500'>{item.label}</h1> */}
        </div>
      ))}
      {filteredData.length === 0 && (
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <ListTodo className='w-7 h-7 text-indigo-600' />
            <Zap className='w-3 h-3 text-yellow-500 absolute -top-1 -right-1' />
          </div>
          <div>
            <h1 className='text-xl font-bold'>Task Tracker</h1>
            <p className='text-xs'>Stay on top of your projects</p>
          </div>
        </div>
      )}
    </header>
  )
}

export default DashboardHeader