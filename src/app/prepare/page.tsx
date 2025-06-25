'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FullPageLoader } from '@/components/ui/loader'
import { InterviewSummary } from '@/components/interview'
import { 
  Target, 
  Building, 
  User, 
  Calendar,
  CheckCircle,
  ArrowLeft,
  Play
} from 'lucide-react'

interface InterviewPreparation {
  _id: string
  targetRole: string
  targetCompany: string
  requiredExperience: string
  expectedCTC: string
  skillsRequired: string[]
  createdAt: Date
}

interface InterviewSession {
  _id: string
  interviewId: string
  createdAt: Date
  preparationData: InterviewPreparation
  isCompleted: boolean
  currentLevel: number
  totalScore: number
}

export default function PreparePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [interviewPrep, setInterviewPrep] = useState<InterviewPreparation | null>(null)
  const [existingSessions, setExistingSessions] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(true)
  const [startingInterview, setStartingInterview] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.email) {
        try {
          // Fetch user profile to get interview preparation data
          const profileResponse = await fetch('/api/profile')
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            console.log('Profile data:', profileData)
            // Get the most recent interview preparation
            const preparations = profileData.profile?.interviewPreparations
            console.log('Interview preparations:', preparations)
            if (preparations && preparations.length > 0) {
              // Sort by createdAt and get the most recent one
              const sortedPreps = preparations.sort((a: InterviewPreparation, b: InterviewPreparation) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              console.log('Setting interview prep:', sortedPreps[0])
              setInterviewPrep(sortedPreps[0])
            } else {
              console.log('No interview preparations found')
            }
          } else {
            console.log('Profile response not ok:', profileResponse.status)
          }

          // Fetch existing interview sessions
          const sessionsResponse = await fetch('/api/interview')
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json()
            setExistingSessions(sessionsData.sessions || [])
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [session, status])

  const handleStartInterview = async () => {
    if (!interviewPrep) return

    setStartingInterview(true)
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preparationData: {
            jobTitle: interviewPrep.targetRole,
            company: interviewPrep.targetCompany,
            experience: interviewPrep.requiredExperience,
            skills: interviewPrep.skillsRequired,
            industry: 'Technology', // Default value
            focusAreas: interviewPrep.skillsRequired
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Interview session created:', data)
        router.push(`/prepare/interview/${data.interviewId}`)
      } else {
        const errorData = await response.json()
        console.error('Failed to create interview session:', errorData)
        alert('Failed to create interview session. Please try again.')
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      alert('An error occurred while starting the interview. Please try again.')
    } finally {
      setStartingInterview(false)
    }
  }

  if (status === 'loading' || loading) {
    return <FullPageLoader text="Loading interview preparation..." />
  }

  if (!session) {
    return null
  }

  if (!interviewPrep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Preparation</h1>
            <p className="text-gray-600">You need to set up your interview preparation first.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>No Interview Preparation Found</CardTitle>
              <CardDescription>
                You haven't set up any interview preparation yet. Please complete your interview preparation setup first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What you need to set up:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Target role you're applying for</li>
                  <li>• Target company name</li>
                  <li>• Required experience level</li>
                  <li>• Expected CTC/Salary</li>
                  <li>• Key skills and technologies</li>
                </ul>
              </div>
              <Button asChild className="w-full">
                <Link href="/profile/interview-prep/add">
                  <Target className="mr-2 h-4 w-4" />
                  Set Up Interview Preparation
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Go to Profile Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const incompleteSession = existingSessions.find(session => !session.isCompleted)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Preparation</h1>
          <p className="text-gray-600">Review your preparation data and start your interview practice.</p>
          
          {/* Debug Info in Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Debug:</strong> Loading: {loading ? 'true' : 'false'}, 
                Interview Prep: {interviewPrep ? 'found' : 'not found'}, 
                Sessions: {existingSessions.length}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Current Preparation Data */}
          <InterviewSummary 
            preparationData={{
              targetRole: interviewPrep.targetRole,
              targetCompany: interviewPrep.targetCompany,
              experienceLevel: interviewPrep.requiredExperience,
              skills: interviewPrep.skillsRequired,
              description: `Expected CTC: ${interviewPrep.expectedCTC}`
            }} 
          />
          
          {/* Update Button */}
          <Card>
            <CardContent className="pt-6">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/profile/interview-prep/edit/${interviewPrep._id}`}>
                  Update Preparation Data
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Resume Incomplete Session */}
          {incompleteSession && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-amber-900">Resume Incomplete Session</CardTitle>
                </div>
                <CardDescription className="text-amber-800">
                  You have an incomplete interview session. You can continue where you left off.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-900">
                      Level: {incompleteSession.currentLevel}/5 • 
                      Score: {incompleteSession.totalScore}%
                    </p>
                    <p className="text-xs text-amber-700">
                      Started: {new Date(incompleteSession.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/prepare/interview/${incompleteSession.interviewId}`}>
                      Continue Interview
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start New Interview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Start New Interview</span>
              </CardTitle>
              <CardDescription>
                Begin a new AI-powered interview session with 5 levels of questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">What to expect:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 5 levels of increasing difficulty</li>
                    <li>• 5 questions per level (25 total questions)</li>
                    <li>• AI-powered feedback and scoring</li>
                    <li>• Questions tailored to your role and company</li>
                    <li>• Progress saved automatically</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleStartInterview}
                  disabled={startingInterview}
                  className="w-full"
                  size="lg"
                >
                  {startingInterview ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Starting Interview...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start New Interview Session
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Previous Sessions */}
          {existingSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Sessions</CardTitle>
                <CardDescription>
                  View your completed interview sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {existingSessions.map((session) => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {session.isCompleted ? 'Completed' : 'In Progress'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Level: {session.currentLevel}/5 • Score: {session.totalScore}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.isCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/prepare/interview/${session.interviewId}`}>
                            {session.isCompleted ? 'View' : 'Continue'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
