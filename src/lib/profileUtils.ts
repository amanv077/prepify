import { IUserProfile } from '@/models/UserProfile'

export interface ProfileStatus {
  isComplete: boolean
  completionPercentage: number
  missingFields: string[]
  suggestions: string[]
}

export function checkProfileCompletion(profile: IUserProfile | null): ProfileStatus {
  if (!profile) {
    return {
      isComplete: false,
      completionPercentage: 0,
      missingFields: ['Complete profile setup'],
      suggestions: ['Create your profile to get started with personalized interview preparation']
    }
  }

  const missingFields: string[] = []
  const suggestions: string[] = []
  let completedFields = 0
  const totalFields = 10

  // Check basic information
  if (!profile.fullName) missingFields.push('Full Name')
  else completedFields++

  if (!profile.phoneNumber) missingFields.push('Phone Number')
  else completedFields++

  if (!profile.age) missingFields.push('Age')
  else completedFields++

  if (!profile.city) missingFields.push('City')
  else completedFields++

  if (!profile.country) missingFields.push('Country')
  else completedFields++

  if (profile.totalExperience === undefined) missingFields.push('Total Experience')
  else completedFields++

  // Check education
  if (!profile.education || profile.education.length === 0) {
    missingFields.push('Education Details')
    suggestions.push('Add your educational background')
  } else {
    completedFields++
  }

  // Check experience
  if (!profile.experience || profile.experience.length === 0) {
    missingFields.push('Work Experience')
    suggestions.push('Add your professional experience')
  } else {
    completedFields++
  }

  // Check skills
  if (!profile.skills || profile.skills.length === 0) {
    missingFields.push('Skills')
    suggestions.push('Add your technical and professional skills')
  } else {
    completedFields++
  }

  // Check interview preparation
  if (!profile.interviewPreparations || profile.interviewPreparations.length === 0) {
    missingFields.push('Interview Preparation')
    suggestions.push('Set up your interview preparation plan')
  } else {
    completedFields++
  }

  const completionPercentage = Math.round((completedFields / totalFields) * 100)
  const isComplete = completionPercentage >= 80

  // Add general suggestions based on completion level
  if (completionPercentage < 50) {
    suggestions.unshift('Complete your basic profile information first')
  } else if (completionPercentage < 80) {
    suggestions.unshift('Add more details to unlock personalized interview questions')
  }

  return {
    isComplete,
    completionPercentage,
    missingFields,
    suggestions
  }
}

export function getProfileCompletionSteps(profile: IUserProfile | null): Array<{
  step: number
  title: string
  description: string
  completed: boolean
  actionUrl: string
}> {
  const steps = [
    {
      step: 1,
      title: 'Basic Information',
      description: 'Complete your personal details',
      completed: profile ? !!(profile.fullName && profile.phoneNumber && profile.age && profile.city && profile.country) : false,
      actionUrl: '/profile/complete'
    },
    {
      step: 2,
      title: 'Skills & Experience',
      description: 'Add your total experience and key skills',
      completed: profile ? !!(profile.totalExperience !== undefined && profile.skills && profile.skills.length > 0) : false,
      actionUrl: '/profile/complete'
    },
    {
      step: 3,
      title: 'Education Details',
      description: 'Add your educational background',
      completed: profile ? !!(profile.education && profile.education.length > 0) : false,
      actionUrl: '/profile/education/add'
    },
    {
      step: 4,
      title: 'Work Experience',
      description: 'Add your professional experience',
      completed: profile ? !!(profile.experience && profile.experience.length > 0) : false,
      actionUrl: '/profile/experience/add'
    },
    {
      step: 5,
      title: 'Interview Preparation',
      description: 'Set up your interview preparation plan',
      completed: profile ? !!(profile.interviewPreparations && profile.interviewPreparations.length > 0) : false,
      actionUrl: '/profile/interview-prep/add'
    }
  ]

  return steps
}

export function getNextProfileAction(profile: IUserProfile | null): {
  title: string
  description: string
  actionUrl: string
  priority: 'high' | 'medium' | 'low'
} {
  if (!profile) {
    return {
      title: 'Create Your Profile',
      description: 'Get started with personalized interview preparation',
      actionUrl: '/profile/complete',
      priority: 'high'
    }
  }

  const status = checkProfileCompletion(profile)

  if (status.completionPercentage < 50) {
    return {
      title: 'Complete Basic Information',
      description: 'Add your personal details to get started',
      actionUrl: '/profile/complete',
      priority: 'high'
    }
  }

  if (!profile.education || profile.education.length === 0) {
    return {
      title: 'Add Education Details',
      description: 'Include your educational background',
      actionUrl: '/profile/education/add',
      priority: 'high'
    }
  }

  if (!profile.experience || profile.experience.length === 0) {
    return {
      title: 'Add Work Experience',
      description: 'Share your professional background',
      actionUrl: '/profile/experience/add',
      priority: 'high'
    }
  }

  if (!profile.interviewPreparations || profile.interviewPreparations.length === 0) {
    return {
      title: 'Set Up Interview Preparation',
      description: 'Define your target role and company for personalized questions',
      actionUrl: '/profile/interview-prep/add',
      priority: 'medium'
    }
  }

  return {
    title: 'Profile Complete!',
    description: 'Ready for personalized interview preparation',
    actionUrl: '/profile',
    priority: 'low'
  }
}
