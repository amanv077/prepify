// Migration script to add session numbers to existing interview sessions
const { MongoClient } = require('mongodb')

async function migrateSessions() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables')
    return
  }

  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const collection = db.collection('interviewsessions')
    
    // Get all sessions without sessionNumber, grouped by userId
    const sessions = await collection.find({
      $or: [
        { sessionNumber: { $exists: false } },
        { sessionNumber: null }
      ]
    }).sort({ userId: 1, createdAt: 1 }).toArray()
    
    console.log(`Found ${sessions.length} sessions to migrate`)
    
    // Group sessions by userId
    const sessionsByUser = {}
    sessions.forEach(session => {
      const userId = session.userId.toString()
      if (!sessionsByUser[userId]) {
        sessionsByUser[userId] = []
      }
      sessionsByUser[userId].push(session)
    })
    
    // Update each user's sessions with sequential numbers
    for (const [userId, userSessions] of Object.entries(sessionsByUser)) {
      console.log(`Migrating ${userSessions.length} sessions for user ${userId}`)
      
      for (let i = 0; i < userSessions.length; i++) {
        const session = userSessions[i]
        const sessionNumber = i + 1
        const sessionTitle = `Interview Session #${sessionNumber}`
        
        await collection.updateOne(
          { _id: session._id },
          {
            $set: {
              sessionNumber: sessionNumber,
              sessionTitle: sessionTitle
            }
          }
        )
        
        console.log(`Updated session ${session._id} with number ${sessionNumber}`)
      }
    }
    
    console.log('Migration completed successfully')
    
  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await client.close()
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateSessions()
}

module.exports = { migrateSessions }
