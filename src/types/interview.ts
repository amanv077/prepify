export interface Question {
  _id: string
  questionText: string
  difficulty: string
  level: number
  answer?: string
  feedback?: string
  score?: number
  suggestions?: string[]
  correctAnswer?: string
  topicsToRevise?: string[]
  answeredAt?: Date
}

export interface Level {
  levelNumber: number
  difficulty: string
  questions: Question[]
  isCompleted: boolean
  averageScore: number
}

export interface InterviewSession {
  _id: string
  interviewId: string
  user: string
  sessionNumber: number
  sessionTitle: string
  preparationData: {
    targetRole: string
    targetCompany: string
    experienceLevel: string
    skills: string[]
  }
  levels: Level[]
  currentLevel: number
  currentQuestionIndex: number
  totalScore: number
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CurrentLevelData {
  levelNumber: number
  difficulty: string
  questions: Question[]
  currentQuestionIndex: number
  overallTopicsToRevise: string[]
}

export interface CompletedLevel {
  levelNumber: number
  difficulty: string
  questions: Question[]
  averageScore: number
  overallTopicsToRevise: string[]
  completedAt: Date
}

export type InterviewPhase = 'question' | 'feedback' | 'level-summary' | 'final-summary'

export interface InterviewPageProps {
  params: Promise<{
    interviewId: string
  }>
}
