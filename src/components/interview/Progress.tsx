import React from 'react'
import { CheckCircle } from 'lucide-react'

interface ProgressStepProps {
  step: number
  currentStep: number
  label: string
  description?: string
  isCompleted?: boolean
}

export const ProgressStep: React.FC<ProgressStepProps> = ({
  step,
  currentStep,
  label,
  description,
  isCompleted = false
}) => {
  const isCurrent = step === currentStep
  const isPast = step < currentStep || isCompleted

  return (
    <div className={`flex items-center ${step !== 5 ? 'flex-1' : ''}`}>
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            isCurrent
              ? 'border-blue-500 bg-blue-500 text-white'
              : isPast
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300 bg-white text-gray-400'
          }`}
        >
          {isPast ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <span className="text-sm font-semibold">{step}</span>
          )}
        </div>
        <div className="mt-2 text-center">
          <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isPast ? 'text-green-600' : 'text-gray-700'}`}>
            {label}
          </div>
          {description && (
            <div className="text-xs text-gray-700 mt-1">{description}</div>
          )}
        </div>
      </div>
      {step !== 5 && (
        <div
          className={`flex-1 h-0.5 mx-4 ${
            step < currentStep ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
      )}
    </div>
  )
}

interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  className = ''
}) => {
  const percentage = Math.min((current / total) * 100, 100)

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

interface InterviewProgressProps {
  currentLevel: number
  currentQuestion: number
  totalLevels?: number
  questionsPerLevel?: number
  levels?: Array<{
    levelNumber: number
    difficulty: string
    isCompleted: boolean
    questions: Array<{ answer?: string }>
  }>
}

export const InterviewProgress: React.FC<InterviewProgressProps> = ({
  currentLevel,
  currentQuestion,
  totalLevels = 5,
  questionsPerLevel = 5,
  levels = []
}) => {
  const totalQuestions = totalLevels * questionsPerLevel
  const completedQuestions = (currentLevel - 1) * questionsPerLevel + currentQuestion
  const overallProgress = Math.min((completedQuestions / totalQuestions) * 100, 100)

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <ProgressBar current={completedQuestions} total={totalQuestions} />
      </div>

      {/* Level Steps */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalLevels }, (_, index) => {
          const levelNum = index + 1
          const level = levels[index]
          const answeredQuestions = level?.questions?.filter(q => q.answer).length || 0
          
          return (
            <ProgressStep
              key={levelNum}
              step={levelNum}
              currentStep={currentLevel}
              label={`Level ${levelNum}`}
              description={level ? `${level.difficulty} (${answeredQuestions}/5)` : undefined}
              isCompleted={level?.isCompleted}
            />
          )
        })}
      </div>

      {/* Current Level Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span>Level {currentLevel} Progress</span>
          <span>{currentQuestion}/{questionsPerLevel}</span>
        </div>
        <ProgressBar current={currentQuestion} total={questionsPerLevel} />
      </div>
    </div>
  )
}
