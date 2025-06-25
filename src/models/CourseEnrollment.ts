import mongoose, { Document, Schema } from 'mongoose'

export interface ICourseEnrollment extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  enrollmentStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  enrolledAt: Date
  approvedAt?: Date
  approvedBy?: mongoose.Types.ObjectId
  rejectedAt?: Date
  rejectedBy?: mongoose.Types.ObjectId
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

const CourseEnrollmentSchema = new Schema<ICourseEnrollment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    required: false
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  rejectedAt: {
    type: Date,
    required: false
  },
  rejectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  rejectionReason: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  collection: 'course_enrollments'
})

// Compound index to prevent duplicate enrollments
CourseEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true })
CourseEnrollmentSchema.index({ enrollmentStatus: 1 })
CourseEnrollmentSchema.index({ courseId: 1 })

const CourseEnrollment = mongoose.models.CourseEnrollment || mongoose.model<ICourseEnrollment>('CourseEnrollment', CourseEnrollmentSchema)

export default CourseEnrollment
