'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Education {
  _id: string
  class: string
  subject: string
  institution: string
  graduationYear: number
  grade?: string
}

export default function EditEducation() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const educationId = params.id as string

  const [formData, setFormData] = useState({
    class: '',
    subject: '',
    institution: '',
    graduationYear: '',
    grade: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchEducation()
    }
  }, [status, router, educationId])

  const fetchEducation = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        const education = data.profile?.education?.find((edu: Education) => edu._id === educationId)
        
        if (education) {
          setFormData({
            class: education.class,
            subject: education.subject,
            institution: education.institution,
            graduationYear: education.graduationYear.toString(),
            grade: education.grade || ''
          })
        } else {
          setError('Education entry not found')
        }
      } else {
        setError('Failed to fetch education details')
      }
    } catch (error) {
      console.error('Error fetching education:', error)
      setError('Failed to fetch education details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/profile/education', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          educationId,
          ...formData,
          graduationYear: parseInt(formData.graduationYear)
        }),
      })

      if (response.ok) {
        router.push('/profile')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update education')
      }
    } catch (error) {
      console.error('Error updating education:', error)
      setError('Failed to update education')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this education entry?')) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/profile/education?id=${educationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/profile')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete education')
      }
    } catch (error) {
      console.error('Error deleting education:', error)
      setError('Failed to delete education')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading education details...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Education</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="class">Class/Degree *</Label>
                <Input
                  type="text"
                  id="class"
                  required
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="e.g., Bachelor of Technology, 12th Grade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject/Stream *</Label>
                <Input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Computer Science, Science, Arts"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution *</Label>
                <Input
                  type="text"
                  id="institution"
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="e.g., ABC University, XYZ School"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year *</Label>
                <Input
                  type="number"
                  id="graduationYear"
                  required
                  min="1950"
                  max="2030"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  placeholder="e.g., 2023"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade/CGPA (Optional)</Label>
                <Input
                  type="text"
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="e.g., 8.5 CGPA, 85%, A Grade"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Updating...' : 'Update Education'}
                </Button>
                
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  variant="destructive"
                >
                  {submitting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
