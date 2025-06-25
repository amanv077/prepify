import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import InterviewSession from '@/models/InterviewSession'
import { geminiService } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const body = await req.json()
    const { interviewId } = body

    // Get interview session
    const interviewSession = await InterviewSession.findOne({
      userId: session.user.id,
      interviewId
    })

    if (!interviewSession) {
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
    }

    // Check if current level is completed
    const currentLevel = interviewSession.currentLevel
    const currentLevelData = interviewSession.levels.find((l: any) => l.level === currentLevel)
    
    if (currentLevelData && currentLevelData.questions.length >= 5) {
      return NextResponse.json({ error: 'Current level already completed' }, { status: 400 })
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
    const questionResponse = await geminiService.generateQuestion(context)

    // Initialize level if not exists
    if (!currentLevelData) {
      interviewSession.levels.push({
        level: currentLevel,
        questions: [],
        averageScore: 0
      })
    }

    // Add question to current level
    const levelIndex = interviewSession.levels.findIndex((l: any) => l.level === currentLevel)
    if (levelIndex === -1) {
      interviewSession.levels.push({
        level: currentLevel,
        questions: [{
          questionId: questionResponse.questionId,
          question: questionResponse.question,
          answer: '',
          feedback: '',
          score: 0,
          askedAt: new Date()
        }],
        averageScore: 0
      })
    } else {
      interviewSession.levels[levelIndex].questions.push({
        questionId: questionResponse.questionId,
        question: questionResponse.question,
        answer: '',
        feedback: '',
        score: 0,
        askedAt: new Date()
      })
    }

    // Add to previous questions
    interviewSession.previousQuestions.push(questionResponse.question)
    interviewSession.status = 'in-progress'

    await interviewSession.save()

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
    console.error('Error generating question:', error)
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    )
  }
}
