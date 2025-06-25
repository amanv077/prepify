import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import InterviewSession from '@/models/InterviewSession'
import { geminiService } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    console.log('=== Question API Called ===')
    
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
    
    console.log('Generating question for level:', currentLevel)
    console.log('Session current level:', interviewSession.currentLevel)
    console.log('Provided level:', providedLevel)
    
    // Update session current level if provided and different
    if (providedLevel && providedLevel !== interviewSession.currentLevel) {
      interviewSession.currentLevel = providedLevel
      console.log('Updated session level to:', providedLevel)
      // Save the updated level immediately
      await interviewSession.save()
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
    
    // Check current level status
    const totalQuestions = currentLevelData.questions.length
    const answeredQuestions = currentLevelData.questions.filter((q: any) => q.answer && q.answer.trim() !== '')
    const questionsWithFeedback = currentLevelData.questions.filter((q: any) => q.feedback && q.feedback.trim() !== '')
    
    console.log(`Level ${currentLevel} status: ${totalQuestions} total questions, ${answeredQuestions.length} answered, ${questionsWithFeedback.length} with feedback`)
    
    // Block if level is truly completed (5 questions with answers and feedback)
    if (totalQuestions >= 5 && answeredQuestions.length >= 5 && questionsWithFeedback.length >= 5) {
      console.log('Level', currentLevel, 'is fully completed')
      return NextResponse.json({ error: 'Current level already completed' }, { status: 400 })
    }
    
    // Block if we already have 5 questions (prevent adding more)
    if (totalQuestions >= 5) {
      console.log('Level', currentLevel, 'already has maximum questions:', totalQuestions)
      return NextResponse.json({ error: 'Maximum questions reached for this level' }, { status: 400 })
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

    // Generate question using Gemini
    console.log('Generating question with context:', context)
    let questionResponse
    try {
      questionResponse = await geminiService.generateQuestion(context)
      console.log('Question generated:', questionResponse)
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
        { error: `Failed to generate question: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Add question to current level (currentLevelData is guaranteed to exist from above)
    currentLevelData.questions.push({
      questionId: questionResponse.questionId,
      question: questionResponse.question,
      answer: '',
      feedback: '',
      score: 0,
      askedAt: new Date()
    })
    console.log('Question added to level data')

    // Add to previous questions
    interviewSession.previousQuestions.push(questionResponse.question)
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

    // Get the updated current level data
    const updatedLevelData = interviewSession.levels.find((l: any) => l.level === currentLevel)
    const currentQuestionIndex = updatedLevelData ? updatedLevelData.questions.length - 1 : 0

    return NextResponse.json({
      success: true,
      question: {
        _id: questionResponse.questionId,
        questionText: questionResponse.question,
        difficulty: interviewSession.difficulty,
        level: currentLevel
      },
      session: {
        ...interviewSession.toObject(),
        currentQuestionIndex
      },
      currentLevel,
      questionNumber: updatedLevelData ? updatedLevelData.questions.length : 1
    })
  } catch (error) {
    console.error('=== Error in Question API ===')
    console.error('Error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to generate question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
