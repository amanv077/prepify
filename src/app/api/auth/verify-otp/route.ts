import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import { verifyOTP } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    const result = await verifyOTP(email, otp)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    // Update user's email verification status
    await User.updateOne(
      { email },
      { emailVerified: new Date() }
    )

    return NextResponse.json({
      message: 'Email verified successfully. You can now login.'
    })
  } catch (error) {
    console.error('Verification error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    // Check if this is a table not found error
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json(
        { 
          error: 'Database not initialized',
          message: 'The database tables need to be created. Please run the database setup first.',
          setupUrl: '/api/setup-db'
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    )
  }
}
