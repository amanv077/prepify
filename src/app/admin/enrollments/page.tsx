'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FullPageLoader } from '@/components/ui/loader'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  User,
  BookOpen,
  Calendar,
  Check,
  X,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface Enrollment {
  _id: string
  enrollmentStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  enrolledAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  userId: {
    _id: string
    name: string
    email: string
  }
  courseId: {
    _id: string
    courseName: string
    courseTitle: string
    teacher: string
  }
  approvedBy?: {
    name: string
    email: string
  }
  rejectedBy?: {
    name: string
    email: string
  }
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalEnrollments: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminEnrollmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

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
      fetchEnrollments()
    }
  }, [status, session, router, currentPage, statusFilter])

  const fetchEnrollments = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/enrollments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrollments)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value)
    setCurrentPage(1)
  }

  const handleEnrollmentAction = async (enrollmentId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(enrollmentId)
    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enrollmentId,
          action,
          rejectionReason: reason
        })
      })

      if (response.ok) {
        fetchEnrollments() // Refresh the list
        setShowRejectModal(null)
        setRejectionReason('')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to process enrollment')
      }
    } catch (error) {
      console.error('Error processing enrollment:', error)
      alert('Failed to process enrollment')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (status === 'loading' || loading) {
    return <FullPageLoader text="Loading enrollments..." />
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
              <h1 className="text-3xl font-bold text-gray-900">Course Enrollments</h1>
              <p className="text-gray-600">
                {pagination && `${pagination.totalEnrollments} total enrollments`}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <Button
                variant={statusFilter === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('PENDING')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('APPROVED')}
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('REJECTED')}
              >
                Rejected
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments List */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollments</CardTitle>
            <CardDescription>
              Manage course enrollment requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {enrollment.userId.name}
                        </h3>
                        {getStatusBadge(enrollment.enrollmentStatus)}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {enrollment.userId.email}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{enrollment.courseId.courseName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Applied {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {enrollment.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="font-medium">Rejection Reason:</span>
                          </div>
                          <p className="mt-1">{enrollment.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {enrollment.enrollmentStatus === 'PENDING' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEnrollmentAction(enrollment._id, 'approve')}
                          disabled={processingId === enrollment._id}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRejectModal(enrollment._id)}
                          disabled={processingId === enrollment._id}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">
                        {enrollment.enrollmentStatus === 'APPROVED' && enrollment.approvedBy && (
                          <span>Approved by {enrollment.approvedBy.name}</span>
                        )}
                        {enrollment.enrollmentStatus === 'REJECTED' && enrollment.rejectedBy && (
                          <span>Rejected by {enrollment.rejectedBy.name}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {enrollments.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
                  <p className="text-gray-500">
                    {statusFilter ? 'No enrollments match the selected filter.' : 'No enrollment requests yet.'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.currentPage - 1) * 10 + 1} to{' '}
                  {Math.min(pagination.currentPage * 10, pagination.totalEnrollments)} of{' '}
                  {pagination.totalEnrollments} enrollments
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Reject Enrollment</CardTitle>
                <CardDescription>
                  Please provide a reason for rejecting this enrollment request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(null)
                      setRejectionReason('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleEnrollmentAction(showRejectModal, 'reject', rejectionReason)}
                    disabled={!rejectionReason.trim() || processingId === showRejectModal}
                  >
                    Reject Enrollment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
