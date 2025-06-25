'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Loader from '@/components/ui/loader'
import { showToast } from '@/components/ui/toaster'
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building
} from 'lucide-react'

interface UserProfile {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  age: number
  city: string
  country: string
  totalExperience: number
  currentRole?: string
  education: any[]
  experience: any[]
  skills: string[]
  interviewPreparations: any[]
  isProfileComplete: boolean
  profileCompletionPercentage: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCompleteProfile, setShowCompleteProfile] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session, status])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      
      if (response.status === 404) {
        // Profile doesn't exist, show complete profile prompt
        setShowCompleteProfile(true)
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data.profile)
      
      // Show complete profile prompt if profile is not complete
      if (data.profile.profileCompletionPercentage < 80) {
        setShowCompleteProfile(true)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteProfile = () => {
    router.push('/profile/complete')
  }

  const handleEditProfile = () => {
    router.push('/profile/edit')
  }

  const handleDeleteProfile = async () => {
    if (!confirm('Are you sure you want to delete your entire profile? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast.success('Profile deleted successfully')
        router.push('/dashboard')
      } else {
        throw new Error('Failed to delete profile')
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      showToast.error('Failed to delete profile')
    }
  }

  const handleDeleteEducation = async (educationId: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) {
      return
    }

    try {
      const response = await fetch(`/api/profile/education?id=${educationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast.success('Education deleted successfully')
        fetchProfile() // Refresh the profile
      } else {
        throw new Error('Failed to delete education')
      }
    } catch (error) {
      console.error('Error deleting education:', error)
      showToast.error('Failed to delete education')
    }
  }

  const handleDeleteExperience = async (experienceId: string) => {
    if (!confirm('Are you sure you want to delete this experience entry?')) {
      return
    }

    try {
      const response = await fetch(`/api/profile/experience?id=${experienceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast.success('Experience deleted successfully')
        fetchProfile() // Refresh the profile
      } else {
        throw new Error('Failed to delete experience')
      }
    } catch (error) {
      console.error('Error deleting experience:', error)
      showToast.error('Failed to delete experience')
    }
  }

  const handleDeleteInterviewPrep = async (prepId: string) => {
    if (!confirm('Are you sure you want to delete this interview preparation?')) {
      return
    }

    try {
      const response = await fetch(`/api/profile/interview-prep?id=${prepId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast.success('Interview preparation deleted successfully')
        fetchProfile() // Refresh the profile
      } else {
        throw new Error('Failed to delete interview preparation')
      }
    } catch (error) {
      console.error('Error deleting interview preparation:', error)
      showToast.error('Failed to delete interview preparation')
    }
  }

  if (loading) {
    return <Loader size="lg" text="Loading your profile..." />
  }

  // Show complete profile prompt
  if (showCompleteProfile && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-lg text-gray-700 max-w-2xl mx-auto">
                Welcome to Prepify! To provide you with personalized interview preparation, 
                we need to know more about your background, education, and career goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Education Details</h3>
                  <p className="text-sm text-gray-600">Your academic background and qualifications</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Work Experience</h3>
                  <p className="text-sm text-gray-600">Your professional journey and skills</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Career Goals</h3>
                  <p className="text-sm text-gray-600">What you're preparing for next</p>
                </div>
              </div>
              
              <Button 
                onClick={handleCompleteProfile}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
              >
                Complete Your Profile
                <Plus className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show profile completion prompt if profile is incomplete
  if (showCompleteProfile && profile && profile.profileCompletionPercentage < 80) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-xl bg-white mb-6">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Profile {profile.profileCompletionPercentage}% Complete
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                Complete your profile to get personalized interview questions and better preparation.
              </CardDescription>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${profile.profileCompletionPercentage}%` }}
                ></div>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handleEditProfile}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Complete Profile
                  <Edit className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCompleteProfile(false)}
                >
                  Continue with Current Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show full profile
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <Button onClick={handleCompleteProfile}>Create Profile</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-xl bg-white mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {profile.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{profile.fullName}</CardTitle>
                  <p className="text-gray-600">{profile.currentRole || 'Professional'}</p>
                  <div className="flex items-center mt-2">
                    {profile.isProfileComplete ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Profile Complete</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{profile.profileCompletionPercentage}% Complete</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleEditProfile} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handleDeleteProfile} variant="outline" className="text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{profile.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{profile.phoneNumber}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{profile.city}, {profile.country}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{profile.age} years old</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{profile.totalExperience} years experience</span>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-900">
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education
                </div>
                <Button size="sm" onClick={() => router.push('/profile/education/add')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.education.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{edu.class} in {edu.subject}</h4>
                          <p className="text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-500">Graduated: {edu.graduationYear}</p>
                          {edu.grade && <p className="text-sm text-gray-500">Grade: {edu.grade}</p>}
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/profile/education/edit/${edu._id}`)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteEducation(edu._id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No education added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-900">
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Experience
                </div>
                <Button size="sm" onClick={() => router.push('/profile/experience/add')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.experience.length > 0 ? (
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-green-200 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.duration}</p>
                          {exp.isCurrentJob && (
                            <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Current Position
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/profile/experience/edit/${exp._id}`)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteExperience(exp._id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No experience added yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interview Preparation */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Interview Preparation
              </div>
              {profile.interviewPreparations.length === 0 && (
                <Button onClick={() => router.push('/profile/interview-prep/add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Up Interview Prep
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.interviewPreparations.length > 0 ? (
              <div className="max-w-2xl">
                {profile.interviewPreparations.slice(0, 1).map((prep, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{prep.targetRole}</h4>
                        <p className="text-lg text-gray-700 mb-2">{prep.targetCompany}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => router.push(`/profile/interview-prep/edit/${prep._id}`)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteInterviewPrep(prep._id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Experience: {prep.requiredExperience}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-green-600">Expected CTC: {prep.expectedCTC}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h5>
                      <div className="flex flex-wrap gap-2">
                        {prep.skillsRequired.map((skill: string, skillIndex: number) => (
                          <span 
                            key={skillIndex}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Up Your Interview Preparation</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Define your target role, company, and required skills to get personalized interview questions.
                </p>
                <Button onClick={() => router.push('/profile/interview-prep/add')} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Interview Preparation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
