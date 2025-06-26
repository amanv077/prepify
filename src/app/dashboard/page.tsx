'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Loader, { FullPageLoader } from '@/components/ui/loader'
import { checkProfileCompletion, getNextProfileAction, type ProfileStatus } from '@/lib/profileUtils'
import type { IUserProfile } from '@/models/UserProfile'
import { 
  User, 
  Target, 
  GraduationCap, 
  Briefcase, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react'

// Profile completion card component with loading state
function ProfileCompletionCard({ 
  profileStatus, 
  loading, 
  error 
}: {
  profileStatus: ProfileStatus | null
  loading: boolean
  error: boolean
}) {
  if (loading) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Loader size="sm" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Loading Profile...</h3>
              <p className="text-gray-600">Checking your profile completion status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-l-4 border-l-yellow-500">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Status Unavailable</h3>
              <p className="text-gray-600">Unable to load profile data. You can still access all features.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profileStatus) {
    return (
      <Card className="border-l-4 border-l-gray-500">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <User className="h-8 w-8 text-gray-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Welcome!</h3>
              <p className="text-gray-600">Get started by completing your profile</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-l-4 ${profileStatus.isComplete ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {profileStatus.isComplete ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Profile {profileStatus.isComplete ? 'Complete' : 'Incomplete'}
              </h3>
              <p className="text-gray-600">
                {profileStatus.isComplete 
                  ? 'Your profile is fully set up and ready!' 
                  : `${profileStatus.completionPercentage}% completed`
                }
              </p>
            </div>
          </div>
          
          {!profileStatus.isComplete && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {profileStatus.completionPercentage}%
                </div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>
        
        {!profileStatus.isComplete && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${profileStatus.completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<IUserProfile | null>(null)
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async (retryCount = 0) => {
      if (session?.user?.email) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)
          
          const response = await fetch('/api/profile', {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            const data = await response.json()
            setProfile(data.profile)
            setProfileStatus(checkProfileCompletion(data.profile))
            setProfileError(false)
          } else if (response.status === 404) {
            // Profile doesn't exist yet - this is normal for new users
            setProfile(null)
            setProfileStatus(checkProfileCompletion(null))
            setProfileError(false)
          } else {
            console.error('Error fetching profile:', response.status)
            setProfileError(true)
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('Profile fetch timeout')
            // Try once more on timeout
            if (retryCount === 0) {
              console.log('Retrying profile fetch...')
              setTimeout(() => fetchProfile(1), 1000)
              return
            }
          } else {
            console.error('Error fetching profile:', error)
          }
          setProfileError(true)
        } finally {
          // Only stop loading on final attempt
          if (retryCount > 0) {
            setLoadingProfile(false)
          }
        }
        
        // Stop loading after first attempt if no retry
        if (retryCount === 0) {
          setTimeout(() => setLoadingProfile(false), 100)
        }
      } else {
        // No session user email, stop loading
        setLoadingProfile(false)
      }
    }

    if (status === 'authenticated') {
      fetchProfile()
    } else if (status === 'unauthenticated') {
      setLoadingProfile(false)
    }
  }, [session, status])

  // Show loading only for authentication, not for data
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mx-4">
          <Loader size="lg" text="Authenticating..." />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const nextAction = getNextProfileAction(profile)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {session.user.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600">
                Ready to ace your next interview? Let's get you prepared.
              </p>
              {loadingProfile && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-800">
                      Loading your profile data...
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setLoadingProfile(false)
                        setProfile(null)
                        setProfileStatus(checkProfileCompletion(null))
                      }}
                    >
                      Skip Loading
                    </Button>
                  </div>
                </div>
              )}
              {profileError && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Profile data unavailable - You can still access all features
                  </p>
                </div>
              )}
            </div>

            {/* Profile Completion Alert */}
            {profileStatus && !profileStatus.isComplete && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-amber-900">{nextAction.title}</CardTitle>
                  </div>
                  <CardDescription className="text-amber-800">
                    {nextAction.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-amber-900">Profile Completion</span>
                        <span className="text-sm font-medium text-amber-900">
                          {profileStatus.completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${profileStatus.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={nextAction.actionUrl}>
                        Complete Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Profile Status</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {profileStatus?.completionPercentage || 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Interviews</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Practice Time</p>
                      <p className="text-2xl font-bold text-gray-900">0h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with interview preparation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button asChild variant="outline" className="h-auto p-6 flex flex-col items-start space-y-2">
                    <Link href="/profile">
                      <User className="h-8 w-8 text-blue-600" />
                      <div className="text-left">
                        <h3 className="font-semibold">My Profile</h3>
                        <p className="text-sm text-gray-600">
                          {profileStatus?.isComplete ? 'View profile' : 'Complete setup'}
                        </p>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-6 flex flex-col items-start space-y-2">
                    <Link href="/prepare">
                      <Target className="h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <h3 className="font-semibold">Start Interview</h3>
                        <p className="text-sm text-gray-600">
                          AI-powered practice sessions
                        </p>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-6 flex flex-col items-start space-y-2">
                    <Link href="/profile/interview-prep/add">
                      <GraduationCap className="h-8 w-8 text-purple-600" />
                      <div className="text-left">
                        <h3 className="font-semibold">Interview Prep</h3>
                        <p className="text-sm text-gray-600">
                          Set target role & company
                        </p>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-6 flex flex-col items-start space-y-2">
                    <Link href="/interview-summaries">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                      <div className="text-left">
                        <h3 className="font-semibold">View Summaries</h3>
                        <p className="text-sm text-gray-600">
                          Review past interviews
                        </p>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Completion Status */}
            <ProfileCompletionCard 
              profileStatus={profileStatus}
              loading={loadingProfile}
              error={profileError}
            />

            {/* Profile Setup Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Setup</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingProfile ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center space-x-3">
                        <Loader size="sm" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-100 rounded mt-1 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Basic Profile */}
                    <div className="flex items-center space-x-3">
                      {profile ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">Basic Information</p>
                        <p className="text-xs text-gray-500">Name, contact, location</p>
                      </div>
                      {!profile && (
                        <Button asChild size="sm" variant="ghost">
                          <Link href="/profile/complete">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    {/* Education */}
                    <div className="flex items-center space-x-3">
                      {profile?.education && profile.education.length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">Education</p>
                        <p className="text-xs text-gray-500">
                          {profile?.education?.length || 0} entries
                        </p>
                      </div>
                      <Button asChild size="sm" variant="ghost">
                        <Link href="/profile/education/add">
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    {/* Experience */}
                    <div className="flex items-center space-x-3">
                      {profile?.experience && profile.experience.length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">Experience</p>
                        <p className="text-xs text-gray-500">
                          {profile?.experience?.length || 0} entries
                        </p>
                      </div>
                      <Button asChild size="sm" variant="ghost">
                        <Link href="/profile/experience/add">
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    {/* Interview Prep */}
                    <div className="flex items-center space-x-3">
                      {profile?.interviewPreparations && profile.interviewPreparations.length > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">Interview Prep</p>
                        <p className="text-xs text-gray-500">Target role setup</p>
                      </div>
                      {(!profile?.interviewPreparations || profile.interviewPreparations.length === 0) && (
                        <Button asChild size="sm" variant="ghost">
                          <Link href="/profile/interview-prep/add">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    {/* Overall Progress */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-medium">
                          {profileStatus?.completionPercentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${profileStatus?.completionPercentage || 0}%` }}
                        />
                      </div>
                      {profileStatus?.isComplete && (
                        <p className="text-xs text-green-600 mt-2 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Profile complete! Ready for interviews.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm text-gray-900">{session.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Role</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {session.user.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
