'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { uploadImageToCloudinary, CloudinaryUploadError } from '@/utils/cloudinary'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FullPageLoader } from '@/components/ui/loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Upload,
  BookOpen,
  Clock,
  Users,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function CreateCoursePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [success, setSuccess] = useState(false)
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    courseName: '',
    courseId: '',
    skills: [] as string[],
    courseTitle: '',
    courseDetails: '',
    teacher: '',
    duration: '',
    level: '',
    whatYouWillLearn: [] as string[],
    mode: '',
    courseImage: ''
  })

  const [skillInput, setSkillInput] = useState('')
  const [learningInput, setLearningInput] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    // Check Cloudinary configuration on component mount
    checkCloudinaryConfig()
  }, [status, session, router])

  const checkCloudinaryConfig = async () => {
    try {
      const response = await fetch('/api/cloudinary/check')
      const data = await response.json()
      setCloudinaryConfigured(data.configured)
      
      if (!data.configured) {
        console.warn('Cloudinary not configured:', data.error)
      }
    } catch (error) {
      console.error('Failed to check Cloudinary configuration:', error)
      setCloudinaryConfigured(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addLearningPoint = () => {
    if (learningInput.trim() && !formData.whatYouWillLearn.includes(learningInput.trim())) {
      setFormData(prev => ({
        ...prev,
        whatYouWillLearn: [...prev.whatYouWillLearn, learningInput.trim()]
      }))
      setLearningInput('')
    }
  }

  const removeLearningPoint = (pointToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter(point => point !== pointToRemove)
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const result = await uploadImageToCloudinary(file, {
        folder: 'course-images',
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
      })

      setFormData(prev => ({
        ...prev,
        courseImage: result.secure_url
      }))
      
      console.log('Image uploaded successfully!')
    } catch (error) {
      console.error('Image upload error:', error)
      if (error instanceof CloudinaryUploadError) {
        // Show more helpful error message for common Cloudinary issues
        if (error.message.includes('Upload preset') && error.message.includes('not found')) {
          alert(`❌ Cloudinary Configuration Error\n\n${error.message}\n\nTo fix this:\n1. Go to https://cloudinary.com/console/settings/upload\n2. Create an upload preset named "courses"\n3. Set it to "Unsigned" mode\n4. Save and try uploading again`)
        } else {
          alert(`Upload Error: ${error.message}`)
        }
      } else {
        alert('Failed to upload image. Please try again.')
      }
    } finally {
      setUploadingImage(false)
    }
  }

  const generateCourseId = () => {
    const prefix = formData.courseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 6)
    const random = Math.random().toString(36).substring(2, 8)
    return `${prefix}_${random}`
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.courseName.trim()) newErrors.courseName = 'Course name is required'
    if (!formData.courseTitle.trim()) newErrors.courseTitle = 'Course title is required'
    if (!formData.courseDetails.trim()) newErrors.courseDetails = 'Course details are required'
    if (!formData.teacher.trim()) newErrors.teacher = 'Teacher name is required'
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required'
    if (!formData.level) newErrors.level = 'Level is required'
    if (!formData.mode) newErrors.mode = 'Mode is required'
    if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required'
    if (formData.whatYouWillLearn.length === 0) newErrors.whatYouWillLearn = 'At least one learning outcome is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const courseData = {
        ...formData,
        courseId: formData.courseId || generateCourseId()
      }

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/courses')
        }, 2000)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create course')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <FullPageLoader text="Loading..." />
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-gray-600">
                Add a new course to the platform
              </p>
            </div>
          </div>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Course created successfully! Redirecting to courses page...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseName">Course Name *</Label>
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => handleInputChange('courseName', e.target.value)}
                    placeholder="e.g., React Development Bootcamp"
                  />
                  {errors.courseName && (
                    <p className="text-sm text-red-600 mt-1">{errors.courseName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="courseId">Course ID (Optional)</Label>
                  <Input
                    id="courseId"
                    value={formData.courseId}
                    onChange={(e) => handleInputChange('courseId', e.target.value)}
                    placeholder="Auto-generated if left empty"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="courseTitle">Course Title *</Label>
                <Input
                  id="courseTitle"
                  value={formData.courseTitle}
                  onChange={(e) => handleInputChange('courseTitle', e.target.value)}
                  placeholder="e.g., Master React Development from Scratch"
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
                  placeholder="Detailed description of the course..."
                  rows={4}
                />
                {errors.courseDetails && (
                  <p className="text-sm text-red-600 mt-1">{errors.courseDetails}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Course Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teacher">Teacher/Instructor *</Label>
                  <Input
                    id="teacher"
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
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Covered *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill (e.g., React, JavaScript)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.skills && (
                  <p className="text-sm text-red-600">{errors.skills}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* What You Will Learn */}
          <Card>
            <CardHeader>
              <CardTitle>What You Will Learn *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={learningInput}
                    onChange={(e) => setLearningInput(e.target.value)}
                    placeholder="Add a learning outcome"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningPoint())}
                  />
                  <Button type="button" onClick={addLearningPoint}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.whatYouWillLearn.map((point, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{point}</span>
                      <button
                        type="button"
                        onClick={() => removeLearningPoint(point)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.whatYouWillLearn && (
                  <p className="text-sm text-red-600">{errors.whatYouWillLearn}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Course Image */}
          <Card>
            <CardHeader>
              <CardTitle>Course Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cloudinaryConfigured === false && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Cloudinary not configured:</strong> Image upload may fail. 
                      Please create an upload preset named "courses" in your{' '}
                      <a 
                        href="https://cloudinary.com/console/settings/upload" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-amber-900"
                      >
                        Cloudinary dashboard
                      </a>{' '}
                      and set it to "Unsigned" mode.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.courseImage ? (
                    <div className="space-y-4">
                      <img 
                        src={formData.courseImage} 
                        alt="Course" 
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setFormData(prev => ({ ...prev, courseImage: '' }))}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="course-image" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload course image
                          </span>
                          <input
                            id="course-image"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                        </label>
                        {uploadingImage && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
