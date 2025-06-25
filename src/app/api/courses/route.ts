import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Course from '@/models/Course'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') || ''
    const mode = searchParams.get('mode') || ''

    await connectToDatabase()

    // Build search query - only show active, non-archived courses
    const searchQuery: any = { 
      isActive: true,
      isArchived: { $ne: true }
    }
    
    if (search) {
      searchQuery.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { courseTitle: { $regex: search, $options: 'i' } },
        { teacher: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    if (level) searchQuery.level = level
    if (mode) searchQuery.mode = mode

    // Get courses with pagination
    const [courses, totalCourses] = await Promise.all([
      Course.find(searchQuery)
        .select('-createdBy')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Course.countDocuments(searchQuery)
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
