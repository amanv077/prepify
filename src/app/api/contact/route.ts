import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  company?: string
  subject: string
  message: string
  newsletter: boolean
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body: ContactFormData = await request.json()
    
    // Validate required fields
    const { firstName, lastName, email, subject, message } = body
    
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    // Create contact record
    const contactData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      company: body.company?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      newsletter: Boolean(body.newsletter),
      ipAddress
    }

    const contact = new Contact(contactData)
    const result = await contact.save()

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user
    // TODO: Add to newsletter list if opted in

    return NextResponse.json(
      { 
        message: 'Contact form submitted successfully',
        id: result._id
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

// GET method to retrieve contacts (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // TODO: Add admin authentication check here
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    
    // Build query
    const query: any = {}
    if (status && ['new', 'in-progress', 'resolved'].includes(status)) {
      query.status = status
    }
    
    // Get total count
    const total = await Contact.countDocuments(query)
    
    // Get paginated results
    const contacts = await Contact.find(query)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v') // Exclude version field

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
