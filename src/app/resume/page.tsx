'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/components/ui/toaster'
import { Plus, Minus, Download, Save, Eye, Trash2 } from 'lucide-react'
import { IResume, IResumeEducation, IResumeExperience, IProject } from '@/models'
import ResumePreview from '@/components/ResumePreview'

interface ResumeFormData {
  name: string
  email: string
  phone: string
  city: string
  summary: string
  education: IResumeEducation[]
  experience: IResumeExperience[]
  skills: string[]
  projects: IProject[]
}

const initialFormData: ResumeFormData = {
  name: '',
  email: '',
  phone: '',
  city: '',
  summary: '',
  education: [{ degree: '', college: '', year: '', marks: '' }],
  experience: [{ role: '', company: '', location: '', startDate: '', endDate: '', totalExperience: '', description: '' }],
  skills: [''],
  projects: [{ name: '', description: '', technologies: [''], link: '' }]
}

export default function ResumePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState<ResumeFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/resume')
      return
    }

    if (status === 'authenticated') {
      fetchResume()
    }
  }, [status, router])

  const fetchResume = async () => {
    try {
      const response = await fetch('/api/resume')
      if (response.ok) {
        const data = await response.json()
        setFormData(data.resume)
        setIsEditing(true)
      } else if (response.status === 404) {
        // No resume found, user can create one
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error fetching resume:', error)
      showToast.error('Failed to fetch resume')
    }
  }

  const calculateExperience = (startDate: string, endDate: string): string => {
    if (!startDate) return ''
    
    const start = new Date(startDate)
    const end = endDate && endDate !== 'current' ? new Date(endDate) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const years = (diffDays / 365).toFixed(1)
    
    return `${years} years`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Calculate experience for each job and filter empty data
      const filteredEducation = formData.education.filter(edu => edu.degree && edu.degree.trim().length > 0)
      
      const filteredExperience = formData.experience
        .filter(exp => exp.role && exp.role.trim().length > 0)
        .map(exp => ({
          ...exp,
          totalExperience: calculateExperience(exp.startDate, exp.endDate)
        }))

      const filteredSkills = formData.skills.filter(skill => skill && skill.trim().length > 0)
      
      const filteredProjects = formData.projects
        .filter(project => project.name && project.name.trim().length > 0)
        .map(project => ({
          ...project,
          technologies: project.technologies.filter(tech => tech && tech.trim().length > 0)
        }))

      const dataToSubmit = {
        ...formData,
        education: filteredEducation,
        experience: filteredExperience,
        skills: filteredSkills,
        projects: filteredProjects
      }

      const url = '/api/resume'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(result.resume)
        setIsEditing(true)
        showToast.success(isEditing ? 'Resume updated successfully!' : 'Resume created successfully!')
      } else {
        const error = await response.json()
        showToast.error(error.error || 'Failed to save resume')
      }
    } catch (error) {
      console.error('Error saving resume:', error)
      showToast.error('Failed to save resume')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your resume? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/resume', {
        method: 'DELETE'
      })

      if (response.ok) {
        setFormData(initialFormData)
        setIsEditing(false)
        showToast.success('Resume deleted successfully!')
      } else {
        const error = await response.json()
        showToast.error(error.error || 'Failed to delete resume')
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
      showToast.error('Failed to delete resume')
    } finally {
      setLoading(false)
    }
  }

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', college: '', year: '', marks: '' }]
    }))
  }

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const updateEducation = (index: number, field: keyof IResumeEducation, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { role: '', company: '', location: '', startDate: '', endDate: '', totalExperience: '', description: '' }]
    }))
  }

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const updateExperience = (index: number, field: keyof IResumeExperience, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }))
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const updateSkill = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }))
  }

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', technologies: [''], link: '' }]
    }))
  }

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }

  const updateProject = (index: number, field: keyof IProject, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }))
  }

  const addProjectTechnology = (projectIndex: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === projectIndex ? { ...proj, technologies: [...proj.technologies, ''] } : proj
      )
    }))
  }

  const removeProjectTechnology = (projectIndex: number, techIndex: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === projectIndex ? { 
          ...proj, 
          technologies: proj.technologies.filter((_, j) => j !== techIndex) 
        } : proj
      )
    }))
  }

  const updateProjectTechnology = (projectIndex: number, techIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === projectIndex ? { 
          ...proj, 
          technologies: proj.technologies.map((tech, j) => j === techIndex ? value : tech) 
        } : proj
      )
    }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (showPreview) {
    return <ResumePreview formData={formData} onBack={() => setShowPreview(false)} />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resume Builder</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            {isEditing ? 'Update your resume' : 'Create your professional resume'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <Button
            type="button"
            onClick={() => setShowPreview(true)}
            variant="outline"
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
            disabled={!formData.name}
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          {isEditing && (
            <Button
              type="button"
              onClick={handleDelete}
              variant="outline"
              className="flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              Delete Resume
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic details about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-1">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter your city"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="summary">Professional Summary *</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Write a brief professional summary"
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Your educational background</CardDescription>
                </div>
                <Button type="button" onClick={addEducation} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.education.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Education {index + 1}</h4>
                    {formData.education.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeEducation(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Degree/Class</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        placeholder="e.g., Bachelor of Engineering"
                      />
                    </div>
                    <div>
                      <Label>College/School</Label>
                      <Input
                        value={edu.college}
                        onChange={(e) => updateEducation(index, 'college', e.target.value)}
                        placeholder="e.g., XYZ University"
                      />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input
                        value={edu.year}
                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                        placeholder="e.g., 2020-2024"
                      />
                    </div>
                    <div>
                      <Label>Marks/Grade</Label>
                      <Input
                        value={edu.marks}
                        onChange={(e) => updateEducation(index, 'marks', e.target.value)}
                        placeholder="e.g., 8.5 CGPA"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Experience</CardTitle>
                  <CardDescription>Your work experience</CardDescription>
                </div>
                <Button type="button" onClick={addExperience} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.experience.map((exp, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Experience {index + 1}</h4>
                    {formData.experience.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeExperience(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={exp.role}
                        onChange={(e) => updateExperience(index, 'role', e.target.value)}
                        placeholder="e.g., Software Engineer"
                      />
                    </div>
                    <div>
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        placeholder="e.g., Google Inc."
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={exp.location}
                        onChange={(e) => updateExperience(index, 'location', e.target.value)}
                        placeholder="e.g., New York, NY"
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id={`current-${index}`}
                            checked={exp.endDate === 'current'}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateExperience(index, 'endDate', 'current')
                              } else {
                                updateExperience(index, 'endDate', '')
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`current-${index}`} className="text-sm text-gray-700">
                            Currently working here
                          </label>
                        </div>
                        <Input
                          type="date"
                          value={exp.endDate === 'current' ? '' : exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          disabled={exp.endDate === 'current'}
                          className={exp.endDate === 'current' ? 'bg-gray-100' : ''}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Total Experience</Label>
                      <Input
                        value={exp.endDate === 'current' ? `${calculateExperience(exp.startDate, exp.endDate)} (Current)` : calculateExperience(exp.startDate, exp.endDate)}
                        placeholder="Calculated automatically"
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={exp.description || ''}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      placeholder="Describe your role and achievements"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>Your technical and professional skills</CardDescription>
                </div>
                <Button type="button" onClick={addSkill} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                    {formData.skills.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeSkill(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Your notable projects and achievements</CardDescription>
                </div>
                <Button type="button" onClick={addProject} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.projects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Project {index + 1}</h4>
                    {formData.projects.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeProject(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Project Name</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        placeholder="e.g., E-commerce Website"
                      />
                    </div>
                    <div>
                      <Label>Project Link (Optional)</Label>
                      <Input
                        value={project.link || ''}
                        onChange={(e) => updateProject(index, 'link', e.target.value)}
                        placeholder="e.g., https://github.com/user/project"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      placeholder="Describe the project and your role"
                      rows={3}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Technologies Used</Label>
                      <Button
                        type="button"
                        onClick={() => addProjectTechnology(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <div key={techIndex} className="flex gap-2">
                          <Input
                            value={tech}
                            onChange={(e) => updateProjectTechnology(index, techIndex, e.target.value)}
                            placeholder="e.g., React"
                          />
                          {project.technologies.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeProjectTechnology(index, techIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="min-w-32 w-full sm:w-auto">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Resume' : 'Create Resume'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
