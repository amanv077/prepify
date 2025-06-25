// Clear Interview Sessions Debug Script
// Run this if you need to reset interview sessions for testing

import connectToDatabase from '../lib/mongodb.js'
import InterviewSession from '../models/InterviewSession.js'

async function clearInterviewSessions() {
  try {
    await connectToDatabase()
    
    // Find all interview sessions
    const sessions = await InterviewSession.find({})
    console.log('Found', sessions.length, 'interview sessions')
    
    // Log session details
    sessions.forEach(session => {
      console.log(`Session ${session.interviewId}:`)
      console.log(`  Current Level: ${session.currentLevel}`)
      console.log(`  Levels:`, session.levels.map(l => `L${l.level}(${l.questions.length}q)`).join(', '))
    })
    
    // Uncomment the next line to actually delete sessions
    // const result = await InterviewSession.deleteMany({})
    // console.log('Deleted', result.deletedCount, 'sessions')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Uncomment to run
// clearInterviewSessions()
