import mongoose, { Document, Schema } from 'mongoose'

export interface ISession extends Document {
  _id: string
  sessionToken: string
  userId: mongoose.Types.ObjectId
  expires: Date
}

const SessionSchema = new Schema<ISession>({  sessionToken: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },  expires: {
    type: Date,
    required: true
  }
}, {
  timestamps: true,
  collection: 'sessions'
})

// Indexes
SessionSchema.index({ sessionToken: 1 }, { unique: true })
SessionSchema.index({ userId: 1 })
SessionSchema.index({ expires: 1 })

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)
