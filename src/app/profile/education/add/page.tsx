'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import Loader from '@/components/ui/loader'
import { showToast } from '@/components/ui/toaster'
import { 
  GraduationCap, 
  Save, 
  ArrowLeft
} from 'lucide-react'

interface EducationFormData {
  class: string
  subject: string
  institution: string
  graduationYear: string
  grade: string
}

export default function AddEducationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<EducationFormData>({
    class: '',
    subject: '',
    institution: '',
    graduationYear: '',
    grade: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleInputChange = (field: keyof EducationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/profile/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          graduationYear: parseInt(formData.graduationYear)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add education')
      }

      showToast.success('Education added successfully!')
      router.push('/profile')
    } catch (error) {
      console.error('Error adding education:', error)
      showToast.error('Failed to add education')
    } finally {
      setSaving(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Education</h1>
          <p className="text-gray-600">
            Add your educational qualifications to complete your profile.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education Details
              </CardTitle>
              <CardDescription>
                Provide information about your academic background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="class">Degree/Class *</Label>
                <Input
                  id="class"
                  type="text"
                  required
                  value={formData.class}
                  onChange={(e) => handleInputChange('class', e.target.value)}
                  placeholder="e.g. Bachelor's, Master's, High School, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject/Field of Study *</Label>
                <Input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="e.g. Computer Science, Business Administration, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution/School *</Label>
                <Input
                  id="institution"
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  placeholder="e.g. Harvard University, MIT, etc."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year *</Label>
                  <Select
                    id="graduationYear"
                    required
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade/GPA (Optional)</Label>
                  <Input
                    id="grade"
                    type="text"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    placeholder="e.g. 3.8/4.0, A Grade, 85%, etc."
                  />
                </div>
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
                  Add Education
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
