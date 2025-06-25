'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FullPageLoader } from '@/components/ui/loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { showToast } from '@/components/ui/toaster'
import { 
  ArrowLeft, 
  Share2,
  BookOpen,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Timer,
  GraduationCap,
  Star,
  Calendar,
  Target,
  Award,
  Copy,
  Mail,
  MessageSquare
} from 'lucide-react'

interface Course {
  _id: string
  courseName: string
  courseId: string
  courseTitle: string
  courseDetails: string
  teacher: string
  duration: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  mode: 'REMOTE' | 'IN_CLASS'
  skills: string[]
  whatYouWillLearn: string[]
  courseImage?: string
  isActive: boolean
  createdAt: string
}

interface Enrollment {
  _id: string
  enrollmentStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  enrolledAt: string
}

export default function CourseDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  useEffect(() => {
    fetchCourseDetails()
    if (status === 'authenticated') {
      fetchEnrollmentStatus()
    }
  }, [courseId, status])

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      if (!response.ok) {
        throw new Error('Course not found')
      }
      const data = await response.json()
      setCourse(data)
    } catch (error) {
      console.error('Error fetching course:', error)
      setAlert({ type: 'error', message: 'Course not found' })
      setTimeout(() => router.push('/programs'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollmentStatus = async () => {
    try {
      const response = await fetch(`/api/enrollments?courseId=${courseId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.enrollments && data.enrollments.length > 0) {
          setEnrollment(data.enrollments[0])
        }
      }
    } catch (error) {
      console.error('Error fetching enrollment status:', error)
    }
  }

  const handleEnroll = async () => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user?.role !== 'USER') {
      setAlert({ type: 'error', message: 'Only users can enroll in courses' })
      return
    }

    setEnrolling(true)
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course?._id })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to enroll')
      }

      const data = await response.json()
      setEnrollment(data.enrollment)
      setAlert({ type: 'success', message: 'Successfully enrolled! Your application is pending approval.' })
    } catch (error) {
      console.error('Error enrolling:', error)
      setAlert({ type: 'error', message: error instanceof Error ? error.message : 'Failed to enroll in course' })
    } finally {
      setEnrolling(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.courseName,
          text: course?.courseTitle,
          url: url
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        showToast.success('Course link copied to clipboard!')
      } catch (error) {
        showToast.error('Failed to copy link')
      }
    }
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getModeBadgeColor = (mode: string) => {
    switch (mode) {
      case 'REMOTE': return 'bg-blue-100 text-blue-800'
      case 'IN_CLASS': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEnrollmentBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Timer className="h-4 w-4 mr-1" />Pending Approval</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-4 w-4 mr-1" />Enrolled</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-4 w-4 mr-1" />Application Rejected</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return <FullPageLoader text="Loading course details..." />
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <Button onClick={() => router.push('/programs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/programs')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
        </div>

        {/* Alert */}
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Course Header */}
            <Card>
              <CardHeader>
                {course.courseImage && (
                  <img 
                    src={course.courseImage} 
                    alt={course.courseName}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-3xl text-gray-900 mb-2">{course.courseName}</CardTitle>
                    <p className="text-xl text-gray-600 mb-4">{course.courseTitle}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getLevelBadgeColor(course.level)}>
                        <Star className="h-3 w-3 mr-1" />
                        {course.level}
                      </Badge>
                      <Badge className={getModeBadgeColor(course.mode)}>
                        <MapPin className="h-3 w-3 mr-1" />
                        {course.mode}
                      </Badge>
                      {enrollment && getEnrollmentBadge(enrollment.enrollmentStatus)}
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Course Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{course.courseDetails}</p>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Skills You'll Gain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Instructor</span>
                    </div>
                    <span className="text-sm font-medium">{course.teacher}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Duration</span>
                    </div>
                    <span className="text-sm font-medium">{course.duration}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Level</span>
                    </div>
                    <span className="text-sm font-medium">{course.level}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Mode</span>
                    </div>
                    <span className="text-sm font-medium">{course.mode}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Created</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Action */}
            <Card>
              <CardContent className="p-6">
                {status === 'unauthenticated' ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">Sign in to enroll in this course</p>
                    <Button className="w-full" onClick={() => router.push('/login')}>
                      Sign In to Enroll
                    </Button>
                  </div>
                ) : session?.user?.role !== 'USER' ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">Only users can enroll in courses</p>
                    <Button className="w-full" disabled>
                      Enrollment Not Available
                    </Button>
                  </div>
                ) : enrollment ? (
                  <div className="text-center space-y-4">
                    {getEnrollmentBadge(enrollment.enrollmentStatus)}
                    <p className="text-sm text-gray-600">
                      {enrollment.enrollmentStatus === 'PENDING' && 'Your application is being reviewed'}
                      {enrollment.enrollmentStatus === 'APPROVED' && 'You are enrolled in this course'}
                      {enrollment.enrollmentStatus === 'REJECTED' && 'Your application was not approved'}
                    </p>
                    {enrollment.enrollmentStatus === 'REJECTED' && (
                      <Button className="w-full" onClick={handleEnroll} disabled={enrolling}>
                        Apply Again
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      className="w-full" 
                      onClick={handleEnroll} 
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <Timer className="h-4 w-4 mr-2 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Enroll in Course
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Your enrollment will be reviewed by our admins
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
