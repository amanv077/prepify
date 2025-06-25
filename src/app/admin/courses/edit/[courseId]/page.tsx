'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FullPageLoader } from '@/components/ui/loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { showToast } from '@/components/ui/toaster'
import { uploadImageToCloudinary, CloudinaryUploadError } from '@/utils/cloudinary'
import { 
  ArrowLeft, 
  Save,
  Plus,
  Trash2,
  Upload,
  BookOpen
} from 'lucide-react'

interface CourseFormData {
  courseName: string
  courseId: string
  skills: string[]
  courseTitle: string
  courseDetails: string
  teacher: string
  duration: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | ''
  whatYouWillLearn: string[]
  mode: 'REMOTE' | 'IN_CLASS' | ''
  courseImage?: string
  isActive: boolean
}

interface ValidationErrors {
  [key: string]: string
}

export default function EditCoursePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState<CourseFormData>({
    courseName: '',
    courseId: '',
    skills: [''],
    courseTitle: '',
    courseDetails: '',
    teacher: '',
    duration: '',
    level: '',
    whatYouWillLearn: [''],
    mode: '',
    courseImage: '',
    isActive: true
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    if (status === 'authenticated') {
      fetchCourse()
    }
  }, [status, session, router, courseId])

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`)
      if (!response.ok) {
        throw new Error('Course not found')
      }
      const course = await response.json()
      
      setFormData({
        courseName: course.courseName || '',
        courseId: course.courseId || '',
        skills: course.skills && course.skills.length > 0 ? course.skills : [''],
        courseTitle: course.courseTitle || '',
        courseDetails: course.courseDetails || '',
        teacher: course.teacher || '',
        duration: course.duration || '',
        level: course.level || '',
        whatYouWillLearn: course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? course.whatYouWillLearn : [''],
        mode: course.mode || '',
        courseImage: course.courseImage || '',
        isActive: course.isActive !== undefined ? course.isActive : true
      })
    } catch (error) {
      console.error('Error fetching course:', error)
      setAlert({ type: 'error', message: 'Course not found' })
      setTimeout(() => router.push('/admin/courses'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CourseFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleArrayInputChange = (field: 'skills' | 'whatYouWillLearn', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: 'skills' | 'whatYouWillLearn') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'skills' | 'whatYouWillLearn', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await uploadImageToCloudinary(file, {
        folder: 'course-images',
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
      })

      handleInputChange('courseImage', result.secure_url)
      showToast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Image upload error:', error)
      if (error instanceof CloudinaryUploadError) {
        showToast.error(error.message)
      } else {
        showToast.error('Failed to upload image. Please try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.courseName.trim()) newErrors.courseName = 'Course name is required'
    if (!formData.courseId.trim()) newErrors.courseId = 'Course ID is required'
    if (!formData.courseTitle.trim()) newErrors.courseTitle = 'Course title is required'
    if (!formData.courseDetails.trim()) newErrors.courseDetails = 'Course details are required'
    if (!formData.teacher.trim()) newErrors.teacher = 'Teacher name is required'
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required'
    if (!formData.level) newErrors.level = 'Level is required'
    if (!formData.mode) newErrors.mode = 'Mode is required'

    const validSkills = formData.skills.filter(skill => skill.trim())
    if (validSkills.length === 0) newErrors.skills = 'At least one skill is required'

    const validLearningOutcomes = formData.whatYouWillLearn.filter(outcome => outcome.trim())
    if (validLearningOutcomes.length === 0) newErrors.whatYouWillLearn = 'At least one learning outcome is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setAlert({ type: 'error', message: 'Please fix the errors below' })
      return
    }

    setSaving(true)

    try {
      const submitData = {
        ...formData,
        skills: formData.skills.filter(skill => skill.trim()),
        whatYouWillLearn: formData.whatYouWillLearn.filter(outcome => outcome.trim())
      }

      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update course')
      }

      showToast.success('Course updated successfully!')
      router.push('/admin/courses')
    } catch (error) {
      console.error('Error updating course:', error)
      setAlert({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to update course' 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <FullPageLoader text="Loading course..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/courses')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Course</h1>
          <p className="text-gray-600">Update course information and settings.</p>
        </div>

        {/* Alert */}
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Core details about the course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseName">Course Name *</Label>
                  <Input
                    id="courseName"
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => handleInputChange('courseName', e.target.value)}
                    placeholder="e.g., Full-Stack Web Development"
                  />
                  {errors.courseName && (
                    <p className="text-sm text-red-600 mt-1">{errors.courseName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="courseId">Course ID *</Label>
                  <Input
                    id="courseId"
                    type="text"
                    value={formData.courseId}
                    onChange={(e) => handleInputChange('courseId', e.target.value)}
                    placeholder="e.g., WEB-DEV-101"
                  />
                  {errors.courseId && (
                    <p className="text-sm text-red-600 mt-1">{errors.courseId}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="courseTitle">Course Title *</Label>
                <Input
                  id="courseTitle"
                  type="text"
                  value={formData.courseTitle}
                  onChange={(e) => handleInputChange('courseTitle', e.target.value)}
                  placeholder="e.g., Master modern web development with React, Node.js, and MongoDB"
                />
                {errors.courseTitle && (
                  <p className="text-sm text-red-600 mt-1">{errors.courseTitle}</p>
                )}
              </div>

              <div>
                <Label htmlFor="courseDetails">Course Details *</Label>
                <Textarea
                  id="courseDetails"
                  value={formData.courseDetails}
                  onChange={(e) => handleInputChange('courseDetails', e.target.value)}
                  placeholder="Provide a detailed description of the course..."
                  rows={6}
                />
                {errors.courseDetails && (
                  <p className="text-sm text-red-600 mt-1">{errors.courseDetails}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teacher">Instructor *</Label>
                  <Input
                    id="teacher"
                    type="text"
                    value={formData.teacher}
                    onChange={(e) => handleInputChange('teacher', e.target.value)}
                    placeholder="e.g., John Doe"
                  />
                  {errors.teacher && (
                    <p className="text-sm text-red-600 mt-1">{errors.teacher}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 8 weeks, 40 hours"
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600 mt-1">{errors.duration}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p className="text-sm text-red-600 mt-1">{errors.level}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="mode">Mode *</Label>
                  <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REMOTE">Remote</SelectItem>
                      <SelectItem value="IN_CLASS">In-Class</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.mode && (
                    <p className="text-sm text-red-600 mt-1">{errors.mode}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Course is active</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Course Image */}
          <Card>
            <CardHeader>
              <CardTitle>Course Image</CardTitle>
              <CardDescription>
                Upload an image for the course (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.courseImage && (
                  <div className="relative">
                    <img 
                      src={formData.courseImage} 
                      alt="Course preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleInputChange('courseImage', '')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="courseImage"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('courseImage')?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <p className="text-sm text-gray-500">
                    Max file size: 5MB. Supported formats: JPG, PNG, WebP
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                What skills will students learn? *
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={skill}
                      onChange={(e) => handleArrayInputChange('skills', index, e.target.value)}
                      placeholder={`Skill ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.skills.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('skills', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('skills')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
                {errors.skills && (
                  <p className="text-sm text-red-600">{errors.skills}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Learning Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
              <CardDescription>
                Key learning outcomes for students *
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.whatYouWillLearn.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={outcome}
                      onChange={(e) => handleArrayInputChange('whatYouWillLearn', index, e.target.value)}
                      placeholder={`Learning outcome ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.whatYouWillLearn.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('whatYouWillLearn', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('whatYouWillLearn')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Learning Outcome
                </Button>
                {errors.whatYouWillLearn && (
                  <p className="text-sm text-red-600">{errors.whatYouWillLearn}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/admin/courses')}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Course
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
