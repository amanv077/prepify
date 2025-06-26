'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  User, 
  MessageSquare, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { showToast } from '@/components/ui/toaster'
import Loader from '@/components/ui/loader'

interface Contact {
  _id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  subject: string
  message: string
  newsletter: boolean
  submittedAt: string
  status: 'new' | 'in-progress' | 'resolved'
  ipAddress?: string
}

interface ContactsResponse {
  contacts: Contact[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchContacts = async (page = 1, status = filter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (status && status !== 'all') {
        params.append('status', status)
      }

      const response = await fetch(`/api/contact?${params}`)
      if (response.ok) {
        const data: ContactsResponse = await response.json()
        setContacts(data.contacts)
        setPagination(data.pagination)
        setCurrentPage(page)
      } else {
        showToast.error('Failed to fetch contacts')
      }
    } catch (error) {
      showToast.error('Error loading contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    fetchContacts(1, newFilter)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          New
        </Badge>
      case 'in-progress':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          In Progress
        </Badge>
      case 'resolved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Resolved
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-2">Manage and respond to customer inquiries</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Messages</p>
                <p className="text-2xl font-bold text-red-600">
                  {contacts.filter(c => c.status === 'new').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {contacts.filter(c => c.status === 'in-progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {contacts.filter(c => c.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            {pagination.total} total messages • Page {pagination.page} of {pagination.pages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No messages found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </span>
                        {contact.company && (
                          <>
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{contact.company}</span>
                          </>
                        )}
                        {getStatusBadge(contact.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(contact.submittedAt)}
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <span className="font-medium text-gray-900">Subject: </span>
                        <span className="text-gray-700">{contact.subject}</span>
                      </div>
                      
                      <p className="text-gray-600 line-clamp-2">
                        {contact.message.length > 150 
                          ? `${contact.message.substring(0, 150)}...` 
                          : contact.message
                        }
                      </p>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchContacts(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchContacts(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Detail Modal - TODO: Implement modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contact Details</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedContact(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedContact.firstName} {selectedContact.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedContact.email}</p>
                </div>
                {selectedContact.company && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company</label>
                    <p className="text-gray-900">{selectedContact.company}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <p className="text-gray-900">{selectedContact.subject}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <p>Submitted: {formatDate(selectedContact.submittedAt)}</p>
                {selectedContact.newsletter && (
                  <Badge variant="outline">Newsletter Subscribed</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
