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
  Calendar,
  Trophy,
  Target,
  Star,
  TrendingUp,
  BookOpen,
  Eye,
  ChevronRight
} from 'lucide-react'

interface Question {
  _id: string
  questionText: string
  answer: string
  feedback: string
  score: number
  suggestions: string[]
  correctAnswer: string
  topicsToRevise: string[]
  answeredAt: Date
}

interface CompletedLevel {
  levelNumber: number
  difficulty: string
  questions: Question[]
  averageScore: number
  overallTopicsToRevise: string[]
  completedAt: Date
}

interface InterviewSession {
  _id: string
  interviewId: string
  sessionNumber: number
  sessionTitle: string
  preparationData: {
    targetRole: string
    targetCompany: string
    experienceLevel: string
    skills: string[]
  }
  levels: any[]
  currentLevel: number
  totalScore: number
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export default function InterviewSummariesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<CompletedLevel | null>(null)
  const [showLevelDetail, setShowLevelDetail] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchInterviewSessions = async () => {
      if (status !== 'authenticated') return
      
      try {
        const response = await fetch('/api/interview')
        if (response.ok) {
          const data = await response.json()
          setSessions(data.sessions || [])
        } else {
          console.error('Failed to fetch interview sessions')
        }
      } catch (error) {
        console.error('Error fetching interview sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInterviewSessions()
  }, [status])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'starter': return 'bg-green-100 text-green-800'
      case 'easy': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-orange-100 text-orange-800'
      case 'excellent': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const transformLevelData = (level: any, levelNumber: number): CompletedLevel => {
    const levelDifficulties = ['Starter', 'Easy', 'Medium', 'Hard', 'Excellent']
    return {
      levelNumber,
      difficulty: levelDifficulties[levelNumber - 1] || 'Starter',
      questions: level.questions.map((q: any) => ({
        _id: q.questionId || q._id,
        questionText: q.question || q.questionText,
        answer: q.answer || '',
        feedback: q.feedback || '',
        score: q.score || 0,
        suggestions: q.suggestions || [],
        correctAnswer: q.correctAnswer || '',
        topicsToRevise: q.topicsToRevise || [],
        answeredAt: new Date(q.answeredAt || q.askedAt)
      })),
      averageScore: level.averageScore || (level.questions.reduce((sum: number, q: any) => sum + (q.score || 0), 0) / Math.max(level.questions.length, 1)),
      overallTopicsToRevise: [], // This would need to be calculated or stored
      completedAt: new Date(level.completedAt || level.questions[level.questions.length - 1]?.answeredAt || new Date())
    }
  }

  const viewLevelSummary = (session: InterviewSession, levelIndex: number) => {
    const level = session.levels[levelIndex]
    if (level && level.questions.length > 0) {
      const completedLevel = transformLevelData(level, levelIndex + 1)
      setSelectedSession(session)
      setSelectedLevel(completedLevel)
      setShowLevelDetail(true)
    }
  }

  if (status === 'loading' || loading) {
    return <FullPageLoader text="Loading your interview summaries..." />
  }

  if (!session) {
    return <FullPageLoader text="Please sign in to view your summaries..." />
  }

  if (showLevelDetail && selectedLevel && selectedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            onClick={() => setShowLevelDetail(false)}
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Summaries
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Level {selectedLevel.levelNumber} Summary
                </h1>
                <p className="text-gray-600">
                  {selectedSession.preparationData.targetRole} at {selectedSession.preparationData.targetCompany}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(selectedLevel.difficulty)}`}>
                {selectedLevel.difficulty}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className={`text-lg font-semibold ${getScoreColor(selectedLevel.averageScore)}`}>
                        {selectedLevel.averageScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Questions</p>
                      <p className="text-lg font-semibold">{selectedLevel.questions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-lg font-semibold">
                        {new Date(selectedLevel.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Questions and Feedback */}
          <div className="space-y-6">
            {selectedLevel.questions.map((question, index) => (
              <Card key={question._id} className="bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-gray-300 ${getScoreColor(question.score)}`}>
                      {question.score}%
                    </span>
                  </div>
                  <CardDescription className="text-gray-700 font-medium">
                    {question.questionText}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Your Answer */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Your Answer:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {question.answer}
                      </p>
                    </div>

                    {/* Correct Answer */}
                    {question.correctAnswer && (
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">Suggested Answer:</h4>
                        <p className="text-gray-700 bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                          {question.correctAnswer}
                        </p>
                      </div>
                    )}

                    {/* Feedback */}
                    {question.feedback && (
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2">Feedback:</h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                          {question.feedback}
                        </p>
                      </div>
                    )}

                    {/* Suggestions */}
                    {question.suggestions && question.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-purple-700 mb-2">Suggestions for Improvement:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 bg-purple-50 p-3 rounded-md border-l-4 border-purple-400">
                          {question.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Topics to Revise */}
                    {question.topicsToRevise && question.topicsToRevise.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-orange-700 mb-2">Topics to Revise:</h4>
                        <div className="flex flex-wrap gap-2">
                          {question.topicsToRevise.map((topic, idx) => (
                            <span key={idx} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-50 text-orange-700 border-orange-200">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Summaries
          </h1>
          <p className="text-gray-600">
            Review your interview performance and track your progress
          </p>
        </div>

        {sessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Interview Sessions Found
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't completed any interview sessions yet. Start preparing now!
              </p>
              <Button asChild>
                <Link href="/prepare">
                  Start Your First Interview
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => (
              <Card key={session._id} className="bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {session.sessionTitle || `Interview Session #${session.sessionNumber || 1}`}
                      </CardTitle>
                      <CardDescription>
                        {session.preparationData.targetRole || 'Role'} at {session.preparationData.targetCompany || 'Company'} • {' '}
                        Created {new Date(session.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.isCompleted && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-800">
                          Completed
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-gray-300 text-gray-900">
                        Level {session.currentLevel}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {session.levels.map((level: any, index: number) => {
                      const levelNumber = index + 1
                      const hasQuestions = level.questions && level.questions.length > 0
                      const isCompleted = hasQuestions && level.questions.length >= 5
                      const averageScore = hasQuestions 
                        ? level.questions.reduce((sum: number, q: any) => sum + (q.score || 0), 0) / level.questions.length
                        : 0
                      const levelDifficulties = ['Starter', 'Easy', 'Medium', 'Hard', 'Excellent']
                      const difficulty = levelDifficulties[index] || 'Starter'

                      return (
                        <Card 
                          key={levelNumber} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isCompleted ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200' : 'bg-gray-50'
                          } ${!hasQuestions ? 'opacity-50' : ''}`}
                          onClick={() => hasQuestions && viewLevelSummary(session, index)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm">Level {levelNumber}</span>
                              {isCompleted && <Eye className="h-4 w-4 text-blue-600" />}
                            </div>
                            <span 
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(difficulty)}`}
                            >
                              {difficulty}
                            </span>
                            {hasQuestions ? (
                              <div className="space-y-1">
                                <p className="text-xs text-gray-600">
                                  {level.questions.length} question{level.questions.length !== 1 ? 's' : ''}
                                </p>
                                {isCompleted && (
                                  <p className={`text-sm font-semibold ${getScoreColor(averageScore)}`}>
                                    {averageScore.toFixed(1)}% avg
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400">Not started</p>
                            )}
                            {hasQuestions && (
                              <ChevronRight className="h-4 w-4 text-gray-400 mt-2" />
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {session.isCompleted && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-semibold text-green-800">Interview Completed!</span>
                        <span className="ml-auto text-green-700">
                          Overall Score: {((session.totalScore || 0) / 5).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
