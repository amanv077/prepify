'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonLoader } from '@/components/ui/loader'
import { showToast } from '@/components/ui/toaster'
import { Mail, Phone, MapPin, Clock, MessageSquare, Building } from "lucide-react"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    newsletter: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        showToast.success('Message sent successfully! We\'ll get back to you soon.')
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          subject: '',
          message: '',
          newsletter: false
        })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      showToast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: "Email Support",
      description: "Get help from our support team",
      contact: "support@prepify.com",
      availability: "24/7 response within 4 hours"
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+91 755 123 4567",
      availability: "Mon-Fri, 9 AM - 6 PM IST"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      title: "Live Chat",
      description: "Instant help when you need it",
      contact: "Available on platform",
      availability: "Mon-Fri, 8 AM - 8 PM IST"
    },
    {
      icon: <Building className="h-6 w-6 text-blue-600" />,
      title: "Enterprise Sales",
      description: "Custom solutions for your company",
      contact: "enterprise@prepify.com",
      availability: "Business hours India"
    }
  ]

  const offices = [
    {
      city: "Bhopal",
      address: "Zone no 1, 151, Near City Bank, Zone-I, Maharana Pratap Nagar",
      zipcode: "Bhopal, Madhya Pradesh 462011",
      phone: "+91 755 123 4567",
      primary: true
    },
    {
      city: "Mumbai",
      address: "456 Business Avenue, Floor 12",
      zipcode: "Mumbai, Maharashtra 400001",
      phone: "+91 22 555 0456"
    },
    {
      city: "Bangalore",
      address: "789 Tech Street, Unit 8",
      zipcode: "Bangalore, Karnataka 560001",
      phone: "+91 80 7123 4567"
    }
  ]

  const departments = [
    {
      name: "General Support",
      email: "support@prepify.com",
      description: "Platform issues, account questions, technical support"
    },
    {
      name: "Sales & Partnerships",
      email: "sales@prepify.com",
      description: "Enterprise solutions, partnership opportunities"
    },
    {
      name: "Careers & HR",
      email: "careers@prepify.com",
      description: "Job applications, internships, general inquiries"
    },
    {
      name: "Press & Media",
      email: "press@prepify.com",
      description: "Media inquiries, press releases, interviews"
    },
    {
      name: "Legal & Compliance",
      email: "legal@prepify.com",
      description: "Privacy, terms of service, compliance matters"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Have questions about Prepify? Need help with your interview preparation? Want to explore career opportunities? We're here to help you succeed in your professional journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Live Chat
            </Button>
            <Button variant="outline" size="lg">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Can We Help?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the best way to reach us based on your needs. We're committed to providing fast, helpful responses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow text-center">
                <CardHeader>
                  <div className="flex justify-center mb-3">
                    {method.icon}
                  </div>
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-gray-900 mb-2">{method.contact}</p>
                  <p className="text-sm text-gray-600">{method.availability}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
            <p className="text-lg text-gray-600">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-8">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Question</option>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales & Enterprise</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="press">Press & Media</option>
                    <option value="careers">Careers</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    placeholder="Tell us how we can help you..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
                    I'd like to receive updates about Prepify's products and features
                  </label>
                </div>                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <ButtonLoader size="sm" />
                      <span className="ml-2">Sending...</span>
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact by Department</h2>
            <p className="text-lg text-gray-600">
              Reach out directly to the right team for faster assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{dept.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">
                    {dept.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{dept.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Offices</h2>
            <p className="text-lg text-gray-600">
              Visit us in person or reach out to our regional teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <Card key={index} className={`border-gray-200 ${office.primary ? 'ring-2 ring-blue-200' : ''}`}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-xl">{office.city}</CardTitle>
                    {office.primary && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        HQ
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-900 font-medium">{office.address}</p>
                      <p className="text-gray-600">{office.zipcode}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-600">{office.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-600">Mon-Fri, 9 AM - 6 PM IST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 mb-8">
            Can't find what you're looking for? Check out our comprehensive FAQ section.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline">
              Visit FAQ Center
            </Button>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
