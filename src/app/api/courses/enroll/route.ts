import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import CourseEnrollment from '@/models/CourseEnrollment'
import Course from '@/models/Course'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const body = await req.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Check if course exists and is active
    const course = await Course.findById(courseId)
    if (!course || !course.isActive) {
      return NextResponse.json(
        { error: 'Course not found or inactive' },
        { status: 404 }
      )
    }

    // Check if user is already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({
      userId: session.user.id,
      courseId: courseId
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { 
          error: 'Already enrolled',
          status: existingEnrollment.enrollmentStatus
        },
        { status: 400 }
      )
    }

    // Create new enrollment
    const enrollment = new CourseEnrollment({
      userId: session.user.id,
      courseId: courseId,
      enrollmentStatus: 'PENDING'
    })

    await enrollment.save()

    return NextResponse.json({
      message: 'Enrollment request submitted successfully',
      enrollmentId: enrollment._id,
      status: enrollment.enrollmentStatus
    })

  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Get user's enrollments
    const enrollments = await CourseEnrollment.find({
      userId: session.user.id
    })
    .populate('courseId', 'courseName courseTitle teacher courseImage level mode duration')
    .sort({ createdAt: -1 })
    .lean()

    return NextResponse.json({ enrollments })

  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}
