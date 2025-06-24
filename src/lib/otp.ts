import connectDB from './mongodb'
import { EmailVerification } from '@/models'

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const createEmailVerification = async (email: string, userId?: string) => {
  await connectDB()
  
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  const verification = await EmailVerification.create({
    email,
    otp,
    expiresAt,
    userId,
  })

  return { otp, verificationId: verification._id }
}

export const verifyOTP = async (email: string, otp: string) => {
  await connectDB()
  
  const verification = await EmailVerification.findOne({
    email,
    otp,
    status: 'PENDING',
    expiresAt: { $gt: new Date() }
  })

  if (!verification) {
    return { success: false, message: 'Invalid or expired OTP' }
  }

  verification.status = 'VERIFIED'
  await verification.save()

  return { success: true, verification }
}

export const cleanupExpiredOTPs = async () => {
  await connectDB()
  
  await EmailVerification.deleteMany({
    expiresAt: { $lt: new Date() }
  })
}
