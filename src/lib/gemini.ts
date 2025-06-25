import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error('Gemini API key not found in environment variables. Please set GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY.')
}

const genAI = new GoogleGenerativeAI(apiKey)

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
  correctAnswer: string
  topicsToRevise: string[]
}

export interface BatchFeedbackResponse {
  results: Array<{
    questionIndex: number
    feedback: string
    score: number
    suggestions: string[]
    correctAnswer: string
    topicsToRevise: string[]
  }>
  overallTopicsToRevise: string[]
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  private getDifficultyDescription(difficulty: string): string {
    const descriptions = {
      starter: 'entry-level',
      easy: 'basic',
      medium: 'intermediate',
      hard: 'advanced',
      excellent: 'expert'
    }
    return descriptions[difficulty as keyof typeof descriptions] || descriptions.medium
  }

  private generateQuestionPrompt(context: InterviewContext): string {
    const difficultyDesc = this.getDifficultyDescription(context.difficulty)
    const skillsText = context.skills.slice(0, 3).join(', ') // Limit to top 3 skills
    const prevQuestionsText = context.previousQuestions.length > 0 
      ? `Avoid: ${context.previousQuestions.slice(-3).join('; ')}` // Only last 3 questions
      : ''

    return `Interview for ${context.jobTitle} at ${context.company}. Level ${context.currentLevel}/5 (${difficultyDesc}).
Skills: ${skillsText}. Experience: ${context.experience}.
${prevQuestionsText}

Generate ONE ${difficultyDesc} question for level ${context.currentLevel}:
${context.currentLevel === 1 ? 'Basic concepts' : 
  context.currentLevel === 2 ? 'Practical application' :
  context.currentLevel === 3 ? 'Problem-solving' :
  context.currentLevel === 4 ? 'System design' :
  'Architecture/optimization'}

Return JSON: {"question":"...","questionId":"q${Date.now()}"}`
  }

  private generateFeedbackPrompt(question: string, answer: string, context: InterviewContext): string {
    const difficultyDesc = this.getDifficultyDescription(context.difficulty)

    return `You are an expert technical interviewer providing comprehensive feedback for a ${context.jobTitle} position.

Question: "${question}"
Candidate's Answer: "${answer}"

Context:
- Position: ${context.jobTitle} at ${context.company}
- Experience: ${context.experience}
- Difficulty: ${difficultyDesc} (Level ${context.currentLevel}/5)

Provide:
1. Constructive feedback (2-3 sentences)
2. Score 1-10 (based on difficulty and experience level)
3. Correct/ideal answer (concise but complete)
4. 2-3 specific improvement suggestions
5. 2-4 topics to revise/study

Scoring for ${context.difficulty}:
- 1-3: Poor understanding, major gaps
- 4-5: Basic understanding, missing key points
- 6-7: Good understanding, minor improvements needed
- 8-9: Strong answer, solid expertise
- 10: Exceptional answer, deep mastery

JSON format:
{
  "feedback": "Your detailed feedback here",
  "score": 7,
  "correctAnswer": "The ideal answer would be...",
  "suggestions": [
    "First improvement suggestion",
    "Second improvement suggestion"
  ],
  "topicsToRevise": [
    "Topic 1",
    "Topic 2",
    "Topic 3"
  ]
}

Only JSON response, no additional text.`
  }

  private generateBatchFeedbackPrompt(questionsAndAnswers: Array<{question: string, answer: string}>, context: InterviewContext): string {
    const difficultyDesc = this.getDifficultyDescription(context.difficulty)
    const qaText = questionsAndAnswers.map((qa, index) => 
      `Question ${index + 1}: "${qa.question}"\nAnswer ${index + 1}: "${qa.answer}"`
    ).join('\n\n')

    return `You are an expert technical interviewer evaluating ${questionsAndAnswers.length} questions for a ${context.jobTitle} position.

${qaText}

Context:
- Position: ${context.jobTitle} at ${context.company}
- Experience: ${context.experience}
- Difficulty: ${difficultyDesc} (Level ${context.currentLevel}/5)

For EACH question, provide:
1. Feedback (1-2 sentences)
2. Score 1-10
3. Correct answer (concise)
4. 1-2 improvement suggestions
5. 1-2 topics to revise

Also provide overall topics to revise for this level.

JSON format:
{
  "results": [
    {
      "questionIndex": 0,
      "feedback": "Feedback for Q1",
      "score": 7,
      "correctAnswer": "Correct answer for Q1",
      "suggestions": ["Suggestion 1", "Suggestion 2"],
      "topicsToRevise": ["Topic 1", "Topic 2"]
    }
  ],
  "overallTopicsToRevise": ["Overall topic 1", "Overall topic 2"]
}

Only JSON response.`
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
    } catch (error: any) {
      console.error('Error generating question:', error)
      
      // Check if it's a rate limiting error
      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate limit')) {
        // Return a fallback question for rate limiting
        return this.getFallbackQuestion(context)
      }
      
