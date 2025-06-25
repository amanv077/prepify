import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  InterviewSession, 
  Question, 
  CurrentLevelData, 
  CompletedLevel, 
  InterviewPhase 
} from '@/types/interview'
import { InterviewApiService } from '@/services/interviewApi'
import { 
  transformInterviewSession,
  initializeCurrentLevelData,
  getFirstUnansweredQuestion,
  areAllQuestionsAnswered,
  doAllQuestionsHaveFeedback,
  getDifficultyLabel,
  getAnsweredQuestionsCount,
  calculateAverageScore
} from '@/utils/interview'

export function useInterviewState(interviewId: string | null) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Core state
  const [interview, setInterview] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false)
  const [interviewPhase, setInterviewPhase] = useState<InterviewPhase>('question')
  const [currentLevelData, setCurrentLevelData] = useState<CurrentLevelData>(
    initializeCurrentLevelData(1)
  )
  const [completedLevels, setCompletedLevels] = useState<CompletedLevel[]>([])
  const [error, setError] = useState<string | null>(null)

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch interview data
  useEffect(() => {
    if (status === 'authenticated' && interviewId) {
      fetchInterview()
    }
  }, [interviewId, session, status])

  const fetchInterview = async () => {
    if (!interviewId) return
    
    console.log('Fetching interview with ID:', interviewId)
    setError(null)
    
    try {
      const data = await InterviewApiService.fetchInterviewSessions()
      console.log('Interview API data:', data)
      
      const targetInterview = data.sessions?.find(
        (session: InterviewSession) => session.interviewId === interviewId
      )
      
      if (!targetInterview) {
        setError('Interview session not found. It may have been deleted or you may not have access to it.')
        return
      }

      const transformedInterview = transformInterviewSession(targetInterview)
      setInterview(transformedInterview)

      // Initialize current level data
      const currentLevel = transformedInterview.currentLevel || 1
      setCurrentLevelData(initializeCurrentLevelData(currentLevel))

      // Handle resume logic
      await handleResumeLogic(transformedInterview, currentLevel)
      
    } catch (error) {
      console.error('Error fetching interview:', error)
      setError(error instanceof Error ? error.message : 'Failed to load interview session')
    } finally {
      setLoading(false)
    }
  }

  const handleResumeLogic = async (interview: InterviewSession, currentLevel: number) => {
    const levelData = interview.levels[currentLevel - 1]
    
    if (levelData && levelData.questions.length > 0) {
      const unansweredQuestion = getFirstUnansweredQuestion(levelData.questions)
      
      setCurrentLevelData(prev => ({
        ...prev,
        questions: levelData.questions,
        currentQuestionIndex: unansweredQuestion ? 
          levelData.questions.findIndex(q => q._id === unansweredQuestion._id) : 
          levelData.questions.length
      }))
      
      if (unansweredQuestion) {
        // Resume from unanswered question
        setCurrentQuestion(unansweredQuestion)
        setInterviewPhase('question')
        console.log('Resuming from unanswered question')
      } else if (doAllQuestionsHaveFeedback(levelData.questions)) {
        // All questions have feedback, show level summary
        setInterviewPhase('level-summary')
        console.log('All questions completed with feedback, showing level summary')
      } else if (areAllQuestionsAnswered(levelData.questions)) {
        // Questions answered but no feedback yet
        console.log('Questions answered but missing feedback, processing batch feedback')
        await processBatchFeedback()
      } else {
        // Continue from where left off
        console.log('Continuing from where left off')
        await generateNextQuestion(interview)
      }
    } else {
      // Generate first question for current level
      await generateNextQuestion(interview)
    }
  }

  const generateNextQuestion = async (interviewSession: InterviewSession) => {
    console.log('Generating next question for level:', currentLevelData.levelNumber)
    setLoadingNextQuestion(true)
    
    try {
      const data = await InterviewApiService.generateQuestion(
        interviewId!,
        currentLevelData.levelNumber
      )
      
      setCurrentQuestion(data.question)
      setAnswer('')
      setInterviewPhase('question')
      setInterview(data.session)
      
      // Update current level data
      setCurrentLevelData(prev => ({
        ...prev,
        questions: [...prev.questions, data.question],
        currentQuestionIndex: prev.questions.length
      }))
      
    } catch (error) {
      console.error('Error generating question:', error)
    } finally {
      setLoadingNextQuestion(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) return

    setSubmittingAnswer(true)
    try {
      // Update current question with answer
      const updatedQuestion = {
        ...currentQuestion,
        answer: answer.trim(),
        answeredAt: new Date()
      }
      
      // Update questions array
      const currentQuestionIndex = currentLevelData.questions.findIndex(q => q._id === currentQuestion._id)
      setCurrentLevelData(prev => {
        const updatedQuestions = [...prev.questions]
        if (currentQuestionIndex >= 0) {
          updatedQuestions[currentQuestionIndex] = updatedQuestion
        }
        return {
          ...prev,
          questions: updatedQuestions
        }
      })
      
      // Check if this was the 5th question
      if (currentLevelData.questions.length >= 4) { // 4 because we haven't added this one to the count yet
        await processBatchFeedback()
      } else {
        // Move to next question
        setAnswer('')
        setCurrentQuestion(null)
        if (interview) {
          await generateNextQuestion(interview)
        }
      }
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
      const questionsAndAnswers = currentLevelData.questions.map(q => ({
        question: q.questionText,
        answer: q.answer || ''
      }))

      const data = await InterviewApiService.processBatchFeedback(
        interviewId!,
        currentLevelData.levelNumber,
        questionsAndAnswers
      )
      
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

      // Save completed level to history
      setCompletedLevels(prev => [...prev, {
        levelNumber: currentLevelData.levelNumber,
        difficulty: currentLevelData.difficulty,
        questions: updatedQuestions,
        averageScore: calculateAverageScore(updatedQuestions),
        overallTopicsToRevise: data.overallTopicsToRevise || [],
        completedAt: new Date()
      }])

      setInterview(data.session)
      setInterviewPhase('level-summary')
      
    } catch (error) {
      console.error('Error processing batch feedback:', error)
    } finally {
      setLoadingNextQuestion(false)
    }
  }

  const proceedToNextLevel = async () => {
    if (!interview) return

    const nextLevel = currentLevelData.levelNumber + 1
    
    if (nextLevel > 5) {
      setInterviewPhase('final-summary')
      return
    }

    console.log('Proceeding to level:', nextLevel)
    
    // Reset for next level
    setCurrentLevelData(initializeCurrentLevelData(nextLevel))
    setAnswer('')
    setCurrentQuestion(null)
    setInterviewPhase('question')
    
    // Update interview level
    const updatedInterview = {
      ...interview,
      currentLevel: nextLevel
    }
    setInterview(updatedInterview)
    
    await generateNextQuestion(updatedInterview)
  }

  const finishInterview = () => {
    if (!interviewId) return
    router.push(`/prepare/results/${interviewId}`)
  }

  const retryFetch = () => {
    setError(null)
    setLoading(true)
    fetchInterview()
  }

  return {
    // State
    interview,
    currentQuestion,
    answer,
    loading,
    submittingAnswer,
    loadingNextQuestion,
    interviewPhase,
    currentLevelData,
    completedLevels,
    session,
    status,
    error,

    // Actions
    setAnswer,
    submitAnswer,
    generateNextQuestion,
    processBatchFeedback,
    proceedToNextLevel,
    finishInterview,
    retryFetch
  }
}
