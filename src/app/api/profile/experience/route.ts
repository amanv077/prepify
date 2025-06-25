import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import UserProfile from '@/models/UserProfile'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role, company, duration, description, startDate, endDate, isCurrentJob } = body

    await connectDB()
    
    const profile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const newExperience = {
      role,
      company,
      duration,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      isCurrentJob: Boolean(isCurrentJob)
    }

    profile.experience.push(newExperience)
    await profile.save()

    return NextResponse.json(
      { message: 'Experience added successfully', profile },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding experience:', error)
    return NextResponse.json(
      { error: 'Failed to add experience' },
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
    const { experienceId, role, company, duration, description, startDate, endDate, isCurrentJob } = body

    await connectDB()
    
    const profile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const experienceIndex = profile.experience.findIndex(
      (exp: any) => exp._id.toString() === experienceId
    )

    if (experienceIndex === -1) {
      return NextResponse.json({ error: 'Experience entry not found' }, { status: 404 })
    }

    profile.experience[experienceIndex] = {
      ...profile.experience[experienceIndex].toObject(),
      role,
      company,
      duration,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      isCurrentJob: Boolean(isCurrentJob)
    }

    await profile.save()

    return NextResponse.json(
      { message: 'Experience updated successfully', profile },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating experience:', error)
    return NextResponse.json(
      { error: 'Failed to update experience' },
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
    const experienceId = searchParams.get('id')

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 })
    }

    await connectDB()
    
    const profile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    profile.experience = profile.experience.filter(
      (exp: any) => exp._id.toString() !== experienceId
    )

    await profile.save()

    return NextResponse.json(
      { message: 'Experience deleted successfully', profile },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting experience:', error)
    return NextResponse.json(
      { error: 'Failed to delete experience' },
      { status: 500 }
    )
  }
}
