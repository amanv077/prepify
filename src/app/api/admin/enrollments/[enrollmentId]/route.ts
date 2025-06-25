import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import CourseEnrollment from '@/models/CourseEnrollment'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, rejectionReason } = body
    const { enrollmentId } = await params

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    await connectDB()
    
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

    // Update enrollment based on action
    if (action === 'approve') {
      enrollment.enrollmentStatus = 'APPROVED'
      enrollment.approvedAt = new Date()
      enrollment.approvedBy = session.user.id
    } else {
      enrollment.enrollmentStatus = 'REJECTED'
      enrollment.rejectedAt = new Date()
      enrollment.rejectedBy = session.user.id
      if (rejectionReason) {
        enrollment.rejectionReason = rejectionReason
      }
    }

    await enrollment.save()

    return NextResponse.json(
      { 
        message: `Enrollment ${action}d successfully`, 
        enrollment 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    )
  }
}
