import mongoose, { Document, Schema } from 'mongoose'

export interface IEducation {
  degree: string
  college: string
  year: string
  marks: string
}

export interface IExperience {
  role: string
  company: string
  location: string
  startDate: string
  endDate: string
  totalExperience: string
  description?: string
}

export interface IProject {
  name: string
  description: string
  technologies: string[]
  link?: string
}

export interface IResume extends Document {
  _id: string
  userId: string
  name: string
  email: string
  phone: string
  city: string
  summary: string
  education: IEducation[]
  experience: IExperience[]
  skills: string[]
  projects: IProject[]
  createdAt: Date
  updatedAt: Date
}

const EducationSchema = new Schema<IEducation>({
  degree: {
    type: String,
    required: true
  },
  college: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  marks: {
    type: String,
    required: true
  }
}, { _id: false })

const ExperienceSchema = new Schema<IExperience>({
  role: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: false // Allow empty for "currently working"
  },
  totalExperience: {
    type: String,
    required: false // Will be calculated, might be empty for current jobs
  },
  description: {
    type: String,
    required: false
  }
}, { _id: false })

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  technologies: [{
    type: String,
    required: true
  }],
  link: {
    type: String,
    required: false
  }
}, { _id: false })

const ResumeSchema = new Schema<IResume>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  education: [EducationSchema],
  experience: [ExperienceSchema],
  skills: [{
    type: String,
    required: true
  }],
  projects: [ProjectSchema]
}, {
  timestamps: true,
  collection: 'resumes'
})

// Index for efficient queries
ResumeSchema.index({ userId: 1 })

const Resume = mongoose.models.Resume || mongoose.model<IResume>('Resume', ResumeSchema)

export default Resume
