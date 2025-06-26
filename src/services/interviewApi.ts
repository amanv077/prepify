import { InterviewSession, Question } from '@/types/interview'

export class InterviewApiService {
  /**
   * Fetch interview sessions
   */
  static async fetchInterviewSessions(): Promise<{ sessions: InterviewSession[] }> {
    const response = await fetch('/api/interview')
    if (!response.ok) {
      throw new Error(`Failed to fetch interviews: ${response.status}`)
    }
    return response.json()
  }

  /**
   * Generate next question for interview
   */
  static async generateQuestion(interviewId: string, currentLevel: number): Promise<{
    question: Question
    session: InterviewSession
    currentLevel: number
    questionNumber: number
  }> {
    const response = await fetch('/api/interview/question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interviewId,
        currentLevel,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to generate question: ${errorData}`)
    }

    return response.json()
  }

  /**
   * Generate bulk questions for a level (optimized approach)
   */
  static async generateBulkQuestions(interviewId: string, currentLevel: number): Promise<{
    questions: Question[]
    session: InterviewSession
    currentLevel: number
    totalQuestions: number
  }> {
    const response = await fetch('/api/interview/bulk-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interviewId,
        currentLevel,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to generate bulk questions: ${errorData}`)
    }

    return response.json()
  }

  /**
   * Process batch feedback for all questions in a level
   */
  static async processBatchFeedback(
    interviewId: string, 
    levelNumber: number, 
    questionsAndAnswers: Array<{ question: string; answer: string }>
  ): Promise<{
    feedback: Array<{
      feedback: string
      score: number
      correctAnswer: string
      suggestions: string[]
      topicsToRevise: string[]
    }>
    overallTopicsToRevise: string[]
    levelAverage: number
    canAdvance: boolean
    interviewCompleted: boolean
    nextLevel: number | null
    overallScore: number
    session: InterviewSession
  }> {
    const response = await fetch('/api/interview/batch-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interviewId,
        levelNumber,
        questionsAndAnswers
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to process batch feedback: ${errorData}`)
    }

    return response.json()
  }

  /**
   * Submit answer for a question (local storage, no API call)
   */
  static submitAnswerLocally(
    questions: Question[], 
    questionId: string, 
    answer: string
  ): Question[] {
    return questions.map(q => 
      q._id === questionId 
        ? { ...q, answer, answeredAt: new Date() }
        : q
    )
  }
}
