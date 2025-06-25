import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import UserProfile from '@/models/UserProfile'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const profile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      fullName,
      phoneNumber,
      age,
      city,
      country,
      totalExperience,
      currentRole,
      education,
      experience,
      skills
    } = body

    await connectDB()
    
    // Check if profile already exists
    const existingProfile = await UserProfile.findOne({ userId: session.user.id })
    
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists. Use PUT to update.' },
        { status: 409 }
      )
    }

    const profileData = {
      userId: session.user.id,
      fullName,
      email: session.user.email,
      phoneNumber,
      age: parseInt(age),
      city,
      country,
      totalExperience: parseInt(totalExperience),
      currentRole,
      education: education || [],
      experience: experience || [],
      skills: skills || [],
      interviewPreparations: []
    }

    const profile = await UserProfile.create(profileData)

    return NextResponse.json(
      { message: 'Profile created successfully', profile },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
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
    
    await connectDB()
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: session.user.id },
      { 
        ...body,
        email: session.user.email, // Ensure email stays consistent
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Profile updated successfully', profile },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
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

    await connectDB()
    
    const profile = await UserProfile.findOneAndDelete({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Profile deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user profile:', error)
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    )
  }
}
