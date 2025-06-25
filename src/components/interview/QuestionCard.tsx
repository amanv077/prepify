import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Target, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Trophy,
  Clock 
} from 'lucide-react'

interface QuestionCardProps {
  question: {
    _id: string
    questionText: string
    difficulty: string
    level: number
    answer?: string
    feedback?: string
    score?: number
    answeredAt?: Date
  }
  questionNumber: number
  answer: string
  onAnswerChange: (answer: string) => void
  onSubmit: () => void
  onNext?: () => void
  isSubmitting?: boolean
  showFeedback?: boolean
  isLastQuestion?: boolean
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  onSubmit,
  onNext,
  isSubmitting = false,
  showFeedback = false,
  isLastQuestion = false
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'starter': return 'text-green-600 bg-green-100'
      case 'easy': return 'text-blue-600 bg-blue-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-orange-600 bg-orange-100'
      case 'excellent': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Question {questionNumber}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Question Text */}
          <div className="prose max-w-none">
            <p className="text-lg text-gray-900 leading-relaxed">
              {question.questionText}
            </p>
          </div>

          {!showFeedback ? (
            /* Answer Input */
            <div className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  placeholder="Type your answer here... Be specific and provide examples where possible."
                  className="min-h-[200px]"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Structure your answer clearly and provide specific examples to demonstrate your experience.
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Take your time to provide a thoughtful, detailed answer.
                </p>
                <Button 
                  onClick={onSubmit}
                  disabled={!answer.trim() || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing Answer...
                    </>
                  ) : (
                    <>
                      Submit Answer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Feedback Display */
            <div className="space-y-6">
              {/* User's Answer */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  Your Answer:
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                  <p className="text-gray-900 whitespace-pre-wrap">{question.answer}</p>
                </div>
              </div>

              {/* AI Feedback */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  AI Feedback:
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-900 whitespace-pre-wrap">{question.feedback}</p>
                </div>
              </div>

              {/* Score and Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">Score:</span>
                    <span className={`text-xl font-bold ${getScoreColor(question.score || 0)}`}>
                      {question.score}/100
                    </span>
                  </div>
                  {question.answeredAt && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        Answered at {new Date(question.answeredAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
                
                {onNext && (
                  <Button onClick={onNext} size="lg">
                    {isLastQuestion ? (
                      <>
                        View Results
                        <Trophy className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
