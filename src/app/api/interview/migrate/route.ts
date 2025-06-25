import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import InterviewSession from '@/models/InterviewSession'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (you might want to add this check)
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    await connectToDatabase()
    
    console.log('Starting session migration...')

    // Get all sessions without sessionNumber, grouped by userId
    const sessions = await InterviewSession.find({
      $or: [
        { sessionNumber: { $exists: false } },
        { sessionNumber: null }
      ]
    }).sort({ userId: 1, createdAt: 1 })
    
    console.log(`Found ${sessions.length} sessions to migrate`)
    
    // Group sessions by userId
    const sessionsByUser: Record<string, any[]> = {}
    sessions.forEach(session => {
      const userId = session.userId.toString()
      if (!sessionsByUser[userId]) {
        sessionsByUser[userId] = []
      }
      sessionsByUser[userId].push(session)
    })
    
    let updatedCount = 0
    
    // Update each user's sessions with sequential numbers
    for (const [userId, userSessions] of Object.entries(sessionsByUser)) {
      console.log(`Migrating ${userSessions.length} sessions for user ${userId}`)
      
      for (let i = 0; i < userSessions.length; i++) {
        const session = userSessions[i]
        const sessionNumber = i + 1
        const sessionTitle = `Interview Session #${sessionNumber}`
        
        await InterviewSession.updateOne(
          { _id: session._id },
          {
            $set: {
              sessionNumber: sessionNumber,
              sessionTitle: sessionTitle
            }
          }
        )
        
        updatedCount++
        console.log(`Updated session ${session._id} with number ${sessionNumber}`)
      }
    }
    
    console.log('Migration completed successfully')
    
    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${updatedCount} sessions`,
      updatedCount
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Failed to migrate sessions' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    // Count sessions without sessionNumber
    const sessionsNeedingMigration = await InterviewSession.countDocuments({
      $or: [
        { sessionNumber: { $exists: false } },
        { sessionNumber: null }
      ]
    })
    
    return NextResponse.json({
      success: true,
      sessionsNeedingMigration
    })
    
  } catch (error) {
    console.error('Error checking migration status:', error)
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    )
  }
}
