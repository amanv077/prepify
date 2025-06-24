const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB connection
const MONGODB_URL = "mongodb+srv://amantech0707:teP5ZX9mWUl2Us82@cluster0.oytuqyz.mongodb.net/prepify_db?retryWrites=true&w=majority"

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return mongoose.connections[0]
  }

  try {
    const conn = await mongoose.connect(MONGODB_URL, {
      bufferCommands: false,
    })
    return conn
  } catch (error) {
    throw error
  }
}

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  emailVerified: {
    type: Date,
    required: false
  },
  password: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
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

const User = mongoose.models.User || mongoose.model('User', UserSchema)

// Admin Configuration - Edit these values to create different admin users
// To create a new admin: 
// 1. Change the email to a unique value
// 2. Update name and password as needed
// 3. Run: npm run seed:admin
const ADMIN_CONFIG = {
  name: 'System Administrator',
  email: 'admin@prepify.com',
  password: 'Admin@123456',
  role: 'ADMIN'
}

const createAdminUser = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await connectDB()
    
    console.log('👤 Creating admin user...')
    console.log('   Email:', ADMIN_CONFIG.email)
    console.log('   Name:', ADMIN_CONFIG.name)

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_CONFIG.email })
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists!')
      console.log('👤 Existing Admin Details:')
      console.log('   Email:', existingAdmin.email)
      console.log('   Name:', existingAdmin.name)
      console.log('   Role:', existingAdmin.role)
      console.log('   Status:', existingAdmin.isActive ? 'Active' : 'Inactive')
      console.log('   Email Verified:', existingAdmin.emailVerified ? 'Yes' : 'No')
      console.log('   Created:', existingAdmin.createdAt)
      return
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 12)

    // Create admin user
    const adminUser = await User.create({
      name: ADMIN_CONFIG.name,
      email: ADMIN_CONFIG.email,
      password: hashedPassword,
      role: ADMIN_CONFIG.role,
      emailVerified: new Date(),
      isActive: true
    })

    console.log('\n✅ Admin user created successfully!')
    console.log('📋 Admin Login Credentials:')
    console.log('   Email:', ADMIN_CONFIG.email)
    console.log('   Password:', ADMIN_CONFIG.password)
    console.log('   Role:', adminUser.role)
    console.log('   User ID:', adminUser._id)
    console.log('')
    console.log('🚨 SECURITY: Change the password after first login!')
    console.log('🌐 Login at: http://localhost:3000/login')
    console.log('📊 Admin panel: http://localhost:3000/admin')

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message)
    
    if (error.code === 11000) {
      console.log('💡 Tip: Admin user with this email already exists')
    } else if (error.name === 'ValidationError') {
      console.log('💡 Tip: Check the admin configuration values')
    } else {
      console.log('💡 Tip: Check your MongoDB connection')
    }
  } finally {
    mongoose.disconnect()
    process.exit(0)
  }
}

// Run the script
console.log('🚀 Admin User Creation Script')
console.log('============================')
createAdminUser()
