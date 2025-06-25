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
  Target, 
  Save, 
  ArrowLeft,
  Plus,
  Trash2
} from 'lucide-react'

interface InterviewPrepFormData {
  role: string
  company: string
  experience: string
  expectedCTC: string
  skillsRequired: string[]
}

export default function AddInterviewPrepPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasExistingPrep, setHasExistingPrep] = useState(false)

  const [formData, setFormData] = useState<InterviewPrepFormData>({
    role: '',
    company: '',
    experience: '',
    expectedCTC: '',
    skillsRequired: []
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    // Check if user already has interview preparation
    if (status === 'authenticated') {
      checkExistingPrep()
    }
  }, [status, router])

  const checkExistingPrep = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.profile?.interviewPreparations?.length > 0) {
          setHasExistingPrep(true)
        }
      }
    } catch (error) {
      console.error('Error checking existing prep:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof InterviewPrepFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skillsRequired.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/profile/interview-prep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add interview preparation')
      }

      showToast.success('Interview preparation added successfully!')
      router.push('/profile')
    } catch (error) {
      console.error('Error adding interview preparation:', error)
      showToast.error('Failed to add interview preparation')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <Loader size="lg" text="Loading..." />
  }

  if (hasExistingPrep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Interview Preparation Already Exists
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                You can only have one interview preparation at a time. You can edit or delete your current preparation from your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <Button onClick={() => router.push('/profile')} className="mr-4">
                  View Current Preparation
                </Button>
                <Button variant="outline" onClick={() => router.push('/profile')}>
                  Back to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Interview Preparation</h1>
          <p className="text-gray-600">
            Set up a new interview preparation plan to get personalized questions and practice.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Target className="h-5 w-5 mr-2" />
                Interview Preparation Details
              </CardTitle>
              <CardDescription>
                Provide information about your target role and company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role">Target Role *</Label>
                  <Input
                    id="role"
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    placeholder="e.g. Senior Software Engineer, Product Manager, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Target Company *</Label>
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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience">Required Experience *</Label>
                  <Select
                    id="experience"
                    required
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                  >
                    <option value="">Select Experience Level</option>
                    <option value="0-1 years">0-1 years (Entry Level)</option>
                    <option value="1-3 years">1-3 years (Junior)</option>
                    <option value="3-5 years">3-5 years (Mid-level)</option>
                    <option value="5-8 years">5-8 years (Senior)</option>
                    <option value="8+ years">8+ years (Lead/Principal)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedCTC">Expected CTC *</Label>
                  <Input
                    id="expectedCTC"
                    type="text"
                    required
                    value={formData.expectedCTC}
                    onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                    placeholder="e.g. $120,000, ₹15 LPA, etc."
                  />
                </div>
              </div>

              {/* Skills Required */}
              <div className="space-y-2">
                <Label>Skills Required for This Role</Label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1"
                      placeholder="e.g. React, Python, Leadership, etc."
                    />
                    <Button type="button" onClick={handleAddSkill}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {formData.skillsRequired.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skillsRequired.map((skill, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Add skills that are specifically mentioned in the job description or required for this role.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="border-0 shadow-lg mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What you'll get:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Personalized interview questions based on your target role
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Company-specific interview preparation materials
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Skill-based mock interviews and practice sessions
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Salary negotiation tips for your expected CTC range
                </li>
              </ul>
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
              disabled={saving || formData.skillsRequired.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {saving ? (
                <Loader size="sm" text="Adding..." />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Start Preparation
                </>
              )}
            </Button>
          </div>

          {formData.skillsRequired.length === 0 && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Please add at least one skill to proceed
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
