'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FullPageLoader } from '@/components/ui/loader'
import { 
  ArrowLeft, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Plus,
  Eye,
  Edit,
  Users,
  Clock,
  MapPin,
  Star
} from 'lucide-react'

interface Course {
  _id: string
  courseName: string
  courseId: string
  courseTitle: string
  teacher: string
  duration: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  mode: 'REMOTE' | 'IN_CLASS'
  skills: string[]
  courseImage?: string
  isActive: boolean
  isArchived: boolean
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCourses: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    if (status === 'authenticated') {
      fetchCourses()
    }
  }, [status, session, router, currentPage, searchTerm, showArchived])

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        archived: showArchived.toString()
      })

      const response = await fetch(`/api/admin/courses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
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

  if (status === 'loading' || loading) {
    return <FullPageLoader text="Loading courses..." />
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courses Management</h1>
              <p className="text-gray-600">
                {pagination && `${pagination.totalCourses} total courses`}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/admin/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses by name, title, or teacher..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => {
                      setShowArchived(e.target.checked)
                      setCurrentPage(1)
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show archived courses</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {courses.map((course) => (
            <Card 
              key={course._id} 
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => router.push(`/admin/courses/${course._id}`)}
            >
              <CardHeader className="pb-4">
                {course.courseImage && (
                  <img 
                    src={course.courseImage} 
                    alt={course.courseName}
                    className="w-full h-32 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {course.courseName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {course.courseTitle}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getLevelBadgeColor(course.level)}>
                        {course.level}
                      </Badge>
                      <Badge className={getModeBadgeColor(course.mode)}>
                        {course.mode}
                      </Badge>
                      {course.isArchived && (
                        <Badge className="bg-orange-100 text-orange-800">
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
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{course.teacher}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>ID: {course.courseId}</span>
                  </div>
                </div>

                <div className="mb-4">
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

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Created {new Date(course.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/courses/${course._id}`)
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/courses/edit/${course._id}`)
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first course.'}
              </p>
              <Button asChild>
                <Link href="/admin/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div className="text-sm text-gray-500">
                Showing {(pagination.currentPage - 1) * 10 + 1} to{' '}
                {Math.min(pagination.currentPage * 10, pagination.totalCourses)} of{' '}
                {pagination.totalCourses} courses
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
