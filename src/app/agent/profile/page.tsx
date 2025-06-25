'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { FullPageLoader } from '@/components/ui/loader'
import { User, Mail, Phone, MapPin, Building2, Edit, Save, X } from 'lucide-react'

export default function AgentProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    location: '',
    bio: '',
    specializations: '',
    experience: '',
    availability: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated' && session?.user?.role !== 'AGENT') {
      router.push('/dashboard')
    }
    
    // Initialize with mock data for agents
    if (status === 'authenticated' && session?.user?.role === 'AGENT') {
      setFormData({
        name: session.user.name || 'Agent Smith',
        email: session.user.email || 'agent.smith@prepify.com',
        phone: '+1 (555) 123-4567',
        department: 'Client Services',
        location: 'New York, NY',
        bio: 'Experienced client services agent with 5+ years in customer success and account management. Specialized in helping clients achieve their interview preparation goals.',
        specializations: 'Interview Coaching, Resume Review, Technical Interviews, Behavioral Questions',
        experience: '5+ years',
        availability: 'Monday - Friday, 9 AM - 6 PM EST'
      })
    }
  }, [status, session, router])
  
  if (status === 'loading') {
    return <FullPageLoader text="Loading agent profile..." />
  }

  if (!session || session.user.role !== 'AGENT') {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log('Saving agent profile:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form data - in a real app, fetch from database
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Profile</h1>
              <p className="mt-2 text-gray-600">Manage your agent profile and settings</p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="mt-4">{formData.name}</CardTitle>
                <CardDescription>{formData.department}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {formData.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {formData.phone}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {formData.location}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  {formData.department}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assigned Clients</span>
                  <span className="font-semibold">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg. Rating</span>
                  <span className="font-semibold">4.8/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-semibold">&lt; 2 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Basic information about your agent profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{formData.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{formData.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{formData.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{formData.location}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Details about your role and expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    {isEditing ? (
                      <Select name="department" value={formData.department} onChange={(e) => handleInputChange(e)}>
                        <option value="">Select department</option>
                        <option value="Client Services">Client Services</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Sales">Sales</option>
                        <option value="Training">Training</option>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-900">{formData.department}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    {isEditing ? (
                      <Select name="experience" value={formData.experience} onChange={(e) => handleInputChange(e)}>
                        <option value="">Select experience</option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5+ years">5+ years</option>
                        <option value="10+ years">10+ years</option>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-900">{formData.experience}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specializations">Specializations</Label>
                  {isEditing ? (
                    <Input
                      id="specializations"
                      name="specializations"
                      value={formData.specializations}
                      onChange={handleInputChange}
                      placeholder="e.g., Interview Coaching, Resume Review"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.specializations}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  {isEditing ? (
                    <Input
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      placeholder="e.g., Monday - Friday, 9 AM - 6 PM EST"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.availability}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about your background and expertise..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/agent/dashboard">
                    <Button variant="outline" className="w-full justify-start">
                      View Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    Client List
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Task Manager
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Performance Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
