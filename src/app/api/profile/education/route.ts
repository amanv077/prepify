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
    const { class: educationClass, subject, institution, graduationYear, grade } = body

    await connectDB()
    
    const profile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const newEducation = {
      class: educationClass,
      subject,
      institution,
      graduationYear: parseInt(graduationYear),
      grade
    }

    profile.education.push(newEducation)
    await profile.save()

    return NextResponse.json(
      { message: 'Education added successfully', profile },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding education:', error)
    return NextResponse.json(
      { error: 'Failed to add education' },
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
    const { educationId, class: educationClass, subject, institution, graduationYear, grade } = body

    await connectDB()
    
    const profile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const educationIndex = profile.education.findIndex(
      (edu: any) => edu._id.toString() === educationId
    )

    if (educationIndex === -1) {
      return NextResponse.json({ error: 'Education entry not found' }, { status: 404 })
    }

    profile.education[educationIndex] = {
      ...profile.education[educationIndex].toObject(),
      class: educationClass,
      subject,
      institution,
      graduationYear: parseInt(graduationYear),
      grade
    }

    await profile.save()

    return NextResponse.json(
      { message: 'Education updated successfully', profile },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating education:', error)
    return NextResponse.json(
      { error: 'Failed to update education' },
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
    const educationId = searchParams.get('id')

    if (!educationId) {
      return NextResponse.json({ error: 'Education ID is required' }, { status: 400 })
    }

    await connectDB()
    
    const profile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    profile.education = profile.education.filter(
      (edu: any) => edu._id.toString() !== educationId
    )

    await profile.save()

    return NextResponse.json(
      { message: 'Education deleted successfully', profile },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting education:', error)
    return NextResponse.json(
      { error: 'Failed to delete education' },
      { status: 500 }
    )
  }
}
