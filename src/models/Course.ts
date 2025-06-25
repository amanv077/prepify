import mongoose, { Document, Schema } from 'mongoose'

export interface ICourse extends Document {
  _id: string
  courseName: string
  courseId: string
  skills: string[]
  courseTitle: string
  courseDetails: string
  teacher: string
  duration: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  whatYouWillLearn: string[]
  mode: 'REMOTE' | 'IN_CLASS'
  courseImage?: string
  isActive: boolean
  isArchived: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>({
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  courseId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  skills: [{
    type: String,
    required: true
  }],
  courseTitle: {
    type: String,
    required: true,
    trim: true
  },
  courseDetails: {
    type: String,
    required: true
  },
  teacher: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    required: true
  },
  whatYouWillLearn: [{
    type: String,
    required: true
  }],
  mode: {
    type: String,
    enum: ['REMOTE', 'IN_CLASS'],
    required: true
  },
  courseImage: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  collection: 'courses'
})

// Indexes
CourseSchema.index({ courseId: 1 })
CourseSchema.index({ isActive: 1 })
CourseSchema.index({ isArchived: 1 })
CourseSchema.index({ level: 1 })
CourseSchema.index({ mode: 1 })

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)

export default Course
