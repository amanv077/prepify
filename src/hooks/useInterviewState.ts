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
        const nextQuestionIndex = levelData.questions.findIndex(q => !q.answer || q.answer.trim() === '')
        if (nextQuestionIndex >= 0) {
          setCurrentQuestion(levelData.questions[nextQuestionIndex])
          setCurrentLevelData(prev => ({
            ...prev,
            currentQuestionIndex: nextQuestionIndex
          }))
          setInterviewPhase('question')
        }
      }
    } else {
      // Generate bulk questions for current level (optimized approach)
      await generateBulkQuestions(interview)
    }
  }

  const generateBulkQuestions = async (interviewSession: InterviewSession) => {
    console.log('Generating bulk questions for level:', currentLevelData.levelNumber)
    setLoadingNextQuestion(true)
    
    try {
      const data = await InterviewApiService.generateBulkQuestions(
        interviewId!,
        currentLevelData.levelNumber
      )
      
      // Set all questions for the level
      setCurrentLevelData(prev => ({
        ...prev,
        questions: data.questions,
        currentQuestionIndex: 0
      }))
      
      // Set first question as current
      if (data.questions.length > 0) {
        setCurrentQuestion(data.questions[0])
        setAnswer('')
        setInterviewPhase('question')
      }
      
      setInterview(data.session)
      
    } catch (error) {
      console.error('Error generating bulk questions:', error)
      setError('Failed to generate questions. Please try again.')
    } finally {
      setLoadingNextQuestion(false)
    }
  }

  const generateNextQuestion = async (interviewSession: InterviewSession) => {
    // This method is now only used for fallback - prefer generateBulkQuestions
    console.log('Fallback: Generating single question for level:', currentLevelData.levelNumber)
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
      setError('Failed to generate question. Please try again.')
    } finally {
      setLoadingNextQuestion(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) return

    setSubmittingAnswer(true)
    try {
      // Update questions locally (no API call)
      const updatedQuestions = InterviewApiService.submitAnswerLocally(
        currentLevelData.questions,
        currentQuestion._id,
        answer.trim()
      )
      
      // Update local state
      setCurrentLevelData(prev => ({
        ...prev,
        questions: updatedQuestions
      }))
      
      // Check if we've answered all 5 questions
      const answeredCount = updatedQuestions.filter(q => q.answer && q.answer.trim() !== '').length
      
      if (answeredCount >= 5) {
        // All questions answered, process batch feedback
        await processBatchFeedback(updatedQuestions)
      } else {
        // Move to next question
        const nextQuestionIndex = currentLevelData.currentQuestionIndex + 1
        if (nextQuestionIndex < updatedQuestions.length) {
          setCurrentQuestion(updatedQuestions[nextQuestionIndex])
          setCurrentLevelData(prev => ({
            ...prev,
            currentQuestionIndex: nextQuestionIndex
          }))
          setAnswer('')
        } else {
          // This shouldn't happen with bulk questions, but handle gracefully
          console.warn('Reached end of questions unexpectedly')
          await processBatchFeedback(updatedQuestions)
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      setError('Failed to submit answer. Please try again.')
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const processBatchFeedback = async (questionsToProcess?: Question[]) => {
    const questionsForFeedback = questionsToProcess || currentLevelData.questions
    if (!interview || !questionsForFeedback.length) return

    console.log('Processing batch feedback for level:', currentLevelData.levelNumber)
    setLoadingNextQuestion(true)
    
    try {
      const questionsAndAnswers = questionsForFeedback.map(q => ({
        question: q.questionText,
        answer: q.answer || ''
      }))

      const data = await InterviewApiService.processBatchFeedback(
        interviewId!,
        currentLevelData.levelNumber,
        questionsAndAnswers
      )
      
      // Update questions with feedback
      const updatedQuestions = questionsForFeedback.map((q, index) => {
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
    
    await generateBulkQuestions(updatedInterview)
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
    generateBulkQuestions,
    processBatchFeedback,
    proceedToNextLevel,
    finishInterview,
    retryFetch
  }
}
