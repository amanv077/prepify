import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { geminiService } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test basic Gemini API functionality
    const testContext = {
      jobTitle: 'Test Developer',
      company: 'Test Company',
      industry: 'Technology',
      experience: '1-3 years',
      skills: ['JavaScript'],
      focusAreas: ['JavaScript'],
      currentLevel: 1,
      totalLevels: 5,
      difficulty: 'starter' as const,
      previousQuestions: []
    }

    try {
      const testQuestion = await geminiService.generateQuestion(testContext)
      
      return NextResponse.json({
        success: true,
        message: 'Gemini API is working correctly',
        testQuestion: testQuestion.question,
        quotaInfo: 'API call successful'
      })
    } catch (error: any) {
      console.error('Gemini test error:', error)
      
      let isRateLimit = false
      let isApiKeyInvalid = false
      let errorMessage = 'Unknown error'

      if (error.message) {
        isRateLimit = error.message.includes('429') || 
                     error.message.includes('quota') || 
                     error.message.includes('rate limit')
        
        isApiKeyInvalid = error.message.includes('API_KEY') || 
                         error.message.includes('invalid') ||
                         error.message.includes('401') ||
                         error.message.includes('unauthorized')
        
        errorMessage = error.message
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        isRateLimit,
        isApiKeyInvalid,
        rawError: error.toString()
      })
    }
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to run diagnostic test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
