'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Loader from '@/components/ui/loader'
import { 
  Brain, 
  Users, 
  Trophy, 
  Star, 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Sparkles,
  Building2,
  GraduationCap,
  UserCheck,
  Calculator,
  Code,
  Briefcase,
  Video,
  Clock,
  Target,
  Award,
  TrendingUp,
  MessageSquare,
  BookOpen,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  PlayCircle
} from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()

  const getDashboardLink = () => {
    if (!session?.user?.role) return '/dashboard'
    
    switch (session.user.role) {
      case 'ADMIN':
        return '/admin'
      case 'AGENT':
        return '/agent'
      default:
        return '/dashboard'
    }
  }

  const roleCards = [
    {
      title: 'Software Developers',
      description: 'Technical interviews, coding challenges, system design',
      icon: Code,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'HR Professionals', 
      description: 'Behavioral interviews, recruitment strategies, people management',
      icon: Users,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Accountants',
      description: 'Financial analysis, audit processes, regulatory compliance',
      icon: Calculator,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Managers',
      description: 'Leadership scenarios, team management, strategic planning',
      icon: Briefcase,
      color: 'bg-orange-50 text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Students',
      description: 'Entry-level positions, internships, campus placements',
      icon: GraduationCap,
      color: 'bg-pink-50 text-pink-600',
      borderColor: 'border-pink-200'
    },
    {
      title: 'All Professionals',
      description: 'Cross-industry skills, communication, problem-solving',
      icon: UserCheck,
      color: 'bg-gray-50 text-gray-600',
      borderColor: 'border-gray-200'
    }
  ]

  const features = [
    {
      title: 'AI-Powered Practice',
      description: 'Advanced AI analyzes your responses and provides personalized feedback to improve your performance.',
      icon: Brain,
    },
    {
      title: 'Expert Training',
      description: 'Learn from industry experts and successful professionals who know what employers are looking for.',
      icon: Trophy,
    },
    {
      title: 'Company Partnerships',
      description: 'Direct connections with top companies for exclusive interview opportunities and insights.',
      icon: Building2,
    }
  ]

  const companyLogos = [
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix'
  ]

  const stats = [
    { number: '50K+', label: 'Successful Interviews' },
    { number: '200+', label: 'Partner Companies' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'AI Support' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Interview Preparation</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Ace Your Next
                <span className="block bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Interview
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Join thousands of professionals who landed their dream jobs with our AI-powered platform. 
                Practice, learn, and succeed with personalized training and expert guidance.
              </p>
              
              {status === 'loading' ? (
                <Loader size="md" text="Loading your dashboard..." />
              ) : session ? (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-2">
                      Welcome back, <span className="font-semibold text-blue-600">{session.user.name}</span>!
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Role: <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">{session.user.role}</span>
                    </p>
                    <Link href={getDashboardLink()}>
                      <Button size="lg" className="w-full sm:w-auto">
                        Continue Learning
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      <Play className="mr-2 w-5 h-5" />
                      Watch Demo
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="relative bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Interview Coach</h3>
                      <p className="text-sm text-gray-600">Analyzing your response...</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">"Tell me about your greatest achievement"</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                      </div>
                      <span className="text-xs text-gray-500">75%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Strong opening statement</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Good use of STAR method</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700">Add more specific metrics</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-100 text-green-700 p-3 rounded-full animate-bounce">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-100 text-purple-700 p-3 rounded-full animate-pulse">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Prepify?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with expert insights 
              to give you the competitive edge you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tailored for Every Professional
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a developer, HR professional, accountant, manager, or student - 
              we have specialized training for your field.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleCards.map((role, index) => {
              const Icon = role.icon
              return (
                <Card key={index} className={`border-2 ${role.borderColor} hover:shadow-lg transition-all hover:-translate-y-1`}>
                  <CardHeader>
                    <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{role.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {role.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Trusted by professionals at top companies
            </h2>
            <p className="text-gray-600">
              Our partner companies provide real interview insights and opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {companyLogos.map((company, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="text-gray-700 font-semibold text-lg hover:text-blue-600 transition-colors">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of successful candidates who transformed their careers with Prepify. 
            Start your free trial today and experience the difference.
          </p>
          
          {!session && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                  Contact Sales
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
