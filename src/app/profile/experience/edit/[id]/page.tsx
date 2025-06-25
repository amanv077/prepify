'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Experience {
  _id: string
  company: string
  role: string
  duration: string
  description?: string
}

export default function EditExperience() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const experienceId = params.id as string

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    duration: '',
    description: ''
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
      fetchExperience()
    }
  }, [status, router, experienceId])

  const fetchExperience = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        const experience = data.profile?.experience?.find((exp: Experience) => exp._id === experienceId)
        
        if (experience) {
          setFormData({
            company: experience.company,
            role: experience.role,
            duration: experience.duration,
            description: experience.description || ''
          })
        } else {
          setError('Experience entry not found')
        }
      } else {
        setError('Failed to fetch experience details')
      }
    } catch (error) {
      console.error('Error fetching experience:', error)
      setError('Failed to fetch experience details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/profile/experience', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experienceId,
          ...formData
        }),
      })

      if (response.ok) {
        router.push('/profile')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update experience')
      }
    } catch (error) {
      console.error('Error updating experience:', error)
      setError('Failed to update experience')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this experience entry?')) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/profile/experience?id=${experienceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/profile')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete experience')
      }
    } catch (error) {
      console.error('Error deleting experience:', error)
      setError('Failed to delete experience')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading experience details...</p>
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
            <CardTitle>Edit Experience</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  type="text"
                  id="company"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Google, Microsoft"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  type="text"
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Software Engineer, Data Analyst"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  type="text"
                  id="duration"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., Jan 2022 - Present, 2 years"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Updating...' : 'Update Experience'}
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
