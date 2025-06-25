'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FullPageLoader } from '@/components/ui/loader'
import { showToast } from '@/components/ui/toaster'
import { 
  User, 
  Save, 
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react'

interface AdminProfileData {
  fullName: string
  email: string
  phoneNumber: string
  department: string
  joinDate: string
  lastLogin: string
  permissions: string[]
}

export default function AdminProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<AdminProfileData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    joinDate: '',
    lastLogin: '',
    permissions: []
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      const redirectPath = session?.user?.role === 'AGENT' ? '/agent/dashboard' : '/dashboard'
      router.push(redirectPath)
      return
    }

    if (status === 'authenticated') {
      // Initialize with session data
      setFormData({
        fullName: session.user.name || '',
        email: session.user.email || '',
        phoneNumber: '+1 (555) 123-4567', // Mock data
        department: 'Platform Administration',
        joinDate: '2023-01-15',
        lastLogin: new Date().toISOString().split('T')[0],
        permissions: ['User Management', 'System Settings', 'Analytics', 'Support']
      })
      setLoading(false)
    }
  }, [status, session, router])

  const handleInputChange = (field: keyof AdminProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      showToast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <FullPageLoader text="Loading admin profile..." />
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profile</h1>
          <p className="text-gray-600">
            Manage your administrator account settings and information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
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

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="admin@prepify.com"
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="Platform Administration"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Role</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Administrator
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Employee ID</p>
                  <p className="text-sm text-gray-900">ADM-001</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Join Date</p>
                  <p className="text-sm text-gray-900">{formData.joinDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Login</p>
                  <p className="text-sm text-gray-900">Today, 9:30 AM</p>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formData.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{permission}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Login History
                </Button>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  )
}
