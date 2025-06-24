import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User, EmailVerification } from '@/models'
import { sendOTPEmail } from '@/lib/email'
import { generateOTP } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB()

    const { name, email, password, role = 'USER' } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    })

    // Generate OTP and create email verification
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await EmailVerification.create({
      email,
      otp,
      expiresAt,
      userId: user._id
    })

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp)

    if (!emailResult.success) {
      // Delete the created user and verification if email sending fails
      await User.findByIdAndDelete(user._id)
      await EmailVerification.deleteOne({ email, otp })
      
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User registered successfully. Please check your email for verification code.',
      userId: user._id
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    // Check for MongoDB connection errors
    if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: 'Unable to connect to the database. Please check your connection.',
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
