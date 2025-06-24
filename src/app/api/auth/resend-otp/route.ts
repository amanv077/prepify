import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, EmailVerification } from '@/models'
import { sendOTPEmail } from '@/lib/email'
import { generateOTP } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Invalidate old OTPs
    await EmailVerification.updateMany(
      {
        email,
        status: 'PENDING'
      },
      {
        status: 'FAILED'
      }
    )

    // Generate and send new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await EmailVerification.create({
      email,
      otp,
      expiresAt,
      userId: user._id
    })

    const emailResult = await sendOTPEmail(email, otp)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Verification code sent successfully'
    })
  } catch (error) {
    console.error('Resend OTP error:', error)
    
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
