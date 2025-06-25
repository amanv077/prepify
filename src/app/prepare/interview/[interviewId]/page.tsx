'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FullPageLoader } from '@/components/ui/loader'
import { Textarea } from '@/components/ui/textarea'
import { QuestionCard, InterviewProgress, InterviewSummary } from '@/components/interview'
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Trophy,
  Target,
  Star,
  AlertCircle
} from 'lucide-react'

interface Question {
  _id: string
  questionText: string
  difficulty: string
  level: number
  answer?: string
  feedback?: string
  score?: number
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

interface InterviewPageProps {
  params: Promise<{
    interviewId: string
  }>
}

export default function InterviewPage({ params }: InterviewPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [interview, setInterview] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

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
      
      console.log('Fetching interview with ID:', interviewId)
      
      try {
        const response = await fetch('/api/interview')
        console.log('Interview API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Interview API data:', data)
          
          const targetInterview = data.sessions?.find(
            (session: InterviewSession) => session.interviewId === interviewId
          )
          
          console.log('Target interview found:', targetInterview)
          
          if (targetInterview) {
            setInterview(targetInterview)
            
            // Check the structure of the interview
            console.log('Interview levels:', targetInterview.levels)
            console.log('Current level:', targetInterview.currentLevel)
            console.log('Current question index:', targetInterview.currentQuestionIndex)
            
            // Find current question
            const currentLevel = targetInterview.levels[targetInterview.currentLevel - 1]
            console.log('Current level object:', currentLevel)
            
            if (currentLevel) {
              const currentQ = currentLevel.questions[targetInterview.currentQuestionIndex]
              console.log('Current question:', currentQ)
              
              if (currentQ) {
                setCurrentQuestion(currentQ)
                if (currentQ.answer) {
                  setAnswer(currentQ.answer)
                  setShowFeedback(!!currentQ.feedback)
                }
              } else {
                console.log('No current question found, generating next question')
                // Need to generate next question
                await generateNextQuestion(targetInterview)
              }
            } else {
              console.log('No current level found, generating first question')
              // No levels yet, need to generate first question
              await generateNextQuestion(targetInterview)
            }
          } else {
            console.log('No target interview found, redirecting to prepare')
            router.push('/prepare')
          }
        } else {
          console.log('Interview API response not ok')
          router.push('/prepare')
        }
      } catch (error) {
        console.error('Error fetching interview:', error)
        router.push('/prepare')
      } finally {
        console.log('Setting loading to false')
        setLoading(false)
      }
    }

    if (status === 'authenticated' && interviewId) {
      console.log('Starting to fetch interview, status:', status, 'interviewId:', interviewId)
      fetchInterview()
    }
  }, [interviewId, session, status, router])

  const generateNextQuestion = async (interviewSession: InterviewSession) => {
    console.log('Generating next question for session:', interviewSession.interviewId)
    setLoadingNextQuestion(true)
    
    try {
      const response = await fetch('/api/interview/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: interviewId,
        }),
      })

      console.log('Question API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Question API response data:', data)
        
        setCurrentQuestion(data.question)
        setAnswer('')
        setShowFeedback(false)
        
        // Update interview state
        setInterview(prev => prev ? {
          ...prev,
          levels: data.session.levels,
          currentQuestionIndex: data.session.currentQuestionIndex
        } : null)
      } else {
        const errorData = await response.text()
        console.error('Question API error:', errorData)
      }
    } catch (error) {
      console.error('Error generating question:', error)
    } finally {
      setLoadingNextQuestion(false)
      setLoading(false) // Make sure we also set the main loading to false
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) return

    setSubmittingAnswer(true)
    try {
      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: interviewId,
          questionId: currentQuestion._id,
          answer: answer.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update current question with feedback
        setCurrentQuestion(prev => prev ? {
          ...prev,
          answer: answer.trim(),
          feedback: data.feedback,
          score: data.score,
          answeredAt: new Date()
        } : null)
        
        // Update interview state
        setInterview(data.session)
        setShowFeedback(true)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const nextQuestion = async () => {
    if (!interview) return

    const currentLevel = interview.levels[interview.currentLevel - 1]
    const isLastQuestionInLevel = interview.currentQuestionIndex >= 4 // 0-indexed, so 4 is the 5th question
    const isLastLevel = interview.currentLevel >= 5

    if (isLastQuestionInLevel && isLastLevel) {
      // Interview completed
      router.push(`/prepare/results/${interviewId}`)
      return
    }

    await generateNextQuestion(interview)
  }

  if (status === 'loading' || loading || loadingNextQuestion) {
    return <FullPageLoader text={
      loadingNextQuestion ? "Generating your next question..." : "Loading interview..."
    } />
  }

  if (!session || !interview) {
    return <FullPageLoader text="Preparing interview session..." />
  }

  if (!currentQuestion && !loadingNextQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Unable to Load Question
            </h1>
            <p className="text-gray-600 mb-6">
              We're having trouble generating your interview question. Please try again.
            </p>
            <Button onClick={() => generateNextQuestion(interview)} disabled={loadingNextQuestion}>
              {loadingNextQuestion ? 'Generating...' : 'Try Again'}
            </Button>
            <Button asChild variant="outline" className="ml-4">
              <Link href="/prepare">Back to Preparation</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentLevel = interview.levels[interview.currentLevel - 1]
  const progressPercentage = ((interview.currentLevel - 1) * 5 + interview.currentQuestionIndex + 1) / 25 * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/prepare">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Preparation
            </Link>
          </Button>
          
          {/* Progress Header */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Interview Session
                </h1>
                <p className="text-gray-600">
                  {interview.preparationData.targetRole} at {interview.preparationData.targetCompany}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</p>
              </div>
            </div>
            
            <InterviewProgress
              currentLevel={interview.currentLevel}
              currentQuestion={interview.currentQuestionIndex + 1}
              levels={interview.levels}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={interview.currentQuestionIndex + 1}
            answer={answer}
            onAnswerChange={setAnswer}
            onSubmit={submitAnswer}
            onNext={nextQuestion}
            isSubmitting={submittingAnswer}
            showFeedback={showFeedback}
            isLastQuestion={interview.currentLevel >= 5 && interview.currentQuestionIndex >= 4}
          />
        )}

        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
            <CardDescription>
              Track your progress through each difficulty level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {interview.levels.map((level, index) => {
                const isCurrentLevel = index + 1 === interview.currentLevel
                const isCompleted = level.isCompleted
                const answeredQuestions = level.questions.filter(q => q.answer).length
                
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isCurrentLevel 
                        ? 'border-blue-500 bg-blue-50' 
                        : isCompleted 
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        isCurrentLevel
                          ? 'bg-blue-500 text-white'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium">Level {index + 1}</p>
                      <p className="text-xs text-gray-600 capitalize">{level.difficulty}</p>
                      <p className="text-xs mt-1">
                        {answeredQuestions}/5 questions
                      </p>
                      {isCompleted && (
                        <p className="text-xs text-green-600 font-medium">
                          Avg: {level.averageScore}%
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
