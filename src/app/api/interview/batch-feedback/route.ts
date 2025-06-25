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
    const { interviewId, levelNumber, questionsAndAnswers } = body

    console.log('Processing batch feedback for level:', levelNumber, 'questions:', questionsAndAnswers.length)

    if (!questionsAndAnswers || questionsAndAnswers.length === 0) {
      return NextResponse.json({ error: 'No questions and answers provided' }, { status: 400 })
    }

    // Get interview session
    const interviewSession = await InterviewSession.findOne({
      userId: session.user.id,
      interviewId
    })

    if (!interviewSession) {
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
    }

    // Prepare context for feedback generation
    const context = {
      jobTitle: interviewSession.preparationData.jobTitle || 'Software Developer',
      company: interviewSession.preparationData.company || 'Tech Company',
      industry: interviewSession.preparationData.industry || 'Technology',
      experience: interviewSession.preparationData.experience || 'Mid-level',
      skills: interviewSession.preparationData.skills || [],
      focusAreas: interviewSession.preparationData.focusAreas || [],
      currentLevel: levelNumber,
      totalLevels: 5,
      difficulty: interviewSession.difficulty,
      previousQuestions: interviewSession.previousQuestions || []
    }

    // Generate batch feedback using Gemini (single API call for all 5 questions)
    const batchFeedbackResponse = await geminiService.generateBatchFeedback(
      questionsAndAnswers,
      context
    )

    // Find the level in the interview session
    const levelIndex = interviewSession.levels.findIndex((l: any) => l.level === levelNumber)
    if (levelIndex === -1) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 })
    }

    // Update all questions in the level with feedback
    let totalScore = 0
    batchFeedbackResponse.results.forEach((result, index) => {
      if (interviewSession.levels[levelIndex].questions[index]) {
        interviewSession.levels[levelIndex].questions[index].feedback = result.feedback
        interviewSession.levels[levelIndex].questions[index].score = result.score
        interviewSession.levels[levelIndex].questions[index].correctAnswer = result.correctAnswer
        interviewSession.levels[levelIndex].questions[index].suggestions = result.suggestions
        interviewSession.levels[levelIndex].questions[index].topicsToRevise = result.topicsToRevise
        interviewSession.levels[levelIndex].questions[index].answeredAt = new Date()
        totalScore += result.score
      }
    })

    // Calculate level average score
    const averageScore = totalScore / questionsAndAnswers.length
    interviewSession.levels[levelIndex].averageScore = averageScore
    interviewSession.levels[levelIndex].completedAt = new Date()

    // Check if can advance to next level (average score >= 6)
    let canAdvance = false
    let interviewCompleted = false

    if (averageScore >= 6 && levelNumber < 5) {
      canAdvance = true
      // Advance to next level
      interviewSession.currentLevel = levelNumber + 1
    } else if (levelNumber >= 5) {
      // Interview completed
      interviewSession.status = 'completed'
      interviewSession.completedAt = new Date()
      interviewCompleted = true
      
      // Calculate overall score
      const allLevels = interviewSession.levels.filter((l: any) => l.averageScore > 0)
      if (allLevels.length > 0) {
        const totalScore = allLevels.reduce((sum: number, l: any) => sum + l.averageScore, 0)
        interviewSession.overallScore = totalScore / allLevels.length
      }
    }

    await interviewSession.save()

    return NextResponse.json({
      success: true,
      feedback: batchFeedbackResponse.results,
      overallTopicsToRevise: batchFeedbackResponse.overallTopicsToRevise,
      levelAverage: averageScore,
      canAdvance,
      interviewCompleted,
      nextLevel: canAdvance ? levelNumber + 1 : null,
      overallScore: interviewSession.overallScore,
      session: interviewSession.toObject()
    })
  } catch (error) {
    console.error('Error processing batch feedback:', error)
    return NextResponse.json(
      { error: 'Failed to process batch feedback' },
      { status: 500 }
    )
  }
}
