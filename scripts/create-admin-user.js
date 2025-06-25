const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB connection
const MONGODB_URI = "mongodb+srv://amantech0707:teP5ZX9mWUl2Us82@cluster0.oytuqyz.mongodb.net/prepify_db?retryWrites=true&w=majority"

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  emailVerified: Date,
  password: String,
  image: String,
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'AGENT'],
    default: 'USER'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'users'
})

const User = mongoose.model('User', UserSchema)

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' })
    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('amanaman', 12)

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      isActive: true
    })

    await adminUser.save()
    console.log('Admin user created successfully!')
    console.log('Email: admin@gmail.com')
    console.log('Password: amanaman')

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

createAdminUser()
