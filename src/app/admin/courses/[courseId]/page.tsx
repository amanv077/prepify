'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FullPageLoader } from '@/components/ui/loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { showToast } from '@/components/ui/toaster'
import { 
  ArrowLeft, 
  Edit,
  Archive,
  ArchiveRestore,
  BookOpen,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Timer,
  Star,
  Calendar,
  Target,
  Award,
  Search,
  Filter,
  Download,
  Eye,
  UserCheck,
  UserX,
  Clock3
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
  isArchived: boolean
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
}

interface Enrollment {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    profilePicture?: string
  }
  enrollmentStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  enrolledAt: string
  approvedAt?: string
  rejectedAt?: string
  approvedBy?: {
    name: string
    email: string
  }
  rejectedBy?: {
    name: string
    email: string
  }
  rejectionReason?: string
}

export default function AdminCourseDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)
  const [processingEnrollment, setProcessingEnrollment] = useState<string | null>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState('')
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    if (status === 'authenticated') {
      fetchCourseDetails()
      fetchEnrollments()
    }
  }, [courseId, status, session])

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  useEffect(() => {
    // Calculate stats whenever enrollments change
    const total = enrollments.length
    const pending = enrollments.filter(e => e.enrollmentStatus === 'PENDING').length
    const approved = enrollments.filter(e => e.enrollmentStatus === 'APPROVED').length
    const rejected = enrollments.filter(e => e.enrollmentStatus === 'REJECTED').length
    setStats({ total, pending, approved, rejected })
  }, [enrollments])

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`)
      if (!response.ok) {
        throw new Error('Course not found')
      }
      const data = await response.json()
      setCourse(data)
    } catch (error) {
      console.error('Error fetching course:', error)
      setAlert({ type: 'error', message: 'Course not found' })
      setTimeout(() => router.push('/admin/courses'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    setEnrollmentsLoading(true)
    try {
      const response = await fetch(`/api/admin/enrollments?courseId=${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrollments || [])
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setEnrollmentsLoading(false)
    }
  }

  const handleEnrollmentAction = async (enrollmentId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessingEnrollment(enrollmentId)
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action,
          ...(reason && { rejectionReason: reason })
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update enrollment')
      }

      await fetchEnrollments() // Refresh enrollments
      showToast.success(`Enrollment ${action}d successfully`)
    } catch (error) {
      console.error('Error updating enrollment:', error)
      showToast.error(`Failed to ${action} enrollment`)
    } finally {
      setProcessingEnrollment(null)
    }
  }

  const handleArchiveCourse = async () => {
    if (!course) return
    
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isArchived: !course.isArchived
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update course')
      }

      setCourse(prev => prev ? { ...prev, isArchived: !prev.isArchived } : null)
      showToast.success(`Course ${course.isArchived ? 'unarchived' : 'archived'} successfully`)
    } catch (error) {
      console.error('Error updating course:', error)
      showToast.error('Failed to update course')
    }
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesStatus = !statusFilter || enrollment.enrollmentStatus === statusFilter
    const matchesSearch = !searchFilter || 
      enrollment.userId.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      enrollment.userId.email.toLowerCase().includes(searchFilter.toLowerCase())
    return matchesStatus && matchesSearch
  })

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
        return <Badge className="bg-yellow-100 text-yellow-800"><Timer className="h-3 w-3 mr-1" />Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>
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
          <Button onClick={() => router.push('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin/courses')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Course Details</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => router.push(`/admin/courses/edit/${courseId}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant={course.isArchived ? "default" : "outline"}
              onClick={handleArchiveCourse}
            >
              {course.isArchived ? (
                <>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Unarchive
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Course Status */}
        {(course.isArchived || !course.isActive) && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              {course.isArchived && 'This course is archived. '}
              {!course.isActive && 'This course is inactive. '}
              It won't be visible to users.
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
                <div className="space-y-4">
                  <div>
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
                      {course.isArchived && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Archive className="h-3 w-3 mr-1" />
                          Archived
                        </Badge>
                      )}
                      {!course.isActive && (
                        <Badge className="bg-gray-100 text-gray-800">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
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
                  What Students Will Learn
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
                  Skills Covered
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
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Created</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Created By</span>
                    </div>
                    <span className="text-sm font-medium">{course.createdBy.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Applications</span>
                    <span className="text-lg font-bold">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-600">Pending</span>
                    <span className="font-medium">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Approved</span>
                    <span className="font-medium">{stats.approved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Rejected</span>
                    <span className="font-medium">{stats.rejected}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enrollments Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Student Applications</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                  </div>
                  <Button
                    size="sm"
                    variant={statusFilter === '' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('')}
                  >
                    All ({stats.total})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('PENDING')}
                  >
                    Pending ({stats.pending})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('APPROVED')}
                  >
                    Approved ({stats.approved})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('REJECTED')}
                  >
                    Rejected ({stats.rejected})
                  </Button>
                </div>
              </div>

              {/* Enrollments List */}
              {enrollmentsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading applications...</p>
                </div>
              ) : filteredEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-600">
                    {enrollments.length === 0 
                      ? 'No students have applied for this course yet.'
                      : 'No applications match your current filters.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEnrollments.map((enrollment) => (
                    <Card key={enrollment._id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {enrollment.userId.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{enrollment.userId.name}</h3>
                              <p className="text-sm text-gray-600">{enrollment.userId.email}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">
                                  Applied: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                </span>
                                {enrollment.approvedAt && (
                                  <span className="text-xs text-green-600">
                                    Approved: {new Date(enrollment.approvedAt).toLocaleDateString()}
                                  </span>
                                )}
                                {enrollment.rejectedAt && (
                                  <span className="text-xs text-red-600">
                                    Rejected: {new Date(enrollment.rejectedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {getEnrollmentBadge(enrollment.enrollmentStatus)}
                            
                            {enrollment.enrollmentStatus === 'PENDING' && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEnrollmentAction(enrollment._id, 'approve')}
                                  disabled={processingEnrollment === enrollment._id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEnrollmentAction(enrollment._id, 'reject', 'Not qualified')}
                                  disabled={processingEnrollment === enrollment._id}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            
                            {enrollment.enrollmentStatus === 'REJECTED' && enrollment.rejectionReason && (
                              <div className="text-xs text-red-600 max-w-xs">
                                Reason: {enrollment.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
