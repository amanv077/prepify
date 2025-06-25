import { Question, InterviewSession, CurrentLevelData } from '@/types/interview'

/**
 * Transform interview session data from API response to frontend format
 */
export function transformInterviewSession(session: any): InterviewSession {
  return {
    ...session,
    levels: session.levels.map((level: any) => ({
      ...level,
      questions: level.questions.map((q: any) => ({
        _id: q.questionId || q._id,
        questionText: q.question || q.questionText,
        difficulty: q.difficulty || 'starter',
        level: q.level || level.level,
        answer: q.answer,
        feedback: q.feedback,
        score: q.score,
        suggestions: q.suggestions || [],
        correctAnswer: q.correctAnswer,
        topicsToRevise: q.topicsToRevise || [],
        answeredAt: q.answeredAt
      }))
    }))
  }
}

/**
 * Calculate the current question number for display
 */
export function getCurrentQuestionNumber(
  currentQuestion: Question | null, 
  currentLevelData: CurrentLevelData
): number {
  if (currentQuestion) {
    const questionIndex = currentLevelData.questions.findIndex(q => q._id === currentQuestion._id)
    return questionIndex >= 0 ? questionIndex + 1 : currentLevelData.questions.length + 1
  }
  return currentLevelData.questions.length + 1
}

/**
 * Calculate progress percentage for overall interview
 */
export function calculateProgressPercentage(
  currentLevelNumber: number, 
  answeredQuestionsInLevel: number
): number {
  return ((currentLevelNumber - 1) * 5 + answeredQuestionsInLevel) / 25 * 100
}

/**
 * Get the first unanswered question in current level
 */
export function getFirstUnansweredQuestion(questions: Question[]): Question | null {
  return questions.find(q => !q.answer || q.answer.trim() === '') || null
}

/**
 * Check if all questions in level have answers
 */
export function areAllQuestionsAnswered(questions: Question[]): boolean {
  return questions.length === 5 && questions.every(q => q.answer && q.answer.trim() !== '')
}

/**
 * Check if all questions in level have feedback
 */
export function doAllQuestionsHaveFeedback(questions: Question[]): boolean {
  return questions.length === 5 && questions.every(q => q.feedback && q.feedback.trim() !== '')
}

/**
 * Get difficulty label by level number
 */
export function getDifficultyLabel(levelNumber: number): string {
  const levelDifficulties = ['Starter', 'Easy', 'Medium', 'Hard', 'Excellent']
  return levelDifficulties[levelNumber - 1] || 'Starter'
}

/**
 * Count answered questions in current level
 */
export function getAnsweredQuestionsCount(questions: Question[]): number {
  return questions.filter(q => q.answer && q.answer.trim() !== '').length
}

/**
 * Calculate average score for a set of questions
 */
export function calculateAverageScore(questions: Question[]): number {
  const questionsWithScores = questions.filter(q => q.score !== undefined)
  if (questionsWithScores.length === 0) return 0
  
  const totalScore = questionsWithScores.reduce((sum, q) => sum + (q.score || 0), 0)
  return totalScore / questionsWithScores.length
}

/**
 * Initialize current level data structure
 */
export function initializeCurrentLevelData(levelNumber: number): CurrentLevelData {
  return {
    levelNumber,
    difficulty: getDifficultyLabel(levelNumber),
    questions: [],
    currentQuestionIndex: 0,
    overallTopicsToRevise: []
  }
}
