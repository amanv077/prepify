# Prepify - Interview Preparation Platform

A platform to make you interview ready. Built with Next.js, TypeScript, Mongoose, NextAuth.js, and MongoDB.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication with NextAuth.js
- 📧 **Email Verification** - OTP-based email verification
- 👥 **Role-Based Access** - Support for User, Agent, and Admin roles
- 📄 **Resume Builder** - Create modern, ATS-friendly resumes with PDF download
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 📱 **Mobile Responsive** - Optimized for all device sizes
- 🔒 **Password Security** - Strong password requirements and hashing
- 🚀 **Fast Development** - Built with Next.js 15 and TypeScript
- 🗃️ **MongoDB Integration** - Native MongoDB support with Mongoose ODM

## Resume Builder Features

- **Complete CRUD Operations** - Create, Read, Update, Delete resumes
- **Dynamic Sections** - Add multiple education, experience, skills, and projects
- **Auto-Experience Calculation** - Automatically calculates total experience in years
- **Modern ATS-Friendly Design** - Professional layout optimized for Applicant Tracking Systems
- **PDF Download** - Print-to-PDF functionality for easy sharing
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Preview** - Instant preview of your resume as you build it
- **Form Validation** - Comprehensive validation to ensure data quality
- **User Authentication** - Secure, user-specific resume storage

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** NextAuth.js
- **Email:** Nodemailer with Gmail SMTP
- **File Storage:** Cloudinary
- **Deployment:** Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- MongoDB database (local or cloud like MongoDB Atlas)
- Gmail account for SMTP
- Cloudinary account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prepify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Update the following variables in `.env.local`:
   ```bash
   # Database URL for MongoDB
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/prepify_db?retryWrites=true&w=majority"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Email configuration (for OTP)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   
   # Cloudinary Configuration (optional - for image uploads)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # App configuration
   APP_NAME="Prepify"
   APP_URL="http://localhost:3000"
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Admin Setup

### Creating Admin Users

For security reasons, admin users cannot be created through the registration form. Use the seeding script to create admin accounts:

```bash
npm run seed:admin
```

This creates an admin user with default credentials:
- **Email**: `admin@prepify.com`
- **Password**: `Admin@123456`
- **Role**: `ADMIN`

**To customize admin credentials:** Edit the `ADMIN_CONFIG` object in `scripts/create-admin.js` before running the script.

**⚠️ Security Important**: Change the default password immediately after first login!

### Alternative Admin Creation Methods

#### Method 1: Using MongoDB Compass
1. Connect to your MongoDB database
2. Navigate to the `users` collection
3. Create a new document with admin role

#### Method 2: Direct Database Insert (MongoDB Shell)
```javascript
db.users.insertOne({
  name: "System Administrator",
  email: "admin@prepify.com",
  password: "$2a$12$[bcrypt-hashed-password]", // Use bcrypt to hash
  role: "ADMIN",
  emailVerified: new Date(),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## User Roles

### User (👤)
- Available through registration
- Access to personal dashboard
- Profile management
- Basic application features

### Agent (🏢)
- Available through registration
- All user permissions
- Extended business tools
- Client management features

### Admin (⚙️)
- **Only available through seeding/manual creation**
- All agent permissions  
- User management
- System settings
- Complete system control

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint

# Admin setup
npm run seed:admin                 # Create admin with default credentials
```

## Database Schema

The application uses MongoDB with the following collections:

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  emailVerified: Date,
  password: String (hashed),
  image: String,
  role: Enum ['USER', 'ADMIN', 'AGENT'],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Email Verifications Collection
```javascript
{
  _id: ObjectId,
  email: String,
  otp: String,
  status: Enum ['PENDING', 'VERIFIED', 'FAILED'],
  expiresAt: Date (TTL index for auto-cleanup),
  userId: ObjectId (reference to User),
  createdAt: Date
}
```

### Accounts Collection (NextAuth)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,
  provider: String,
  providerAccountId: String,
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String
}
```

### Sessions Collection (NextAuth)
```javascript
{
  _id: ObjectId,
  sessionToken: String (unique),
  userId: ObjectId,
  expires: Date
}
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/resend-otp` - Resend verification code
- `POST /api/auth/signin` - User login (NextAuth)

### Protected Routes
- `/dashboard` - User dashboard (requires authentication)
- `/admin` - Admin panel (requires ADMIN role)
- `/agent` - Agent panel (requires AGENT role)

## Security Features

- ✅ **Password Hashing** - Using bcryptjs with salt rounds
- ✅ **JWT Authentication** - Secure session management
- ✅ **Email Verification** - OTP-based email confirmation
- ✅ **Role-Based Access Control** - Protected routes by user role
- ✅ **Input Validation** - Server-side validation for all inputs
- ✅ **CSRF Protection** - Built-in NextAuth.js protection
- ✅ **Auto-cleanup** - Expired OTPs automatically removed (TTL indexes)

## Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically with each push

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- Email configuration variables
- Cloudinary variables (if using file uploads)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
