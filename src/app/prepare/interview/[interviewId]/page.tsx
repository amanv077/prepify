'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FullPageLoader } from '@/components/ui/loader'
import { 
  QuestionCard, 
  LevelSummary, 
  FinalSummary,
  InterviewHeader,
  LevelProgressDisplay,
  InterviewErrorBoundary
} from '@/components/interview'
import { useInterviewState } from '@/hooks/useInterviewState'
import { InterviewPageProps } from '@/types/interview'

export default function InterviewPage({ params }: InterviewPageProps) {
  const router = useRouter()
  const [interviewId, setInterviewId] = useState<string | null>(null)

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setInterviewId(resolvedParams.interviewId)
    }
    resolveParams()
  }, [params])

  // Use our custom hook for all interview state management
  const {
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
    setAnswer,
    submitAnswer,
    generateNextQuestion,
    proceedToNextLevel,
    finishInterview,
    retryFetch
  } = useInterviewState(interviewId)

  // Error state
  if (error) {
    return (
      <InterviewErrorBoundary
        error={error}
        onRetry={retryFetch}
        onBackToPrep={() => router.push('/prepare')}
      />
    )
  }

  // Loading states
  if (status === 'loading' || loading || loadingNextQuestion) {
    return <FullPageLoader text={
      loadingNextQuestion ? "Generating your next question..." : "Loading interview..."
    } />
  }

  if (!session || !interview) {
    return <FullPageLoader text="Preparing interview session..." />
  }

  // Error state when no question can be loaded
  if (!currentQuestion && !loadingNextQuestion && interviewPhase === 'question') {
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
            <Button 
              onClick={() => generateNextQuestion(interview)} 
              disabled={loadingNextQuestion}
            >
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InterviewHeader
          interview={interview}
          currentLevelData={currentLevelData}
          completedLevels={completedLevels}
          currentQuestion={currentQuestion}
        />

        {/* Level Summary Phase */}
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

        {/* Final Summary Phase */}
        {interviewPhase === 'final-summary' && (
          <FinalSummary
            interview={interview}
            onStartNewInterview={() => router.push('/prepare')}
            onViewDetailedResults={() => router.push(`/prepare/results/${interviewId}`)}
          />
        )}

        {/* Question Phase */}
        {interviewPhase === 'question' && currentQuestion && (
          <>
            <QuestionCard
              question={currentQuestion}
              questionNumber={(() => {
                const questionIndex = currentLevelData.questions.findIndex(q => q._id === currentQuestion._id)
                return questionIndex >= 0 ? questionIndex + 1 : currentLevelData.questions.length + 1
              })()}
              answer={answer}
              onAnswerChange={setAnswer}
              onSubmit={submitAnswer}
              isSubmitting={submittingAnswer}
              showFeedback={false}
              isLastQuestion={currentLevelData.questions.length >= 4}
            />

            <LevelProgressDisplay
              currentLevelData={currentLevelData}
              currentQuestion={currentQuestion}
            />
          </>
        )}
      </div>
    </div>
  )
}
