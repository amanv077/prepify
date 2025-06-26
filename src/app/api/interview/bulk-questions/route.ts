import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import InterviewSession from '@/models/InterviewSession'
import { geminiService } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    console.log('=== Bulk Questions API Called ===')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.error('No session or user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('User authenticated:', session.user.id)

    await connectToDatabase()
    console.log('Database connected')
    
    const body = await req.json()
    const { interviewId, currentLevel: providedLevel } = body
    console.log('Request body:', { interviewId, providedLevel })

    // Get interview session
    const interviewSession = await InterviewSession.findOne({
      userId: session.user.id,
      interviewId
    })

    if (!interviewSession) {
      console.error('Interview session not found for user:', session.user.id, 'interviewId:', interviewId)
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
    }
    console.log('Interview session found:', interviewSession._id)

    // Use provided level or fall back to session level
    const currentLevel = providedLevel || interviewSession.currentLevel
    
    console.log('Generating bulk questions for level:', currentLevel)
    
    // Update session current level if provided and different
    if (providedLevel && providedLevel !== interviewSession.currentLevel) {
      interviewSession.currentLevel = providedLevel
      console.log('Updated session level to:', providedLevel)
    }
    
    // Find existing level data
    let currentLevelData = interviewSession.levels.find((l: any) => l.level === currentLevel)
    
    // If this is a new level that doesn't exist yet, create it
    if (!currentLevelData) {
      currentLevelData = {
        level: currentLevel,
        questions: [],
        averageScore: 0
      }
      interviewSession.levels.push(currentLevelData)
      console.log('Created new level:', currentLevel)
    }
    
    // Check if level already has questions
    if (currentLevelData.questions.length > 0) {
      console.log('Level already has questions, returning existing questions')
      return NextResponse.json({
        success: true,
        questions: currentLevelData.questions.map((q: any, index: number) => ({
          _id: q.questionId || `q${currentLevel}_${index}`,
          questionText: q.question,
          difficulty: interviewSession.difficulty,
          level: currentLevel,
          answer: q.answer || '',
          feedback: q.feedback || '',
          score: q.score || 0
        })),
        session: interviewSession.toObject(),
        currentLevel
      })
    }

    // Prepare context for Gemini
    const context = {
      jobTitle: interviewSession.preparationData.jobTitle || 'Software Developer',
      company: interviewSession.preparationData.company || 'Tech Company',
      industry: interviewSession.preparationData.industry || 'Technology',
      experience: interviewSession.preparationData.experience || 'Mid-level',
      skills: interviewSession.preparationData.skills || [],
      focusAreas: interviewSession.preparationData.focusAreas || [],
      currentLevel: currentLevel,
      totalLevels: interviewSession.totalLevels,
      difficulty: interviewSession.difficulty,
      previousQuestions: interviewSession.previousQuestions || []
    }

    // Generate 5 questions using Gemini
    console.log('Generating 5 questions with context:', context)
    let bulkQuestionsResponse
    try {
      bulkQuestionsResponse = await geminiService.generateBulkQuestions(context, 5)
      console.log('Bulk questions generated:', bulkQuestionsResponse)
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError)
      
      // Check if it's a rate limiting error
      if (geminiError instanceof Error && 
          (geminiError.message.includes('429') || 
           geminiError.message.includes('quota') || 
           geminiError.message.includes('rate limit'))) {
        return NextResponse.json(
          { 
            error: 'API rate limit exceeded. Please try again in a few minutes.',
            details: 'The AI service is temporarily unavailable due to usage limits.',
            retryAfter: 60 // seconds
          },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: `Failed to generate questions: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Add questions to current level
    const questions = bulkQuestionsResponse.questions.map((q: any, index: number) => ({
      questionId: q.questionId || `q${currentLevel}_${index}_${Date.now()}`,
      question: q.question,
      answer: '',
      feedback: '',
      score: 0,
      askedAt: new Date()
    }))

    currentLevelData.questions = questions
    console.log('Questions added to level data')

    // Add all questions to previous questions (for context in next levels)
    interviewSession.previousQuestions.push(...bulkQuestionsResponse.questions.map((q: any) => q.question))
    interviewSession.status = 'in-progress'

    console.log('Saving interview session...')
    try {
      await interviewSession.save()
      console.log('Interview session saved successfully')
    } catch (saveError) {
      console.error('Error saving interview session:', saveError)
      return NextResponse.json(
        { error: `Failed to save interview session: ${saveError instanceof Error ? saveError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Return formatted questions
    const formattedQuestions = questions.map((q: any) => ({
      _id: q.questionId,
      questionText: q.question,
      difficulty: interviewSession.difficulty,
      level: currentLevel,
      answer: '',
      feedback: '',
      score: 0
    }))

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      session: interviewSession.toObject(),
      currentLevel,
      totalQuestions: questions.length
    })
  } catch (error) {
    console.error('=== Error in Bulk Questions API ===')
    console.error('Error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to generate bulk questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
