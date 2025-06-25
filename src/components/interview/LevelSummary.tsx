import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Star, 
  Target, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Lightbulb,
  BarChart3
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

interface LevelSummaryProps {
  levelNumber: number
  difficulty: string
  questions: Question[]
  averageScore: number
  overallTopicsToRevise?: string[]
  onProceedToNextLevel: () => void
  onFinishInterview: () => void
  isLastLevel: boolean
}

export const LevelSummary: React.FC<LevelSummaryProps> = ({
  levelNumber,
  difficulty,
  questions,
  averageScore,
  overallTopicsToRevise = [],
  onProceedToNextLevel,
  onFinishInterview,
  isLastLevel
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

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return { message: "Outstanding performance! 🌟", color: "text-green-600" }
    if (score >= 80) return { message: "Excellent work! 🎉", color: "text-blue-600" }
    if (score >= 70) return { message: "Good job! 👍", color: "text-yellow-600" }
    if (score >= 60) return { message: "Fair performance 📈", color: "text-orange-600" }
    return { message: "Keep improving! 💪", color: "text-red-600" }
  }

  const performance = getPerformanceMessage(averageScore)

  // Collect all suggestions from questions
  const allSuggestions = questions.reduce((acc, question) => {
    if (question.suggestions && question.suggestions.length > 0) {
      acc.push(...question.suggestions)
    }
    return acc
  }, [] as string[])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <span>Level {levelNumber} Complete!</span>
          </CardTitle>
          <CardDescription className="text-lg">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficulty)}`}>
              {difficulty} Level
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-8 mb-4">
            <div>
              <p className={`text-4xl font-bold ${getScoreColor(averageScore)}`}>
                {Math.round(averageScore)}%
              </p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">
                {questions.length}/5
              </p>
              <p className="text-sm text-gray-600">Questions Completed</p>
            </div>
          </div>
          <p className={`text-lg font-medium ${performance.color}`}>
            {performance.message}
          </p>
        </CardContent>
      </Card>

      {/* Questions Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Question-by-Question Review</span>
          </CardTitle>
          <CardDescription>
            Review your answers, feedback, and scores for each question
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <div key={question._id} className="border rounded-lg p-4 space-y-4">
              {/* Question Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-gray-900">Question {index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium mb-3">
                    {question.questionText}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className={`text-lg font-bold ${getScoreColor(question.score || 0)}`}>
                      {question.score}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Your Answer */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                  Your Answer:
                </h5>
                <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-300">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {question.answer || 'No answer provided'}
                  </p>
                </div>
              </div>

              {/* Correct Answer */}
              {question.correctAnswer && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Correct Answer:
                  </h5>
                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {question.correctAnswer}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Feedback */}
              {question.feedback && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                    AI Feedback:
                  </h5>
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {question.feedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Topics to Revise for this question */}
              {question.topicsToRevise && question.topicsToRevise.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                    <Target className="h-4 w-4 text-orange-500 mr-1" />
                    Topics to Revise:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {question.topicsToRevise.map((topic, topicIndex) => (
                      <span
                        key={topicIndex}
                        className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Overall Topics to Revise for this Level */}
      {overallTopicsToRevise.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-500" />
              <span>Priority Topics to Study</span>
            </CardTitle>
            <CardDescription>
              Key topics you should focus on for this difficulty level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {overallTopicsToRevise.map((topic, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-xs font-medium">{index + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-red-900">{topic}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions for Improvement */}
      {allSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Recommendations for Improvement</span>
            </CardTitle>
            <CardDescription>
              AI-generated suggestions to help you excel in future interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allSuggestions.slice(0, 5).map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 text-xs font-medium">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-900">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Ready to continue?</h4>
              <p className="text-sm text-gray-600">
                {isLastLevel 
                  ? "You've completed all levels! View your final results." 
                  : `Proceed to Level ${levelNumber + 1} for more challenging questions.`
                }
              </p>
            </div>
            <div className="flex space-x-3">
              {isLastLevel ? (
                <Button onClick={onFinishInterview} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Final Results
                </Button>
              ) : (
                <Button onClick={onProceedToNextLevel} size="lg">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Continue to Level {levelNumber + 1}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
