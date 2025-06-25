'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FullPageLoader } from '@/components/ui/loader'
import { Textarea } from '@/components/ui/textarea'
import { QuestionCard, InterviewProgress, InterviewSummary, LevelSummary, FinalSummary } from '@/components/interview'
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
  const [showLevelSummary, setShowLevelSummary] = useState(false)
  const [currentLevelQuestions, setCurrentLevelQuestions] = useState<Question[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [levelProgress, setLevelProgress] = useState({ current: 1, total: 5 })
  const [interviewPhase, setInterviewPhase] = useState<'question' | 'feedback' | 'level-summary' | 'final-summary'>('question')

  // Progress tracking for current level
  const [currentLevelData, setCurrentLevelData] = useState({
    levelNumber: 1,
    difficulty: 'Starter',
    questions: [] as Question[],
    currentQuestionIndex: 0,
    overallTopicsToRevise: [] as string[]
  })

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
            
            // Transform the interview data to match frontend expectations
            const transformedInterview = {
              ...targetInterview,
              levels: targetInterview.levels.map((level: any) => ({
                ...level,
                questions: level.questions.map((q: any) => ({
                  _id: q.questionId || q._id,
                  questionText: q.question || q.questionText,
                  difficulty: q.difficulty || 'starter',
                  level: q.level || level.level,
                  answer: q.answer,
                  feedback: q.feedback,
                  score: q.score,
                  suggestions: q.suggestions || [],
                  correctAnswer: q.correctAnswer,
                  topicsToRevise: q.topicsToRevise || [],
                  answeredAt: q.answeredAt
                }))
              }))
            }
            
            setInterview(transformedInterview)
            
            // Initialize current level data
            const currentLevel = transformedInterview.currentLevel || 1
            const levelDifficulties = ['Starter', 'Easy', 'Medium', 'Hard', 'Excellent']
            
            setCurrentLevelData({
              levelNumber: currentLevel,
              difficulty: levelDifficulties[currentLevel - 1] || 'Starter',
              questions: [],
              currentQuestionIndex: 0,
              overallTopicsToRevise: []
            })
            
            console.log('Interview levels:', transformedInterview.levels)
            console.log('Current level:', currentLevel)
            
            // Check if we have questions for current level
            const levelData = transformedInterview.levels[currentLevel - 1]
            
            if (levelData && levelData.questions.length > 0) {
              // Load existing questions for current level
              const unansweredIndex = levelData.questions.findIndex((q: Question) => !q.answer)
              const currentQuestionIndex = unansweredIndex >= 0 ? unansweredIndex : levelData.questions.length - 1
              
              setCurrentLevelData(prev => ({
                ...prev,
                questions: levelData.questions,
                currentQuestionIndex: currentQuestionIndex
              }))
              
              // Find current unanswered question
              const unansweredQuestion = levelData.questions.find((q: Question) => !q.answer)
              if (unansweredQuestion) {
                setCurrentQuestion(unansweredQuestion)
                setInterviewPhase('question')
              } else {
                // All questions answered, show level summary
                setInterviewPhase('level-summary')
              }
            } else {
              // Generate first question for current level
              await generateNextQuestion(transformedInterview)
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
        setInterviewPhase('question')
        
        // Update interview state
        setInterview(data.session)
        
        // Update current level data
        setCurrentLevelData(prev => ({
          ...prev,
          questions: [...prev.questions, data.question],
          currentQuestionIndex: prev.questions.length
        }))
      } else {
        const errorData = await response.text()
        console.error('Question API error:', errorData)
      }
    } catch (error) {
      console.error('Error generating question:', error)
    } finally {
      setLoadingNextQuestion(false)
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) return

    setSubmittingAnswer(true)
    try {
      // Update current question with answer (but no feedback yet)
      const updatedQuestion = {
        ...currentQuestion,
        answer: answer.trim(),
        answeredAt: new Date()
      }
      
      setCurrentQuestion(updatedQuestion)
      
      // Update current level data with the answered question
      setCurrentLevelData(prev => {
        const updatedQuestions = [...prev.questions]
        updatedQuestions[prev.currentQuestionIndex] = updatedQuestion
        return {
          ...prev,
          questions: updatedQuestions
        }
      })
      
      setInterviewPhase('feedback')
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const processBatchFeedback = async () => {
    if (!interview || !currentLevelData.questions.length) return

    console.log('Processing batch feedback for level:', currentLevelData.levelNumber)
    setLoadingNextQuestion(true)
    
    try {
      // Prepare questions and answers for batch processing
      const questionsAndAnswers = currentLevelData.questions.map(q => ({
        question: q.questionText,
        answer: q.answer || ''
      }))

      const response = await fetch('/api/interview/batch-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: interviewId,
          levelNumber: currentLevelData.levelNumber,
          questionsAndAnswers
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Batch feedback response:', data)
        
        // Update questions with feedback
        const updatedQuestions = currentLevelData.questions.map((q, index) => {
          const feedbackData = data.feedback[index]
          if (feedbackData) {
            return {
              ...q,
              feedback: feedbackData.feedback,
              score: feedbackData.score,
              correctAnswer: feedbackData.correctAnswer,
              suggestions: feedbackData.suggestions || [],
              topicsToRevise: feedbackData.topicsToRevise || []
            }
          }
          return q
        })

        setCurrentLevelData(prev => ({
          ...prev,
          questions: updatedQuestions,
          overallTopicsToRevise: data.overallTopicsToRevise || []
        }))

        // Update interview state
        setInterview(data.session)
        
        // Show level summary
        setInterviewPhase('level-summary')
      } else {
        console.error('Batch feedback API error:', await response.text())
      }
    } catch (error) {
      console.error('Error processing batch feedback:', error)
    } finally {
      setLoadingNextQuestion(false)
    }
  }

  const nextQuestion = async () => {
    if (!interview) return

    const nextQuestionIndex = currentLevelData.currentQuestionIndex + 1
    
    // Check if we've completed 5 questions in current level
    if (nextQuestionIndex >= 5) {
      // Process batch feedback for all 5 questions
      await processBatchFeedback()
      return
    }

    // Move to next question in current level
    setCurrentLevelData(prev => ({
      ...prev,
      currentQuestionIndex: nextQuestionIndex
    }))
    setAnswer('')
    setInterviewPhase('question')
    
    // Generate next question
    await generateNextQuestion(interview)
  }

  const proceedToNextLevel = async () => {
    if (!interview) return

    const nextLevel = currentLevelData.levelNumber + 1
    
    // Check if interview is complete (finished all 5 levels)
    if (nextLevel > 5) {
      setInterviewPhase('final-summary')
      return
    }

    // Reset for next level
    const levelDifficulties = ['Starter', 'Easy', 'Medium', 'Hard', 'Excellent']
    setCurrentLevelData({
      levelNumber: nextLevel,
      difficulty: levelDifficulties[nextLevel - 1] || 'Starter',
      questions: [],
      currentQuestionIndex: 0,
      overallTopicsToRevise: []
    })
    setAnswer('')
    setInterviewPhase('question')
    
    // Update interview level and generate first question of next level
    await generateNextQuestion({
      ...interview,
      currentLevel: nextLevel
    })
  }

  const finishInterview = () => {
    if (!interviewId) return
    router.push(`/prepare/results/${interviewId}`)
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
  const progressPercentage = ((currentLevelData.levelNumber - 1) * 5 + currentLevelData.currentQuestionIndex + 1) / 25 * 100

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
              currentLevel={currentLevelData.levelNumber}
              currentQuestion={currentLevelData.currentQuestionIndex + 1}
              levels={interview.levels}
            />
          </div>
        </div>

        {/* Main Content Based on Phase */}
        {interviewPhase === 'level-summary' && (
          <LevelSummary
            levelNumber={currentLevelData.levelNumber}
            difficulty={currentLevelData.difficulty}
            questions={currentLevelData.questions}
            averageScore={currentLevelData.questions.reduce((sum, q) => sum + (q.score || 0), 0) / Math.max(currentLevelData.questions.length, 1)}
            overallTopicsToRevise={currentLevelData.overallTopicsToRevise}
            onProceedToNextLevel={proceedToNextLevel}
            onFinishInterview={finishInterview}
            isLastLevel={currentLevelData.levelNumber >= 5}
          />
        )}

        {interviewPhase === 'final-summary' && (
          <FinalSummary
            interview={interview}
            onStartNewInterview={() => router.push('/prepare')}
            onViewDetailedResults={() => router.push(`/prepare/results/${interviewId}`)}
          />
        )}

        {/* Question and Feedback Phase */}
        {(interviewPhase === 'question' || interviewPhase === 'feedback') && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentLevelData.currentQuestionIndex + 1}
            answer={answer}
            onAnswerChange={setAnswer}
            onSubmit={submitAnswer}
            onNext={nextQuestion}
            isSubmitting={submittingAnswer}
            showFeedback={interviewPhase === 'feedback'}
            isLastQuestion={currentLevelData.currentQuestionIndex >= 4}
          />
        )}

        {/* Level Progress Display - Only show during question/feedback phases */}
        {(interviewPhase === 'question' || interviewPhase === 'feedback') && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Level Progress</CardTitle>
              <CardDescription>
                Level {currentLevelData.levelNumber}: {currentLevelData.difficulty} - Question {currentLevelData.currentQuestionIndex + 1} of 5
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Array.from({ length: 5 }, (_, index) => {
                  const questionNumber = index + 1
                  const isCurrentQuestion = index === currentLevelData.currentQuestionIndex
                  const isAnswered = currentLevelData.questions[index]?.answer
                  const questionScore = currentLevelData.questions[index]?.score || 0
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        isCurrentQuestion 
                          ? 'border-blue-500 bg-blue-50' 
                          : isAnswered 
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          isCurrentQuestion
                            ? 'bg-blue-500 text-white'
                            : isAnswered
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isAnswered ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span>{questionNumber}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium">Q{questionNumber}</p>
                        {isAnswered && (
                          <p className="text-xs text-green-600 font-medium">
                            Score: {questionScore}/10
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
