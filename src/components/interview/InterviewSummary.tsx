import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Building, 
  Target, 
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  Star
} from 'lucide-react'

interface InterviewSummaryProps {
  preparationData: {
    targetRole: string
    targetCompany: string
    experienceLevel: string
    skills?: string[]
    interviewDate?: Date
    description?: string
  }
  stats?: {
    currentLevel: number
    totalLevels: number
    totalScore: number
    questionsAnswered: number
    totalQuestions: number
    timeSpent?: number
  }
  compact?: boolean
}

export const InterviewSummary: React.FC<InterviewSummaryProps> = ({
  preparationData,
  stats,
  compact = false
}) => {
  const {
    targetRole,
    targetCompany,
    experienceLevel,
    skills = [],
    interviewDate,
    description
  } = preparationData

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Interview Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Role:</span>
              <p className="font-medium">{targetRole}</p>
            </div>
            <div>
              <span className="text-gray-600">Company:</span>
              <p className="font-medium">{targetCompany}</p>
            </div>
          </div>
          {stats && (
            <div className="pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span>Progress:</span>
                <span className="font-medium">
                  Level {stats.currentLevel}/{stats.totalLevels}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Score:</span>
                <span className="font-medium text-blue-600">{stats.totalScore}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Interview Preparation Summary</span>
        </CardTitle>
        <CardDescription>
          Review your preparation details before starting the interview.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Target Role</p>
              <p className="text-lg font-semibold text-gray-900">{targetRole}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Target Company</p>
              <p className="text-lg font-semibold text-gray-900">{targetCompany}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Experience Level</p>
              <p className="text-lg font-semibold text-gray-900">{experienceLevel}</p>
            </div>
          </div>

          {interviewDate && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Interview Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(interviewDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">Key Skills & Technologies</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Additional Notes</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900">{description}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Current Progress
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.currentLevel}/{stats.totalLevels}
                </p>
                <p className="text-xs text-blue-700">Levels</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.totalScore}%</p>
                <p className="text-xs text-green-700">Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.questionsAnswered}/{stats.totalQuestions}
                </p>
                <p className="text-xs text-purple-700">Questions</p>
              </div>
              {stats.timeSpent && (
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.timeSpent}m</p>
                  <p className="text-xs text-orange-700">Time</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
