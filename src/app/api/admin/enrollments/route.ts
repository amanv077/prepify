import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import CourseEnrollment from '@/models/CourseEnrollment'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const courseId = searchParams.get('courseId') || ''

    await connectToDatabase()

    // Build filter query
    const filterQuery: any = {}
    if (status) filterQuery.enrollmentStatus = status
    if (courseId) filterQuery.courseId = courseId

    // Get enrollments with pagination
    const [enrollments, totalEnrollments] = await Promise.all([
      CourseEnrollment.find(filterQuery)
        .populate('userId', 'name email')
        .populate('courseId', 'courseName courseTitle teacher')
        .populate('approvedBy', 'name email')
        .populate('rejectedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CourseEnrollment.countDocuments(filterQuery)
    ])

    const totalPages = Math.ceil(totalEnrollments / limit)

    return NextResponse.json({
      enrollments,
      pagination: {
        currentPage: page,
        totalPages,
        totalEnrollments,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const body = await req.json()
    const { enrollmentId, action, rejectionReason } = body

    if (!enrollmentId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const enrollment = await CourseEnrollment.findById(enrollmentId)
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    if (enrollment.enrollmentStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Enrollment has already been processed' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    if (action === 'approve') {
      updateData.enrollmentStatus = 'APPROVED'
      updateData.approvedAt = new Date()
      updateData.approvedBy = session.user.id
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        )
      }
      updateData.enrollmentStatus = 'REJECTED'
      updateData.rejectedAt = new Date()
      updateData.rejectedBy = session.user.id
      updateData.rejectionReason = rejectionReason
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    await CourseEnrollment.findByIdAndUpdate(enrollmentId, updateData)

    return NextResponse.json({
      message: `Enrollment ${action}ed successfully`
    })

  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    )
  }
}
