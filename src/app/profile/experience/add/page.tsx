'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Loader from '@/components/ui/loader'
import { showToast } from '@/components/ui/toaster'
import { 
  Briefcase, 
  Save, 
  ArrowLeft
} from 'lucide-react'

interface ExperienceFormData {
  role: string
  company: string
  duration: string
  description: string
  startDate: string
  endDate: string
  isCurrentJob: boolean
}

export default function AddExperiencePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<ExperienceFormData>({
    role: '',
    company: '',
    duration: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrentJob: false
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleInputChange = (field: keyof ExperienceFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/profile/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.isCurrentJob ? null : new Date(formData.endDate).toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add experience')
      }

      showToast.success('Experience added successfully!')
      router.push('/profile')
    } catch (error) {
      console.error('Error adding experience:', error)
      showToast.error('Failed to add experience')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Experience</h1>
          <p className="text-gray-600">
            Add your work experience to showcase your professional background.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Briefcase className="h-5 w-5 mr-2" />
                Work Experience
              </CardTitle>
              <CardDescription>
                Provide details about your professional experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role">Role/Position *</Label>
                  <Input
                    id="role"
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    placeholder="e.g. Software Engineer, Product Manager, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g. Google, Microsoft, Amazon, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g. 2 years 3 months, 1.5 years, etc."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    disabled={formData.isCurrentJob}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCurrentJob"
                  checked={formData.isCurrentJob}
                  onChange={(e) => handleInputChange('isCurrentJob', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="isCurrentJob" className="text-sm text-gray-700">
                  I currently work here
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  placeholder="Describe your responsibilities, achievements, and key projects..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/profile')}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {saving ? (
                <Loader size="sm" text="Adding..." />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Experience
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
