import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Resume } from '@/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const resume = await Resume.findOne({ userId: session.user.id })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    return NextResponse.json({ resume })
  } catch (error) {
    console.error('Error fetching resume:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'city', 'summary']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    await connectDB()

    // Check if user already has a resume
    const existingResume = await Resume.findOne({ userId: session.user.id })
    
    if (existingResume) {
      return NextResponse.json({ error: 'Resume already exists. Use PUT to update.' }, { status: 409 })
    }

    const resumeData = {
      userId: session.user.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      summary: data.summary,
      education: (data.education || []).filter((edu: any) => edu.degree && edu.degree.trim().length > 0),
      experience: (data.experience || []).filter((exp: any) => exp.role && exp.role.trim().length > 0),
      skills: (data.skills || []).filter((skill: string) => skill && skill.trim().length > 0),
      projects: (data.projects || [])
        .filter((project: any) => project.name && project.name.trim().length > 0)
        .map((project: any) => ({
          ...project,
          technologies: (project.technologies || []).filter((tech: string) => tech && tech.trim().length > 0)
        }))
    }

    const resume = new Resume(resumeData)
    await resume.save()

    return NextResponse.json({ message: 'Resume created successfully', resume }, { status: 201 })
  } catch (error) {
    console.error('Error creating resume:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'city', 'summary']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    await connectDB()

    const updateData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      summary: data.summary,
      education: (data.education || []).filter((edu: any) => edu.degree && edu.degree.trim().length > 0),
      experience: (data.experience || []).filter((exp: any) => exp.role && exp.role.trim().length > 0),
      skills: (data.skills || []).filter((skill: string) => skill && skill.trim().length > 0),
      projects: (data.projects || [])
        .filter((project: any) => project.name && project.name.trim().length > 0)
        .map((project: any) => ({
          ...project,
          technologies: (project.technologies || []).filter((tech: string) => tech && tech.trim().length > 0)
        }))
    }

    const resume = await Resume.findOneAndUpdate(
      { userId: session.user.id },
      updateData,
      { new: true, upsert: true }
    )

    return NextResponse.json({ message: 'Resume updated successfully', resume })
  } catch (error) {
    console.error('Error updating resume:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const resume = await Resume.findOneAndDelete({ userId: session.user.id })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Resume deleted successfully' })
  } catch (error) {
    console.error('Error deleting resume:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
