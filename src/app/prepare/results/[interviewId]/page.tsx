'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FullPageLoader } from '@/components/ui/loader'
import { 
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle,
  Star,
  RotateCcw,
  Share2,
  Download
} from 'lucide-react'

interface Question {
  _id: string
  questionText: string
  difficulty: string
  level: number
  answer: string
  feedback: string
  score: number
  answeredAt: Date
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

interface ResultsPageProps {
  params: Promise<{
    interviewId: string
  }>
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [interview, setInterview] = useState<InterviewSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [interviewId, setInterviewId] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setInterviewId(resolvedParams.interviewId)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) return
      
      try {
        const response = await fetch('/api/interview')
        if (response.ok) {
          const data = await response.json()
          const targetInterview = data.sessions?.find(
            (session: InterviewSession) => session.interviewId === interviewId
          )
          
          if (targetInterview) {
            setInterview(targetInterview)
          } else {
            router.push('/prepare')
          }
        }
      } catch (error) {
        console.error('Error fetching interview:', error)
        router.push('/prepare')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated' && interviewId) {
      fetchInterview()
    }
  }, [interviewId, session, status, router])

  if (status === 'loading' || loading) {
    return <FullPageLoader text="Loading results..." />
  }

  if (!session || !interview) {
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  const totalQuestions = interview.levels.reduce((sum, level) => sum + level.questions.length, 0)
  const completedAt = new Date(interview.updatedAt)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/prepare">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Preparation
            </Link>
          </Button>
          
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-yellow-100 rounded-full">
                <Trophy className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Interview Completed!
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              {interview.preparationData.targetRole} at {interview.preparationData.targetCompany}
            </p>
            <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
              <span>Completed: {completedAt.toLocaleDateString()}</span>
              <span>•</span>
              <span>Duration: {Math.round((completedAt.getTime() - new Date(interview.createdAt).getTime()) / (1000 * 60))} minutes</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Overall Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(interview.totalScore)}`}>
                    {interview.totalScore}%
                  </div>
                  <p className={`text-xl font-semibold mb-4 ${getScoreColor(interview.totalScore)}`}>
                    {getScoreLabel(interview.totalScore)}
                  </p>
                  <p className="text-gray-600">
                    You answered {totalQuestions} questions across 5 difficulty levels
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Level Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Level Performance</CardTitle>
                <CardDescription>
                  Your score breakdown by difficulty level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interview.levels.map((level, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="font-semibold">Level {level.levelNumber}</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                            {level.difficulty}
                          </span>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(level.averageScore)}`}>
                          {level.averageScore}%
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2">
                        {level.questions.map((question, qIndex) => (
                          <div 
                            key={qIndex}
                            className="text-center p-2 bg-gray-50 rounded"
                            title={`Question ${qIndex + 1}: ${question.score}%`}
                          >
                            <div className={`text-sm font-semibold ${getScoreColor(question.score)}`}>
                              {question.score}%
                            </div>
                            <div className="text-xs text-gray-500">Q{qIndex + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Question Review */}
            <Card>
              <CardHeader>
                <CardTitle>Question Review</CardTitle>
                <CardDescription>
                  Review all questions, your answers, and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {interview.levels.map((level) =>
                    level.questions.map((question, qIndex) => (
                      <div key={question._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">
                              Level {level.levelNumber}, Question {qIndex + 1}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {question.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className={`font-semibold ${getScoreColor(question.score)}`}>
                              {question.score}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Question:</h5>
                            <p className="text-gray-700">{question.questionText}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Your Answer:</h5>
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-gray-700">{question.answer}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">AI Feedback:</h5>
                            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                              <p className="text-gray-700">{question.feedback}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-semibold">{totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Levels Completed:</span>
                  <span className="font-semibold">5/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Score:</span>
                  <span className={`font-semibold ${getScoreColor(interview.totalScore)}`}>
                    {interview.totalScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-semibold">
                    {new Date(interview.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-semibold">
                    {completedAt.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/prepare">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Start New Interview
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Results
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Performance Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {interview.totalScore >= 90 ? (
                    <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                      <p className="text-green-800">
                        Outstanding performance! You're well-prepared for your interview. 
                        Keep practicing to maintain this level.
                      </p>
                    </div>
                  ) : interview.totalScore >= 80 ? (
                    <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <p className="text-blue-800">
                        Great job! Focus on the areas where you scored lower to improve further.
                      </p>
                    </div>
                  ) : interview.totalScore >= 70 ? (
                    <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                      <p className="text-yellow-800">
                        Good progress! Review the feedback and practice more on challenging topics.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                      <p className="text-orange-800">
                        Keep practicing! Focus on understanding the feedback and improving your responses.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
