import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InterviewProgress } from '@/components/interview'
import { ArrowLeft, Trophy } from 'lucide-react'
import { InterviewSession, CurrentLevelData, CompletedLevel } from '@/types/interview'
import { calculateProgressPercentage, getCurrentQuestionNumber } from '@/utils/interview'

interface InterviewHeaderProps {
  interview: InterviewSession
  currentLevelData: CurrentLevelData
  completedLevels: CompletedLevel[]
  currentQuestion: any
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  interview,
  currentLevelData,
  completedLevels,
  currentQuestion
}) => {
  const currentQuestionNumber = getCurrentQuestionNumber(currentQuestion, currentLevelData)
  const answeredQuestionsInCurrentLevel = currentLevelData.questions.filter(q => q.answer && q.answer.trim() !== '').length
  const progressQuestionCount = answeredQuestionsInCurrentLevel + (currentQuestion && !currentQuestion.answer ? 1 : 0)
  const progressPercentage = calculateProgressPercentage(currentLevelData.levelNumber, progressQuestionCount)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <Button asChild variant="ghost">
          <Link href="/prepare">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Preparation
          </Link>
        </Button>
        
        <Button asChild variant="outline" size="sm">
          <Link href="/interview-summaries">
            <Trophy className="mr-2 h-4 w-4" />
            View All Summaries
          </Link>
        </Button>
      </div>
      
      {/* Progress Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {interview.sessionTitle || `Interview Session #${interview.sessionNumber || 1}`}
            </h1>
            <p className="text-gray-600">
              {interview.preparationData.targetRole} at {interview.preparationData.targetCompany}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Overall Progress</p>
            <p className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</p>
            {completedLevels.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {completedLevels.length} level{completedLevels.length !== 1 ? 's' : ''} completed
              </p>
            )}
          </div>
        </div>
        
        <InterviewProgress
          currentLevel={currentLevelData.levelNumber}
          currentQuestion={currentQuestionNumber}
          levels={interview.levels}
        />
      </div>
    </div>
  )
}
