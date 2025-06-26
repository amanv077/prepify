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
  Globe,
  Monitor,
  Zap,
  TrendingUp,
  PlayCircle,
  BookmarkPlus
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
    const shareText = `Check out this amazing program: ${course?.courseName} - ${course?.courseTitle}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.courseName,
          text: shareText,
          url: url
        })
      } catch (error) {
        // User cancelled or error occurred, fallback to copy
        await copyToClipboard(url)
      }
    } else {
      // Fallback to clipboard
      await copyToClipboard(url)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast.success('Program link copied to clipboard!')
    } catch (error) {
      showToast.error('Failed to copy link')
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
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Program not found</h1>
          <p className="text-gray-600 mb-8">The program you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => router.push('/programs')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Programs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Back Button */}
        <div className="mb-8">
          <Button
            onClick={() => router.push("/programs")}
            className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl border-0 text-lg"
          >
            <ArrowLeft className="h-6 w-6 mr-3" />
            Back to Programs
          </Button>

          {/* Breadcrumb */}
          <div className="flex items-center text-lg text-gray-600 space-x-3">
            <span
              className="hover:text-blue-600 cursor-pointer font-semibold transition-colors"
              onClick={() => router.push("/programs")}
            >
              Programs
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-bold">
              {course?.courseName}
            </span>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            className={`mb-8 ${
              alert.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            } rounded-xl shadow-lg`}
          >
            <AlertDescription
              className={`${
                alert.type === "success" ? "text-green-800" : "text-red-800"
              } font-medium`}
            >
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Hero Section */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {course.courseImage ? (
                <div className="relative">
                  <img
                    src={course.courseImage}
                    alt={course.courseName}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Button
                      onClick={handleShare}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-xl transition-all"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white min-h-80 flex items-center">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <BookOpen className="h-16 w-16 text-white/80 mb-4" />
                    </div>
                    <Button
                      onClick={handleShare}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-xl transition-all"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Program Title and Info - Moved below image */}
            <Card className="shadow-xl rounded-2xl border-0 bg-white">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-3 leading-tight text-gray-900">
                      {course.courseName}
                    </h1>
                    <p className="text-xl text-gray-700 mb-6 leading-relaxed font-medium">
                      {course.courseTitle}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white font-bold px-4 py-2 text-sm rounded-full shadow-lg">
                        <Star className="h-4 w-4 mr-2" />
                        {course.level}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-4 py-2 text-sm rounded-full shadow-lg">
                        <MapPin className="h-4 w-4 mr-2" />
                        {course.mode}
                      </Badge>
                      {enrollment && (
                        <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-bold px-4 py-2 text-sm rounded-full shadow-lg">
                          <Timer className="h-4 w-4 mr-2" />
                          {enrollment.enrollmentStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Program Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {course.teacher}
                    </p>
                    <p className="text-xs text-gray-600">Instructor</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {course.duration}
                    </p>
                    <p className="text-xs text-gray-600">Duration</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {course.level}
                    </p>
                    <p className="text-xs text-gray-600">Level</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MapPin className="h-6 w-6 text-indigo-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {course.mode}
                    </p>
                    <p className="text-xs text-gray-600">Mode</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card className="shadow-xl rounded-2xl border-0 bg-white">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-2xl">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                  <Target className="h-6 w-6 mr-3 text-green-600" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-sm"
                    >
                      <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-900 font-semibold leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="shadow-xl rounded-2xl border-0 bg-white">
              <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                  <Award className="h-6 w-6 mr-3 text-purple-600" />
                  Skills You'll Master
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-4">
                  {course.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-5 py-3 text-sm rounded-full shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Course Description */}
            <Card className="shadow-xl rounded-2xl border-0 bg-white">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                  <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
                  Program Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose max-w-none">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {course.courseDetails}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">
                  Program Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        Instructor
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {course.teacher}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        Duration
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {course.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        Level
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {course.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        Mode
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {course.mode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                        <Calendar className="h-5 w-5 text-yellow-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        Created
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Action */}
            <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-6">
                {status === "unauthenticated" ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <GraduationCap className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      Ready to Start Learning?
                    </p>
                    <p className="text-sm text-gray-600">
                      Sign in to enroll in this program
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                      onClick={() => router.push("/login")}
                    >
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Sign In to Enroll
                    </Button>
                  </div>
                ) : session?.user?.role !== "USER" ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">
                      Only users can enroll in programs
                    </p>
                    <Button
                      className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl"
                      disabled
                    >
                      Enrollment Not Available
                    </Button>
                  </div>
                ) : enrollment ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      {enrollment.enrollmentStatus === "PENDING" && (
                        <Timer className="h-8 w-8 text-yellow-600" />
                      )}
                      {enrollment.enrollmentStatus === "APPROVED" && (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      )}
                      {enrollment.enrollmentStatus === "REJECTED" && (
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                    {getEnrollmentBadge(enrollment.enrollmentStatus)}
                    <p className="text-sm font-medium text-gray-700">
                      {enrollment.enrollmentStatus === "PENDING" &&
                        "Your application is being reviewed by our team"}
                      {enrollment.enrollmentStatus === "APPROVED" &&
                        "Congratulations! You are enrolled in this program"}
                      {enrollment.enrollmentStatus === "REJECTED" &&
                        "Your application was not approved this time"}
                    </p>
                    {enrollment.enrollmentStatus === "REJECTED" && (
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                        onClick={handleEnroll}
                        disabled={enrolling}
                      >
                        <GraduationCap className="h-5 w-5 mr-2" />
                        Apply Again
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900 mb-2">
                        Start Your Journey
                      </p>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg text-lg"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <Timer className="h-5 w-5 mr-2 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-5 w-5 mr-2" />
                          Enroll in Program
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center font-medium">
                      🎓 Your enrollment will be reviewed by our admins
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-xl rounded-2xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 transition-all p-3 rounded-xl"
                  onClick={() => copyToClipboard(window.location.href)}
                >
                  <Copy className="h-4 w-4 mr-3" />
                  Copy Program Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-green-50 hover:border-green-300 transition-all p-3 rounded-xl"
                >
                  <BookmarkPlus className="h-4 w-4 mr-3" />
                  Save Program
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-purple-50 hover:border-purple-300 transition-all p-3 rounded-xl"
                >
                  <PlayCircle className="h-4 w-4 mr-3" />
                  Preview Program
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-orange-50 hover:border-orange-300 transition-all p-3 rounded-xl"
                >
                  <Users className="h-4 w-4 mr-3" />
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 transition-all p-3 rounded-xl"
                >
                  <Share2 className="h-4 w-4 mr-3" />
                  Live Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