      // Check if it's a network/API error
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        return this.getFallbackQuestion(context)
      }
      
      throw new Error(`Failed to generate interview question: ${error.message}`)
    }
  }

  private getFallbackQuestion(context: InterviewContext): QuestionResponse {
    const fallbackQuestions = {
      1: [
        "Can you tell me about yourself and your experience with web development?",
        "What interests you most about frontend development?",
        "How do you stay updated with the latest web technologies?",
        "Can you explain the difference between HTML, CSS, and JavaScript?",
        "What is your experience with version control systems like Git?"
      ],
      2: [
        "Explain the concept of responsive web design and how you implement it.",
        "What are the key differences between React class components and functional components?",
        "How do you handle state management in React applications?",
        "Can you explain the CSS box model?",
        "What is the Virtual DOM and how does it work in React?"
      ],
      3: [
        "How would you optimize the performance of a React application?",
        "Explain the concept of hoisting in JavaScript.",
        "What are React Hooks and how do they work?",
        "How do you handle API calls in React applications?",
        "Can you explain the difference between synchronous and asynchronous JavaScript?"
      ],
      4: [
        "Design a scalable architecture for a large React application.",
        "How would you implement authentication in a Next.js application?",
        "Explain the differences between server-side rendering and client-side rendering.",
        "How do you handle error boundaries in React?",
        "What are some advanced React patterns you've used?"
      ],
      5: [
        "How would you approach performance optimization for a complex web application?",
        "Design a system for handling real-time data updates in a React application.",
        "Explain your approach to testing React components and applications.",
        "How would you implement a custom React Hook for complex state management?",
        "Describe your approach to code splitting and lazy loading in large applications."
      ]
    }

    const levelQuestions = fallbackQuestions[context.currentLevel as keyof typeof fallbackQuestions] || fallbackQuestions[1]
    const randomQuestion = levelQuestions[Math.floor(Math.random() * levelQuestions.length)]
    
    console.log(`Using fallback question for level ${context.currentLevel}: ${randomQuestion}`)
    
    return {
      question: randomQuestion,
      questionId: `fallback_q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
        suggestions: parsed.suggestions || [],
        correctAnswer: parsed.correctAnswer || 'No correct answer provided',
        topicsToRevise: parsed.topicsToRevise || []
      }
    } catch (error: any) {
      console.error('Error generating feedback:', error)
      
      // Check if it's a rate limiting error or API error
      if (error.message?.includes('429') || error.message?.includes('quota') || 
          error.message?.includes('rate limit') || error.message?.includes('fetch')) {
        return this.getFallbackFeedback(question, answer, context)
      }
      
      throw new Error(`Failed to generate feedback: ${error.message}`)
    }
  }

  private getFallbackFeedback(question: string, answer: string, context: InterviewContext): FeedbackResponse {
    // Simple fallback feedback based on answer length and content
    const answerLength = answer.trim().length
    let score = 5 // Default middle score
    let feedback = "Thank you for your response. "
    
    if (answerLength === 0) {
      score = 1
      feedback += "Please provide an answer to continue with the interview."
    } else if (answerLength < 50) {
      score = 3
      feedback += "Your answer is quite brief. Try to provide more detailed explanations with examples."
    } else if (answerLength < 200) {
      score = 6
      feedback += "Good response! Consider adding more specific details or examples to strengthen your answer."
    } else {
      score = 7
      feedback += "Comprehensive response! You've provided good detail in your answer."
    }
    
    // Add level-specific suggestions
    const suggestions = this.getFallbackSuggestions(context.currentLevel)
    const topicsToRevise = this.getFallbackTopics(context.currentLevel)
    
    console.log(`Using fallback feedback for level ${context.currentLevel}`)
    
    return {
      feedback,
      score,
      suggestions,
      correctAnswer: "Please refer to documentation and best practices for detailed answers.",
      topicsToRevise
    }
  }

  private getFallbackSuggestions(level: number): string[] {
    const suggestions = {
      1: [
        "Practice explaining basic concepts clearly",
        "Review fundamental web development principles",
        "Prepare examples from your experience"
      ],
      2: [
        "Study React component lifecycle and hooks",
        "Practice explaining technical concepts with examples",
        "Review CSS and responsive design principles"
      ],
      3: [
        "Focus on performance optimization techniques",
        "Practice problem-solving approaches",
        "Review advanced JavaScript concepts"
      ],
      4: [
        "Study system design principles",
        "Practice architectural decision explanations",
        "Review advanced React patterns"
      ],
      5: [
        "Focus on scalability and best practices",
        "Practice leading technical discussions",
        "Review industry standards and methodologies"
      ]
    }
    
    return suggestions[level as keyof typeof suggestions] || suggestions[1]
  }

  private getFallbackTopics(level: number): string[] {
    const topics = {
      1: ["HTML basics", "CSS fundamentals", "JavaScript basics", "Git version control"],
      2: ["React components", "State management", "CSS Grid/Flexbox", "API integration"],
      3: ["React Hooks", "Performance optimization", "Async JavaScript", "Testing"],
      4: ["System architecture", "Authentication", "SSR vs CSR", "Error handling"],
      5: ["Scalability", "Advanced patterns", "Team leadership", "Code quality"]
    }
    
    return topics[level as keyof typeof topics] || topics[1]
  }

  async generateBatchFeedback(questionsAndAnswers: Array<{question: string, answer: string}>, context: InterviewContext): Promise<BatchFeedbackResponse> {
    try {
      const prompt = this.generateBatchFeedbackPrompt(questionsAndAnswers, context)
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      // Ensure all results have proper structure
      const results = parsed.results.map((result: any, index: number) => ({
        questionIndex: index,
        feedback: result.feedback || 'No feedback provided',
        score: Math.max(1, Math.min(10, result.score || 5)),
        correctAnswer: result.correctAnswer || 'No correct answer provided',
        suggestions: result.suggestions || [],
        topicsToRevise: result.topicsToRevise || []
      }))
      
      return {
        results,
        overallTopicsToRevise: parsed.overallTopicsToRevise || []
      }
    } catch (error) {
      console.error('Error generating batch feedback:', error)
      throw new Error('Failed to generate batch feedback')
    }
  }
}

export const geminiService = new GeminiService()
