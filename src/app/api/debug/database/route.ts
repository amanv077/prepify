import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      await connectToDatabase()
      
      // Check if we're connected
      const dbState = mongoose.connection.readyState
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      }

      if (dbState === 1) {
        return NextResponse.json({
          success: true,
          message: 'Database connection successful',
          dbName: mongoose.connection.db?.databaseName || 'Unknown',
          state: states[dbState as keyof typeof states]
        })
      } else {
        return NextResponse.json({
          success: false,
          error: `Database not connected. State: ${states[dbState as keyof typeof states]}`,
          state: states[dbState as keyof typeof states]
        })
      }
    } catch (error: any) {
      console.error('Database test error:', error)
      
      return NextResponse.json({
        success: false,
        error: `Database connection failed: ${error.message}`,
        details: error.toString()
      })
    }
  } catch (error) {
    console.error('Debug database API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to run database diagnostic',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
