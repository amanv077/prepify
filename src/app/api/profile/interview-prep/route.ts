import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import UserProfile from '@/models/UserProfile'

// Fixed field mapping to match model schema
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role, company, experience, expectedCTC, skillsRequired } = body

    await connectDB()
    
    const profile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if user already has an interview preparation
    if (profile.interviewPreparations.length > 0) {
      return NextResponse.json({ 
        error: 'You can only have one interview preparation at a time. Please delete the existing one first.' 
      }, { status: 400 })
    }

    const newInterviewPrep = {
      targetRole: role,
      targetCompany: company,
      requiredExperience: experience,
      expectedCTC,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [skillsRequired],
      createdAt: new Date()
    }

    profile.interviewPreparations.push(newInterviewPrep)
    await profile.save()

    return NextResponse.json(
      { message: 'Interview preparation added successfully', profile },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding interview preparation:', error)
    return NextResponse.json(
      { error: 'Failed to add interview preparation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prepId, role, company, experience, expectedCTC, skillsRequired } = body

    await connectDB()
    
    const profile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const prepIndex = profile.interviewPreparations.findIndex(
      (prep: any) => prep._id.toString() === prepId
    )

    if (prepIndex === -1) {
      return NextResponse.json({ error: 'Interview preparation not found' }, { status: 404 })
    }

    profile.interviewPreparations[prepIndex] = {
      ...profile.interviewPreparations[prepIndex].toObject(),
      targetRole: role,
      targetCompany: company,
      requiredExperience: experience,
      expectedCTC,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [skillsRequired]
    }

    await profile.save()

    return NextResponse.json(
      { message: 'Interview preparation updated successfully', profile },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating interview preparation:', error)
    return NextResponse.json(
      { error: 'Failed to update interview preparation' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const prepId = searchParams.get('id')

    if (!prepId) {
      return NextResponse.json({ error: 'Interview preparation ID is required' }, { status: 400 })
    }

    await connectDB()
    
    const profile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    profile.interviewPreparations = profile.interviewPreparations.filter(
      (prep: any) => prep._id.toString() !== prepId
    )

    await profile.save()

    return NextResponse.json(
      { message: 'Interview preparation deleted successfully', profile },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting interview preparation:', error)
    return NextResponse.json(
      { error: 'Failed to delete interview preparation' },
      { status: 500 }
    )
  }
}
