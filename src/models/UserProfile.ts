import mongoose, { Schema, Document } from 'mongoose'

export interface IEducation {
  _id?: string
  class: string
  subject: string
  institution: string
  graduationYear: number
  grade?: string
}

export interface IExperience {
  _id?: string
  role: string
  company: string
  duration: string
  description?: string
  startDate: Date
  endDate?: Date
  isCurrentJob: boolean
}

export interface IInterviewPreparation {
  _id?: string
  targetRole: string
  targetCompany: string
  requiredExperience: string
  expectedCTC: string
  skillsRequired: string[]
  createdAt: Date
}

export interface IUserProfile extends Document {
  userId: string
  fullName: string
  email: string
  phoneNumber: string
  age: number
  city: string
  country: string
  totalExperience: number
  currentRole?: string
  
  // Arrays for multiple entries
  education: IEducation[]
  experience: IExperience[]
  skills: string[]
  interviewPreparations: IInterviewPreparation[]
  
  // Profile completion tracking
  isProfileComplete: boolean
  profileCompletionPercentage: number
  
  createdAt: Date
  updatedAt: Date
}

const EducationSchema = new Schema({
  class: { type: String, required: true },
  subject: { type: String, required: true },
  institution: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  grade: { type: String }
})

const ExperienceSchema = new Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrentJob: { type: Boolean, default: false }
})

const InterviewPreparationSchema = new Schema({
  targetRole: { type: String, required: true },
  targetCompany: { type: String, required: true },
  requiredExperience: { type: String, required: true },
  expectedCTC: { type: String, required: true },
  skillsRequired: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
})

const UserProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  age: { type: Number, required: true, min: 16, max: 100 },
  city: { type: String, required: true },
  country: { type: String, required: true },
  totalExperience: { type: Number, required: true, min: 0 },
  currentRole: { type: String },
  
  education: [EducationSchema],
  experience: [ExperienceSchema],
  skills: [{ type: String }],
  interviewPreparations: [InterviewPreparationSchema],
  
  isProfileComplete: { type: Boolean, default: false },
  profileCompletionPercentage: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field before saving
UserProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Calculate profile completion percentage
  let completionScore = 0
  const totalFields = 10
  
  if (this.fullName) completionScore++
  if (this.email) completionScore++
  if (this.phoneNumber) completionScore++
  if (this.age) completionScore++
  if (this.city) completionScore++
  if (this.country) completionScore++
  if (this.totalExperience !== undefined) completionScore++
  if (this.education && this.education.length > 0) completionScore++
  if (this.experience && this.experience.length > 0) completionScore++
  if (this.skills && this.skills.length > 0) completionScore++
  
  this.profileCompletionPercentage = Math.round((completionScore / totalFields) * 100)
  this.isProfileComplete = this.profileCompletionPercentage >= 80
  
  next()
})

export default mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema)
