import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Star, 
  Target, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Lightbulb,
  BarChart3,
  RefreshCw,
  FileText
} from 'lucide-react'

interface Question {
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

interface Level {
  levelNumber: number
  difficulty: string
  questions: Question[]
  isCompleted: boolean
  averageScore: number
}

interface InterviewSession {
  _id: string
  interviewId: string
  user: string
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

interface FinalSummaryProps {
  interview: InterviewSession
  onStartNewInterview: () => void
  onViewDetailedResults: () => void
}

export const FinalSummary: React.FC<FinalSummaryProps> = ({
  interview,
  onStartNewInterview,
  onViewDetailedResults
}) => {
  // Calculate overall statistics
  const completedLevels = interview.levels.filter(level => level.isCompleted)
  const totalQuestions = completedLevels.reduce((sum, level) => sum + level.questions.length, 0)
  const totalPossibleScore = totalQuestions * 10 // Max score per question is 10
  const totalActualScore = completedLevels.reduce((sum, level) => 
    sum + level.questions.reduce((levelSum, question) => levelSum + (question.score || 0), 0), 0
  )
  const overallScore = totalQuestions > 0 ? Math.round((totalActualScore / totalPossibleScore) * 100) : 0
  
  // Get performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Outstanding', color: 'text-green-600', bg: 'bg-green-100', message: '🌟 Exceptional performance!' }
    if (score >= 80) return { level: 'Excellent', color: 'text-blue-600', bg: 'bg-blue-100', message: '🎉 Excellent work!' }
    if (score >= 70) return { level: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100', message: '👍 Good job!' }
    if (score >= 60) return { level: 'Fair', color: 'text-orange-600', bg: 'bg-orange-100', message: '📈 Room for improvement' }
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100', message: '💪 Keep practicing!' }
  }

  const performance = getPerformanceLevel(overallScore)

  // Collect all topics to revise from all levels
  const allTopicsToRevise = completedLevels.reduce((acc, level) => {
    level.questions.forEach(question => {
      if (question.topicsToRevise && question.topicsToRevise.length > 0) {
        acc.push(...question.topicsToRevise)
      }
    })
    return acc
  }, [] as string[])

  // Remove duplicates and limit to most important topics
  const uniqueTopicsToRevise = Array.from(new Set(allTopicsToRevise)).slice(0, 12)

  // Collect all suggestions from all levels
  const allSuggestions = completedLevels.reduce((acc, level) => {
    level.questions.forEach(question => {
      if (question.suggestions && question.suggestions.length > 0) {
        acc.push(...question.suggestions)
      }
    })
    return acc
  }, [] as string[])

  // Remove duplicates and limit to top recommendations
  const uniqueSuggestions = Array.from(new Set(allSuggestions)).slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-3xl">
            <Trophy className="h-10 w-10 text-yellow-500" />
            <span>Interview Complete!</span>
          </CardTitle>
          <CardDescription className="text-lg">
            <span className="text-gray-700">
              {interview.preparationData.targetRole} at {interview.preparationData.targetCompany}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-8 mb-6">
            <div>
              <p className={`text-5xl font-bold ${performance.color}`}>
                {overallScore}%
              </p>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-blue-600">
                {totalQuestions}
              </p>
              <p className="text-sm text-gray-600">Questions Answered</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-purple-600">
                {completedLevels.length}
              </p>
              <p className="text-sm text-gray-600">Levels Completed</p>
            </div>
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${performance.bg}`}>
            <span className={`text-lg font-medium ${performance.color}`}>
              {performance.level}: {performance.message}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Level Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Performance by Level</span>
          </CardTitle>
          <CardDescription>
            Your performance across all difficulty levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {interview.levels.map((level, index) => {
              const levelScore = Math.round(level.averageScore || 0)
              const getScoreColor = (score: number) => {
                if (score >= 8) return 'text-green-600 bg-green-100'
                if (score >= 6) return 'text-blue-600 bg-blue-100'
                if (score >= 4) return 'text-yellow-600 bg-yellow-100'
                return 'text-red-600 bg-red-100'
              }
              
              return (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Level {index + 1}</h4>
                  <p className="text-xs text-gray-600 mb-2 capitalize">{level.difficulty}</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(levelScore)}`}>
                    <Star className="h-3 w-3 mr-1" />
                    {levelScore}/10
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {level.questions.filter(q => q.answer).length}/5 questions
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Your Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedLevels.filter(level => level.averageScore >= 7).map((level, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">
                    <strong className="capitalize">{level.difficulty} Level</strong> - 
                    Strong performance with {Math.round(level.averageScore)}/10 average
                  </span>
                </div>
              ))}
              {interview.preparationData.skills.slice(0, 3).map((skill, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Expertise in <strong>{skill}</strong></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <Target className="h-5 w-5" />
              <span>Growth Areas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedLevels.filter(level => level.averageScore < 7).map((level, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">
                    <strong className="capitalize">{level.difficulty} Level</strong> - 
                    Consider reviewing concepts (avg: {Math.round(level.averageScore)}/10)
                  </span>
                </div>
              ))}
              {completedLevels.length < 5 && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Practice more advanced difficulty levels</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {uniqueTopicsToRevise.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-500" />
              <span>Essential Topics to Study</span>
            </CardTitle>
            <CardDescription>
              Priority learning areas based on your interview performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {uniqueTopicsToRevise.map((topic, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-xs font-medium">{index + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-red-900">{topic}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Recommendations */}
      {uniqueSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>General Recommendations</span>
            </CardTitle>
            <CardDescription>
              AI-generated suggestions to help you excel in future interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 text-xs font-medium">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-900">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <h4 className="font-medium text-gray-900">What's next?</h4>
              <p className="text-sm text-gray-600">
                Review your detailed results or start a new practice session
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button onClick={onViewDetailedResults} variant="outline" size="lg">
                <FileText className="mr-2 h-4 w-4" />
                View Detailed Results
              </Button>
              <Button onClick={onStartNewInterview} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New Interview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
