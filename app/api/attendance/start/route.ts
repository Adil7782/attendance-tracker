import { db } from '@/lib/db'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId, loginTime } = await req.json()

    if (!userId || !loginTime) {
      return NextResponse.json({ message: 'Missing userId or loginTime' }, { status: 400 })
    }

    // Check if there is already an active session
    const existingAttendance = await db.attendance.findFirst({
      where: {
        userId,
        logoutTime: null,
      },
    })

    if (existingAttendance) {
      return NextResponse.json(
        { message: 'You are already logged in. Please logout before logging in again.' },
        { status: 400 }
      )
    }

    // Create new login record if no active one exists
    const newAttendance = await db.attendance.create({
      data: {
        userId,
        loginTime: new Date(loginTime),
      },
    })

    return NextResponse.json({ message: 'Login recorded successfully', data: newAttendance })
  } catch (error) {
    console.error('Error creating attendance record:', error)
    return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 })
  }
}
