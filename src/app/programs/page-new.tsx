'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FullPageLoader } from '@/components/ui/loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Timer,
  Filter,
  GraduationCap
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

interface Pagination {
  currentPage: number
  totalPages: number
  totalCourses: number
  hasNext: boolean
  hasPrev: boolean
}

interface UserEnrollment {
  _id: string
  courseId: string
  enrollmentStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  enrolledAt: string
}

export default function ProgramsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [userEnrollments, setUserEnrollments] = useState<UserEnrollment[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    fetchCourses()
    if (session?.user) {
      fetchUserEnrollments()
    }
  }, [currentPage, search, levelFilter, modeFilter, session])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (search) params.append('search', search)
      if (levelFilter) params.append('level', levelFilter)
      if (modeFilter) params.append('mode', modeFilter)

      const response = await fetch(`/api/courses?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setAlert({ type: 'error', message: 'Failed to fetch courses' })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments')
      if (response.ok) {
        const data = await response.json()
        setUserEnrollments(data.enrollments)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCourses()
  }

  const handleEnroll = async (courseId: string) => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setEnrolling(courseId)
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
      })

      const data = await response.json()

      if (response.ok) {
        setAlert({ type: 'success', message: 'Enrollment request submitted successfully!' })
        fetchUserEnrollments()
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to enroll' })
      }
    } catch (error) {
      console.error('Error enrolling:', error)
      setAlert({ type: 'error', message: 'Failed to enroll in course' })
    } finally {
      setEnrolling(null)
    }
  }

  const getEnrollmentStatus = (courseId: string) => {
    return userEnrollments.find(e => e.courseId === courseId)
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
        return <Badge className="bg-yellow-100 text-yellow-800"><Timer className="h-3 w-3 mr-1" />Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Enrolled</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return null
    }
  }

  if (loading && courses.length === 0) {
    return <FullPageLoader text="Loading programs..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <GraduationCap className="h-10 w-10 mr-4 text-blue-600" />
            Learning Programs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advance your career with our comprehensive courses designed by industry experts
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search courses by name, skills, or teacher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                {/* Level Filter */}
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={levelFilter === '' ? 'default' : 'outline'}
                    onClick={() => setLevelFilter('')}
                  >
                    All Levels
                  </Button>
                  <Button
                    size="sm"
                    variant={levelFilter === 'BEGINNER' ? 'default' : 'outline'}
                    onClick={() => setLevelFilter('BEGINNER')}
                  >
                    Beginner
                  </Button>
                  <Button
                    size="sm"
                    variant={levelFilter === 'INTERMEDIATE' ? 'default' : 'outline'}
                    onClick={() => setLevelFilter('INTERMEDIATE')}
                  >
                    Intermediate
                  </Button>
                  <Button
                    size="sm"
                    variant={levelFilter === 'ADVANCED' ? 'default' : 'outline'}
                    onClick={() => setLevelFilter('ADVANCED')}
                  >
                    Advanced
                  </Button>
                </div>

                {/* Mode Filter */}
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={modeFilter === '' ? 'default' : 'outline'}
                    onClick={() => setModeFilter('')}
                  >
                    All Modes
                  </Button>
                  <Button
                    size="sm"
                    variant={modeFilter === 'REMOTE' ? 'default' : 'outline'}
                    onClick={() => setModeFilter('REMOTE')}
                  >
                    Remote
                  </Button>
                  <Button
                    size="sm"
                    variant={modeFilter === 'IN_CLASS' ? 'default' : 'outline'}
                    onClick={() => setModeFilter('IN_CLASS')}
                  >
                    In-Class
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        {pagination && (
          <div className="mb-6 text-sm text-gray-600">
            Showing {courses.length} of {pagination.totalCourses} courses
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {courses.map((course) => {
            const enrollment = getEnrollmentStatus(course._id)
            return (
              <Card key={course._id} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="space-y-4">
                  {course.courseImage && (
                    <img 
                      src={course.courseImage} 
                      alt={course.courseName}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <CardTitle className="line-clamp-2">{course.courseName}</CardTitle>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{course.courseTitle}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getLevelBadgeColor(course.level)}>
                      {course.level}
                    </Badge>
                    <Badge className={getModeBadgeColor(course.mode)}>
                      <MapPin className="h-3 w-3 mr-1" />
                      {course.mode}
                    </Badge>
                    {enrollment && getEnrollmentBadge(enrollment.enrollmentStatus)}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 flex-1">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Instructor: {course.teacher}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Duration: {course.duration}</span>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Skills you'll learn:</p>
                      <div className="flex flex-wrap gap-1">
                        {course.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {course.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{course.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-auto">
                    {!session?.user ? (
                      <Button 
                        className="w-full" 
                        onClick={() => router.push('/login')}
                      >
                        Login to Enroll
                      </Button>
                    ) : enrollment ? (
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        disabled
                      >
                        {enrollment.enrollmentStatus === 'PENDING' && 'Enrollment Pending'}
                        {enrollment.enrollmentStatus === 'APPROVED' && 'Already Enrolled'}
                        {enrollment.enrollmentStatus === 'REJECTED' && 'Enrollment Rejected'}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrolling === course._id}
                      >
                        {enrolling === course._id ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* No Results */}
        {courses.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">
                {search || levelFilter || modeFilter 
                  ? 'No courses match your search criteria. Try adjusting your filters.'
                  : 'No courses are currently available.'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
