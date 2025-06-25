'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/ui/loader'
import { showToast } from '@/components/ui/toaster'
import { 
  User, 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft
} from 'lucide-react'

interface FormData {
  fullName: string
  phoneNumber: string
  age: string
  city: string
  country: string
  totalExperience: string
  currentRole: string
  skills: string[]
}

export default function CompleteProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    age: '',
    city: '',
    country: '',
    totalExperience: '',
    currentRole: '',
    skills: []
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session, status])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      
      if (response.ok) {
        const data = await response.json()
        const profile = data.profile
        
        setFormData({
          fullName: profile.fullName || session?.user?.name || '',
          phoneNumber: profile.phoneNumber || '',
          age: profile.age?.toString() || '',
          city: profile.city || '',
          country: profile.country || '',
          totalExperience: profile.totalExperience?.toString() || '',
          currentRole: profile.currentRole || '',
          skills: profile.skills || []
        })
        setIsEditing(true)
      } else if (response.status === 404) {
        // New profile
        setFormData(prev => ({
          ...prev,
          fullName: session?.user?.name || ''
        }))
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        totalExperience: parseInt(formData.totalExperience)
      }

      const method = isEditing ? 'PUT' : 'POST'
      const response = await fetch('/api/profile', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      showToast.success(isEditing ? 'Profile updated successfully!' : 'Profile created successfully!')
      router.push('/profile')
    } catch (error) {
      console.error('Error saving profile:', error)
      showToast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loader size="lg" text="Loading profile form..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-gray-600">
            {isEditing 
              ? 'Update your information to keep your profile current.'
              : 'Help us personalize your interview preparation experience.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Personal Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic information about yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      required
                      min="16"
                      max="100"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalExperience">Total Experience (Years) *</Label>
                    <Input
                      id="totalExperience"
                      type="number"
                      required
                      min="0"
                      max="50"
                      value={formData.totalExperience}
                      onChange={(e) => handleInputChange('totalExperience', e.target.value)}
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="United States"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="currentRole">Current Role (Optional)</Label>
                    <Input
                      id="currentRole"
                      type="text"
                      value={formData.currentRole}
                      onChange={(e) => handleInputChange('currentRole', e.target.value)}
                      placeholder="Software Engineer, Product Manager, etc."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900">Skills</CardTitle>
                <CardDescription>
                  Add your technical and professional skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1"
                      placeholder="e.g. JavaScript, Python, Leadership, etc."
                    />
                    <Button type="button" onClick={handleAddSkill}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
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
                  <Loader size="sm" text="Saving..." />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Profile' : 'Create Profile'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Next Steps */}
        <Card className="border-0 shadow-lg mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What's Next?</h3>
            <p className="text-gray-700 mb-4">
              After completing your basic profile, you can add:
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <span>• Education Details</span>
              <span>• Work Experience</span>
              <span>• Interview Preparations</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
