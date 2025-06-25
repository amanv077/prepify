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
    const { interviewId, questionId, answer } = body

    if (!answer || answer.trim().length === 0) {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 })
    }

    // Get interview session
    const interviewSession = await InterviewSession.findOne({
      userId: session.user.id,
      interviewId
    })

    if (!interviewSession) {
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
    }

    // Find the question in current level
    const currentLevel = interviewSession.currentLevel
    const levelData = interviewSession.levels.find((l: any) => l.level === currentLevel)
    
    if (!levelData) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 })
    }

    const questionIndex = levelData.questions.findIndex((q: any) => q.questionId === questionId)
    if (questionIndex === -1) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const question = levelData.questions[questionIndex]

    // Prepare context for feedback generation
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

    // Generate feedback using Gemini
    const feedbackResponse = await geminiService.generateFeedback(
      question.question,
      answer,
      context
    )

    // Update question with answer and feedback
    const levelIndex = interviewSession.levels.findIndex((l: any) => l.level === currentLevel)
    interviewSession.levels[levelIndex].questions[questionIndex].answer = answer
    interviewSession.levels[levelIndex].questions[questionIndex].feedback = feedbackResponse.feedback
    interviewSession.levels[levelIndex].questions[questionIndex].score = feedbackResponse.score
    interviewSession.levels[levelIndex].questions[questionIndex].answeredAt = new Date()

    // Calculate level average score
    const levelQuestions = interviewSession.levels[levelIndex].questions.filter((q: any) => q.score > 0)
    if (levelQuestions.length > 0) {
      const totalScore = levelQuestions.reduce((sum: number, q: any) => sum + q.score, 0)
      interviewSession.levels[levelIndex].averageScore = totalScore / levelQuestions.length
    }

    // Check if level is completed (5 questions answered)
    const answeredQuestions = levelQuestions.length
    let levelCompleted = false
    let canAdvance = false

    if (answeredQuestions >= 5) {
      levelCompleted = true
      interviewSession.levels[levelIndex].completedAt = new Date()
      
      // Check if can advance to next level (average score >= 6)
      const averageScore = interviewSession.levels[levelIndex].averageScore
      if (averageScore >= 6 && currentLevel < interviewSession.totalLevels) {
        canAdvance = true
      } else if (currentLevel >= interviewSession.totalLevels) {
        // Interview completed
        interviewSession.status = 'completed'
        interviewSession.completedAt = new Date()
        
        // Calculate overall score
        const allLevels = interviewSession.levels.filter((l: any) => l.averageScore > 0)
        if (allLevels.length > 0) {
          const totalScore = allLevels.reduce((sum: number, l: any) => sum + l.averageScore, 0)
          interviewSession.overallScore = totalScore / allLevels.length
        }
      }
    }

    await interviewSession.save()

    return NextResponse.json({
      success: true,
      feedback: feedbackResponse.feedback,
      score: feedbackResponse.score,
      suggestions: feedbackResponse.suggestions,
      levelCompleted,
      canAdvance,
      levelAverage: interviewSession.levels[levelIndex].averageScore,
      answeredQuestions,
      totalQuestions: 5,
      interviewCompleted: interviewSession.status === 'completed',
      overallScore: interviewSession.overallScore
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}
