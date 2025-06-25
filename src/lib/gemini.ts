import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrpfcpprdpV2nzVw-NyZsgRO1C1ncAQe8')

export interface InterviewContext {
  jobTitle: string
  company: string
  industry: string
  experience: string
  skills: string[]
  focusAreas: string[]
  currentLevel: number
  totalLevels: number
  difficulty: 'starter' | 'easy' | 'medium' | 'hard' | 'excellent'
  previousQuestions: string[]
}

export interface QuestionResponse {
  question: string
  questionId: string
}

export interface FeedbackResponse {
  feedback: string
  score: number
  suggestions: string[]
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  private getDifficultyDescription(difficulty: string): string {
    const descriptions = {
      starter: 'basic introductory level suitable for entry-level positions',
      easy: 'fundamental level with simple technical concepts',
      medium: 'intermediate level requiring solid understanding',
      hard: 'advanced level with complex problem-solving',
      excellent: 'expert level with sophisticated technical challenges'
    }
    return descriptions[difficulty as keyof typeof descriptions] || descriptions.medium
  }

  private generateQuestionPrompt(context: InterviewContext): string {
    const difficultyDesc = this.getDifficultyDescription(context.difficulty)
    const previousQuestionsText = context.previousQuestions.length > 0 
      ? `\n\nPreviously asked questions to avoid repetition:\n${context.previousQuestions.map(q => `- ${q}`).join('\n')}`
      : ''

    return `You are an expert technical interviewer conducting a ${difficultyDesc} interview for a ${context.jobTitle} position at ${context.company} in the ${context.industry} industry.

Interview Context:
- Candidate Experience: ${context.experience}
- Key Skills: ${context.skills.join(', ')}
- Focus Areas: ${context.focusAreas.join(', ')}
- Current Level: ${context.currentLevel} of ${context.totalLevels}
- Difficulty: ${context.difficulty}

${previousQuestionsText}

Generate ONE interview question that:
1. Matches the ${difficultyDesc} difficulty level
2. Is relevant to the ${context.jobTitle} role and ${context.industry} industry
3. Tests knowledge in one of these areas: ${context.skills.join(', ')}
4. Is appropriate for level ${context.currentLevel} of ${context.totalLevels}
5. Has NOT been asked before (avoid any similarity to previous questions)
6. Is clear, specific, and actionable

For level ${context.currentLevel}:
${context.currentLevel === 1 ? '- Focus on fundamental concepts and basic understanding' : 
  context.currentLevel === 2 ? '- Include practical application scenarios' :
  context.currentLevel === 3 ? '- Require analytical thinking and problem-solving' :
  context.currentLevel === 4 ? '- Test advanced concepts and system design' :
  '- Challenge with expert-level architecture and optimization'}

Response format:
{
  "question": "Your interview question here",
  "questionId": "unique-id-for-this-question"
}

Provide only the JSON response, no additional text.`
  }

  private generateFeedbackPrompt(question: string, answer: string, context: InterviewContext): string {
    const difficultyDesc = this.getDifficultyDescription(context.difficulty)

    return `You are an expert technical interviewer providing feedback on a candidate's answer for a ${context.jobTitle} position.

Question Asked: "${question}"
Candidate's Answer: "${answer}"

Interview Context:
- Position: ${context.jobTitle} at ${context.company}
- Industry: ${context.industry}
- Candidate Experience: ${context.experience}
- Difficulty Level: ${difficultyDesc}
- Current Level: ${context.currentLevel} of ${context.totalLevels}

Evaluate the answer and provide:
1. Constructive feedback (2-3 sentences)
2. A score from 1-10 (considering the difficulty level and candidate experience)
3. 2-3 specific improvement suggestions

Scoring Guidelines for ${context.difficulty} level:
- 1-3: Poor understanding, major gaps in knowledge
- 4-5: Basic understanding but missing key points
- 6-7: Good understanding with minor improvements needed
- 8-9: Strong answer demonstrating solid expertise
- 10: Exceptional answer showing deep mastery

Response format:
{
  "feedback": "Your detailed feedback here",
  "score": 7,
  "suggestions": [
    "First improvement suggestion",
    "Second improvement suggestion",
    "Third improvement suggestion"
  ]
}

Provide only the JSON response, no additional text.`
  }

  async generateQuestion(context: InterviewContext): Promise<QuestionResponse> {
    try {
      const prompt = this.generateQuestionPrompt(context)
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      return {
        question: parsed.question,
        questionId: parsed.questionId || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch (error) {
      console.error('Error generating question:', error)
      throw new Error('Failed to generate interview question')
    }
  }

  async generateFeedback(question: string, answer: string, context: InterviewContext): Promise<FeedbackResponse> {
    try {
      const prompt = this.generateFeedbackPrompt(question, answer, context)
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      return {
        feedback: parsed.feedback,
        score: Math.max(1, Math.min(10, parsed.score)), // Ensure score is between 1-10
        suggestions: parsed.suggestions || []
      }
    } catch (error) {
      console.error('Error generating feedback:', error)
      throw new Error('Failed to generate feedback')
    }
  }
}

export const geminiService = new GeminiService()
