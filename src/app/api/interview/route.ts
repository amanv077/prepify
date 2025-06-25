import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import InterviewSession from '@/models/InterviewSession'
import { v4 as uuidv4 } from 'uuid'

// Create new interview session
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const body = await req.json()
    const { preparationData, difficulty } = body

    // Generate unique interview ID
    const interviewId = `interview_${uuidv4()}`

    const interviewSession = new InterviewSession({
      userId: session.user.id,
      interviewId,
      preparationData,
      difficulty: difficulty || 'starter',
      status: 'preparation',
      levels: []
    })

    await interviewSession.save()

    return NextResponse.json({
      success: true,
      interviewId,
      session: interviewSession
    })
  } catch (error) {
    console.error('Error creating interview session:', error)
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    )
  }
}

// Get user's interview sessions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')

    const query: any = { userId: session.user.id }
    if (status) {
      query.status = status
    }

    const sessions = await InterviewSession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)

    return NextResponse.json({
      success: true,
      sessions
    })
  } catch (error) {
    console.error('Error fetching interview sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview sessions' },
      { status: 500 }
    )
  }
}
