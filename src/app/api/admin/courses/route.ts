import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import Course from '@/models/Course'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const body = await req.json()
    const {
      courseName,
      courseId,
      skills,
      courseTitle,
      courseDetails,
      teacher,
      duration,
      level,
      whatYouWillLearn,
      mode,
      courseImage
    } = body

    // Validate required fields
    if (!courseName || !courseTitle || !courseDetails || !teacher || !duration || !level || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!skills || skills.length === 0) {
      return NextResponse.json(
        { error: 'At least one skill is required' },
        { status: 400 }
      )
    }

    if (!whatYouWillLearn || whatYouWillLearn.length === 0) {
      return NextResponse.json(
        { error: 'At least one learning outcome is required' },
        { status: 400 }
      )
    }

    // Generate courseId if not provided
    const finalCourseId = courseId || `${courseName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6)}_${Math.random().toString(36).substring(2, 8)}`

    // Check if courseId already exists
    const existingCourse = await Course.findOne({ courseId: finalCourseId })
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course ID already exists' },
        { status: 400 }
      )
    }

    // Create new course
    const course = new Course({
      courseName,
      courseId: finalCourseId,
      skills,
      courseTitle,
      courseDetails,
      teacher,
      duration,
      level,
      whatYouWillLearn,
      mode,
      courseImage,
      createdBy: session.user.id
    })

    await course.save()

    return NextResponse.json({
      message: 'Course created successfully',
      course: {
        _id: course._id,
        courseName: course.courseName,
        courseId: course.courseId,
        courseTitle: course.courseTitle
      }
    })

  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const archived = searchParams.get('archived') === 'true'

    await connectToDatabase()

    // Build search and filter query
    const query: any = {}
    
    // Add archived filter - handle cases where isArchived field doesn't exist (defaults to false)
    if (archived) {
      query.isArchived = true
    } else {
      query.$or = [
        { isArchived: { $exists: false } },
        { isArchived: false }
      ]
    }
    
    // Add search conditions
    if (search) {
      const searchConditions = [
        { courseName: { $regex: search, $options: 'i' } },
        { courseTitle: { $regex: search, $options: 'i' } },
        { teacher: { $regex: search, $options: 'i' } }
      ]
      
      if (query.$or) {
        // If we already have $or for archived filter, combine with AND
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ]
        delete query.$or
      } else {
        query.$or = searchConditions
      }
    }

    // Get courses with pagination
    const [courses, totalCourses] = await Promise.all([
      Course.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Course.countDocuments(query)
    ])

    const totalPages = Math.ceil(totalCourses / limit)

    return NextResponse.json({
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
