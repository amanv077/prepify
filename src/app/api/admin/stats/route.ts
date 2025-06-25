import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import CourseEnrollment from '@/models/CourseEnrollment'
import InterviewSession from '@/models/InterviewSession'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Get various stats
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      pendingEnrollments,
      activeSessions,
      usersLastMonth
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      CourseEnrollment.countDocuments(),
      CourseEnrollment.countDocuments({ enrollmentStatus: 'PENDING' }),
      InterviewSession.countDocuments({ status: 'in-progress' }),
      User.countDocuments({
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        pendingEnrollments,
        activeSessions,
        usersLastMonth
      }
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
