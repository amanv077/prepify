import mongoose, { Document, Schema } from 'mongoose'

export interface IContact extends Document {
  firstName: string
  lastName: string
  email: string
  company?: string
  subject: string
  message: string
  newsletter: boolean
  submittedAt: Date
  status: 'new' | 'in-progress' | 'resolved'
  ipAddress?: string
}

const ContactSchema = new Schema<IContact>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  newsletter: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved'],
    default: 'new'
  },
  ipAddress: {
    type: String,
    maxlength: 45 // IPv6 max length
  }
}, {
  timestamps: true
})

// Add indexes for better query performance
ContactSchema.index({ email: 1 })
ContactSchema.index({ submittedAt: -1 })
ContactSchema.index({ status: 1 })

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema)
