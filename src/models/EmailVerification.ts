import mongoose, { Document, Schema } from 'mongoose'

export interface IEmailVerification extends Document {
  _id: string
  email: string
  otp: string
  status: 'PENDING' | 'VERIFIED' | 'FAILED'
  expiresAt: Date
  createdAt: Date
  userId?: string
}

const EmailVerificationSchema = new Schema<IEmailVerification>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'FAILED'],
    default: 'PENDING'
  },  expiresAt: {
    type: Date,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true,
  collection: 'email_verifications'
})

// Indexes
EmailVerificationSchema.index({ email: 1 })
EmailVerificationSchema.index({ otp: 1 })
EmailVerificationSchema.index({ userId: 1 })
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.EmailVerification || mongoose.model<IEmailVerification>('EmailVerification', EmailVerificationSchema)
