import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { CurrentLevelData, Question } from '@/types/interview'
import { getCurrentQuestionNumber } from '@/utils/interview'

interface LevelProgressDisplayProps {
  currentLevelData: CurrentLevelData
  currentQuestion: Question | null
}

export const LevelProgressDisplay: React.FC<LevelProgressDisplayProps> = ({
  currentLevelData,
  currentQuestion
}) => {
  const currentQuestionNumber = getCurrentQuestionNumber(currentQuestion, currentLevelData)

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Current Level Progress</CardTitle>
        <CardDescription>
          Level {currentLevelData.levelNumber}: {currentLevelData.difficulty} - Question {currentQuestionNumber} of 5
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }, (_, index) => {
            const questionNumber = index + 1
            const question = currentLevelData.questions[index]
            const isCurrentQuestion = currentQuestion && question ? currentQuestion._id === question._id : false
            const isAnswered = question?.answer && question.answer.trim() !== ''
            const questionScore = question?.score || 0
            
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
                      Score: {questionScore}%
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
