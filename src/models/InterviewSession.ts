import mongoose from 'mongoose'

const InterviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewId: {
    type: String,
    required: true,
    unique: true
  },
  preparationData: {
    jobTitle: String,
    company: String,
    industry: String,
    experience: String,
    skills: [String],
    focusAreas: [String]
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  totalLevels: {
    type: Number,
    default: 5
  },
  difficulty: {
    type: String,
    enum: ['starter', 'easy', 'medium', 'hard', 'excellent'],
    default: 'starter'
  },
  status: {
    type: String,
    enum: ['preparation', 'in-progress', 'completed', 'paused'],
    default: 'preparation'
  },
  levels: [{
    level: {
      type: Number,
      required: true
    },
    questions: [{
      questionId: String,
      question: String,
      answer: String,
      feedback: String,
      score: Number,
      askedAt: {
        type: Date,
        default: Date.now
      },
      answeredAt: Date
    }],
    completedAt: Date,
    averageScore: Number
  }],
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  overallScore: Number,
  completedAt: Date,
  previousQuestions: [String] // To avoid repetition
}, {
  timestamps: true
})

// Index for faster queries
InterviewSessionSchema.index({ userId: 1, interviewId: 1 })
InterviewSessionSchema.index({ userId: 1, status: 1 })

const InterviewSession = mongoose.models.InterviewSession || mongoose.model('InterviewSession', InterviewSessionSchema)

export default InterviewSession
