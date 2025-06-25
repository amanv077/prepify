'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface InterviewPrep {
  _id: string
  targetRole: string
  targetCompany: string
  requiredExperience: string
  expectedCTC: string
  skillsRequired: string[]
}

export default function EditInterviewPrep() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const prepId = params.id as string

  const [formData, setFormData] = useState({
    role: '',
    company: '',
    experience: '',
    expectedCTC: '',
    skillsRequired: [] as string[]
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchInterviewPrep()
    }
  }, [status, router, prepId])

  const fetchInterviewPrep = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        const prep = data.profile?.interviewPreparations?.find((p: InterviewPrep) => p._id === prepId)
        
        if (prep) {
          setFormData({
            role: prep.targetRole,
            company: prep.targetCompany,
            experience: prep.requiredExperience,
            expectedCTC: prep.expectedCTC,
            skillsRequired: prep.skillsRequired || []
          })
        } else {
          setError('Interview preparation entry not found')
        }
      } else {
        setError('Failed to fetch interview preparation details')
      }
    } catch (error) {
      console.error('Error fetching interview preparation:', error)
      setError('Failed to fetch interview preparation details')
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skillsRequired.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skillsRequired: [...formData.skillsRequired, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skillsRequired: formData.skillsRequired.filter(skill => skill !== skillToRemove)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/profile/interview-prep', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prepId,
          ...formData
        }),
      })

      if (response.ok) {
        router.push('/profile')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update interview preparation')
      }
    } catch (error) {
      console.error('Error updating interview preparation:', error)
      setError('Failed to update interview preparation')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this interview preparation entry?')) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/profile/interview-prep?id=${prepId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/profile')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete interview preparation')
      }
    } catch (error) {
      console.error('Error deleting interview preparation:', error)
      setError('Failed to delete interview preparation')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview preparation details...</p>
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
            <CardTitle>Edit Interview Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Target Role *</Label>
                <Input
                  type="text"
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Software Engineer, Data Scientist"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Target Company *</Label>
                <Input
                  type="text"
                  id="company"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Google, Microsoft, Startup"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Required Experience *</Label>
                <Input
                  type="text"
                  id="experience"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g., 2-4 years, Fresher, 5+ years"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedCTC">Expected CTC *</Label>
                <Input
                  type="text"
                  id="expectedCTC"
                  required
                  value={formData.expectedCTC}
                  onChange={(e) => setFormData({ ...formData, expectedCTC: e.target.value })}
                  placeholder="e.g., 15 LPA, 8-12 LPA, $120k"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillInput">Skills Required</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    id="skillInput"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1"
                    placeholder="Add a skill and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Updating...' : 'Update Interview Preparation'}
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
