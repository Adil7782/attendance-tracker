import { db } from '@/lib/db';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';



export async function POST(req: Request)  {
 
  const { userId, logoutTime,workDuration } = await req.json();

   if (!userId || !logoutTime || !workDuration) {
        return NextResponse.json({ message: 'Missing userId or logoutTime' }, { status: 400 })
      }

  try {
    // Find the latest attendance record for the user that has not been logged out yet
    const latestAttendance = await db.attendance.findFirst({
      where: {
        userId,
        logoutTime: null,
      },
      orderBy: {
        loginTime: 'desc',
      },
    });

    if (!latestAttendance) {
        return NextResponse.json(
        { message: 'No active attendance record found to end.' },
        { status: 400 }
      )    }

    const updatedAttendance = await db.attendance.update({
      where: {
        id: latestAttendance.id,
      },
      data: {
        logoutTime: new Date(logoutTime),
        availableTime:workDuration
      },
    });
    return NextResponse.json({ message: 'Logout recorded successfully', data: updatedAttendance })


  } catch (error) {
    console.error('Error updating attendance record:', error);
    return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 })
  }
}