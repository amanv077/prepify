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
  ChevronDown,
  ChevronUp,
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
  const [isFilterOpen, setIsFilterOpen] = useState(false)

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
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8 border-0">
          <div className="space-y-4 sm:space-y-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search programs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 py-3 text-base sm:text-lg border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full"
                />
              </div>
              <Button 
                type="submit" 
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all w-full sm:w-auto"
              >
                Search
              </Button>
            </form>

            {/* Filters Header */}
            <div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-between w-full pb-2 border-b border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <span className="text-base sm:text-lg font-semibold text-gray-900">Filters</span>
                  {(levelFilter || modeFilter) && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {[levelFilter, modeFilter].filter(Boolean).length} active
                    </Badge>
                  )}
                </div>
                {isFilterOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            
            {/* Collapsible Filters */}
            {isFilterOpen && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Level Filter */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 block">Level:</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={levelFilter === '' ? 'default' : 'outline'}
                      onClick={() => setLevelFilter('')}
                      className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all ${
                        levelFilter === '' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      All Levels
                    </Button>
                    <Button
                      size="sm"
                      variant={levelFilter === 'BEGINNER' ? 'default' : 'outline'}
                      onClick={() => setLevelFilter('BEGINNER')}
                      className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all ${
                        levelFilter === 'BEGINNER' 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'hover:bg-green-50 hover:border-green-300'
                      }`}
                    >
                      Beginner
                    </Button>
                    <Button
                      size="sm"
                      variant={levelFilter === 'INTERMEDIATE' ? 'default' : 'outline'}
                      onClick={() => setLevelFilter('INTERMEDIATE')}
                      className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all ${
                        levelFilter === 'INTERMEDIATE' 
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                          : 'hover:bg-yellow-50 hover:border-yellow-300'
                      }`}
                    >
                      Intermediate
                    </Button>
                    <Button
                      size="sm"
                      variant={levelFilter === 'ADVANCED' ? 'default' : 'outline'}
                      onClick={() => setLevelFilter('ADVANCED')}
                      className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all ${
                        levelFilter === 'ADVANCED' 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'hover:bg-red-50 hover:border-red-300'
                      }`}
                    >
                      Advanced
                    </Button>
                  </div>
                </div>

                {/* Mode Filter */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 block">Mode:</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={modeFilter === '' ? 'default' : 'outline'}
                      onClick={() => setModeFilter('')}
                      className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all ${
                        modeFilter === '' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      All Modes
                    </Button>
                    <Button
                      size="sm"
                      variant={modeFilter === 'REMOTE' ? 'default' : 'outline'}
                      onClick={() => setModeFilter('REMOTE')}
                      className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all ${
                        modeFilter === 'REMOTE' 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'hover:bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      Remote
                    </Button>
                    <Button
                      size="sm"
                      variant={modeFilter === 'IN_CLASS' ? 'default' : 'outline'}
                      onClick={() => setModeFilter('IN_CLASS')}
                      className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all ${
                        modeFilter === 'IN_CLASS' 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                          : 'hover:bg-indigo-50 hover:border-indigo-300'
                      }`}
                    >
                      In-Class
                    </Button>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(levelFilter || modeFilter) && (
                  <div className="pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLevelFilter('')
                        setModeFilter('')
                      }}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Info */}
        {pagination && (
          <div className="mb-8 flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">
              {pagination.totalCourses} {pagination.totalCourses === 1 ? 'Program' : 'Programs'} Found
            </div>
            <div className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {courses.map((course) => {
            const enrollment = getEnrollmentStatus(course._id)
            return (
              <Card 
                key={course._id} 
                className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white rounded-2xl cursor-pointer"
                onClick={() => router.push(`/programs/${course._id}`)}
              >
                {/* Course Image with Gradient Overlay */}
                <div className="relative overflow-hidden">
                  {course.courseImage ? (
                    <>
                      <img 
                        src={course.courseImage} 
                        alt={course.courseName}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {/* Level Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className={`${getLevelBadgeColor(course.level).replace('100', '600')} text-white font-bold px-3 py-1 rounded-full shadow-lg`}>
                          {course.level}
                        </Badge>
                      </div>
                      {/* Mode Badge */}
                      <div className="absolute bottom-4 left-4">
                        <Badge className={`${getModeBadgeColor(course.mode).replace('100', '600')} text-white font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg`}>
                          <MapPin className="h-3 w-3" />
                          {course.mode}
                        </Badge>
                      </div>
                      {/* Course Title Overlay */}
                      <div className="absolute bottom-4 right-4">
                        <div className="text-white text-right">
                          <p className="text-sm font-medium opacity-90">{course.duration}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative w-full h-56 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
                      <BookOpen className="h-20 w-20 text-white/80" />
                      <div className="absolute top-4 right-4">
                        <Badge className={`${getLevelBadgeColor(course.level).replace('100', '600')} text-white font-bold px-3 py-1 rounded-full shadow-lg`}>
                          {course.level}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge className={`${getModeBadgeColor(course.mode).replace('100', '600')} text-white font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg`}>
                          <MapPin className="h-3 w-3" />
                          {course.mode}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <div className="text-white text-right">
                          <p className="text-sm font-medium opacity-90">{course.duration}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Enrollment Status Badge */}
                  {enrollment && (
                    <div className="absolute top-4 left-4">
                      {getEnrollmentBadge(enrollment.enrollmentStatus)}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Course Title and Description */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                      {course.courseName}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {course.courseTitle}
                    </p>
                  </div>

                  {/* Instructor Information */}
                  <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Instructor</p>
                      <p className="text-sm font-bold text-gray-900">{course.teacher}</p>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center p-2 bg-green-50 rounded-lg">
                      <Clock className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="text-xs text-green-600 font-semibold">Duration</p>
                        <p className="text-sm font-bold text-gray-900">{course.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-purple-50 rounded-lg">
                      <GraduationCap className="h-4 w-4 text-purple-600 mr-2" />
                      <div>
                        <p className="text-xs text-purple-600 font-semibold">Level</p>
                        <p className="text-sm font-bold text-gray-900">{course.level}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">Key Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {course.skills.slice(0, 4).map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium px-2 py-1"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {course.skills.length > 4 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-gray-100 text-gray-600 border-gray-300 font-medium px-2 py-1"
                        >
                          +{course.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* What You'll Learn Preview */}
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">What You'll Learn</p>
                    <ul className="space-y-1">
                      {course.whatYouWillLearn.slice(0, 2).map((item, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-1 shrink-0" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                      {course.whatYouWillLearn.length > 2 && (
                        <li className="text-xs text-blue-600 font-medium">
                          +{course.whatYouWillLearn.length - 2} more learning outcomes
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-100">
                    {!session?.user ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg" 
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push('/login')
                        }}
                      >
                        Login to Enroll
                      </Button>
                    ) : session?.user?.role !== 'USER' ? (
                      <Button 
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all duration-200 shadow-md" 
                        variant="outline" 
                        disabled
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details
                      </Button>
                    ) : enrollment ? (
                      <Button 
                        className="w-full font-bold py-3 rounded-xl transition-all duration-200 shadow-md" 
                        variant="outline" 
                        disabled
                        onClick={(e) => e.stopPropagation()}
                      >
                        {enrollment.enrollmentStatus === 'PENDING' && '⏳ Enrollment Pending'}
                        {enrollment.enrollmentStatus === 'APPROVED' && '✅ Already Enrolled'}
                        {enrollment.enrollmentStatus === 'REJECTED' && '❌ Enrollment Rejected'}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEnroll(course._id)
                        }}
                        disabled={enrolling === course._id}
                      >
                        {enrolling === course._id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Enrolling...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Enroll Now
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* No Results */}
        {courses.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No programs found</h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              {search || levelFilter || modeFilter 
                ? 'No programs match your search criteria. Try adjusting your filters to discover more learning opportunities.'
                : 'No programs are currently available. Check back soon for new learning opportunities!'
              }
            </p>
            {(search || levelFilter || modeFilter) && (
              <Button 
                variant="outline" 
                className="mt-6 px-6 py-2"
                onClick={() => {
                  setSearch('')
                  setLevelFilter('')
                  setModeFilter('')
                  setCurrentPage(1)
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between py-8">
            <div className="text-sm text-gray-600 font-medium">
              Showing page {pagination.currentPage} of {pagination.totalPages} 
              <span className="text-gray-400 ml-2">({pagination.totalCourses} total programs)</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="flex items-center gap-2 disabled:opacity-50 transition-all hover:bg-blue-50 hover:border-blue-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                  const pageNum = pagination.currentPage <= 3 
                    ? index + 1 
                    : pagination.currentPage + index - 2
                  
                  if (pageNum > pagination.totalPages) return null
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 p-0 ${
                        pageNum === pagination.currentPage 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'hover:bg-blue-50 hover:border-blue-200'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="flex items-center gap-2 disabled:opacity-50 transition-all hover:bg-blue-50 hover:border-blue-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
