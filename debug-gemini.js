// Debug script to check Gemini API setup
console.log('=== Gemini API Debug ===')
console.log('GOOGLE_GEMINI_API_KEY exists:', !!process.env.GOOGLE_GEMINI_API_KEY)
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
if (apiKey) {
  console.log('API Key found, length:', apiKey.length)
  console.log('API Key prefix:', apiKey.substring(0, 10) + '...')
} else {
  console.log('No API Key found!')
}

async function testGeminiConnection() {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const result = await model.generateContent('Say hello')
    console.log('Gemini test successful:', result.response.text())
  } catch (error) {
    console.error('Gemini test failed:', error.message)
  }
}

if (apiKey) {
  testGeminiConnection()
}
