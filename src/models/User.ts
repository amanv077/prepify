import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: string
  name?: string
  email: string
  emailVerified?: Date
  password?: string
  image?: string
  role: 'USER' | 'ADMIN' | 'AGENT'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: false
  },  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  emailVerified: {
    type: Date,
    required: false
  },
  password: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'AGENT'],
    default: 'USER'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
  collection: 'users'
})

// Indexes for better performance
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ role: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
