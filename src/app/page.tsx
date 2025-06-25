'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
  const router = useRouter()

  const getDashboardLink = () => {
    if (!session?.user?.role) return '/dashboard'
    
    switch (session.user.role) {
      case 'ADMIN':
        return '/admin/dashboard'
      case 'AGENT':
        return '/agent/dashboard'
      default:
        return '/dashboard'
    }
  }

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(getDashboardLink())
    }
  }, [status, session, router])

  // Show loading screen while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader size="lg" text="Loading..." />
      </div>
    )
  }

  // Show loading screen for authenticated users while redirecting
  if (status === 'authenticated' && session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader size="lg" text="Redirecting to your dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30"></div>
          <div className="absolute top-0 left-0 w-full h-full" style={{
            background: `radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-8">
              <div>
                <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  #1 Interview Training Platform
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                  Land Your
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    Dream Job
                  </span>
                  <span className="block text-gray-900">
                    in 2025
                  </span>
                </h1>
                
                <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-lg">
                  Join 50,000+ professionals who transformed their careers with our proven 4-step system: 
                  
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                      Start Free Training
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium">No Credit Card Required</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="font-medium">Instant Access</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Stats & Visual */}
            <div className="space-y-8">
              {/* Success Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center mb-3">
                    <Star className="w-6 h-6 text-yellow-500 mr-2" />
                    <span className="text-3xl font-bold text-gray-900">4.9/5</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">Student Rating</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center mb-3">
                    <Trophy className="w-6 h-6 text-green-500 mr-2" />
                    <span className="text-3xl font-bold text-gray-900">95%</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">Success Rate</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center mb-3">
                    <Users className="w-6 h-6 text-blue-500 mr-2" />
                    <span className="text-3xl font-bold text-gray-900">50K+</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">Students Trained</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-500 mr-2" />
                    <span className="text-3xl font-bold text-gray-900">65%</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">Avg Salary Boost</p>
                </div>
              </div>
              
              {/* Process Flow */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Your Success Journey</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">1</div>
                    <span className="text-gray-800 font-medium">Register & Assessment</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">2</div>
                    <span className="text-gray-800 font-medium">Live Training with Experts</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">3</div>
                    <span className="text-gray-800 font-medium">Intensive Interview Prep</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">4</div>
                    <span className="text-gray-800 font-medium">Placement Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Prepify?
            </h2>            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              We provide comprehensive interview preparation with real-world scenarios and expert guidance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Video className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Live 1-on-1 Coaching</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-gray-700">
                  Get personalized coaching sessions with industry experts. Practice real interview scenarios with immediate feedback.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Market-Relevant Training</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-gray-700">
                  Practice with real job descriptions and current market trends. Stay ahead with the latest interview techniques.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">AI-Powered Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-gray-700">
                  Advanced AI analyzes your performance and provides detailed insights to improve your interview skills.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition-colors">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Flexible Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-gray-700">
                  Book sessions that fit your schedule. Practice anytime, anywhere with our 24/7 available platform.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Industry Experts</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-gray-700">
                  Learn from hiring managers and senior professionals from top companies like Google, Microsoft, and Amazon.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                  <TrendingUp className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Track Progress</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-gray-700">
                  Monitor your improvement with detailed analytics, performance metrics, and personalized learning paths.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Success Journey
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Our proven 4-step system that has helped 50,000+ professionals land their dream jobs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Register & Assessment</h3>
              <p className="text-gray-700">
                Sign up and complete our comprehensive skills assessment. We'll identify your strengths and areas for improvement to create your personalized learning path.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Live Training with Experts</h3>
              <p className="text-gray-700">
                Engage in live 1-on-1 coaching sessions with industry experts from top companies. Get real-time feedback and insider knowledge about hiring processes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Intensive Interview Prep</h3>
              <p className="text-gray-700">
                Practice with realistic mock interviews, master technical and behavioral questions, and perfect your communication skills through targeted preparation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Placement Support</h3>
              <p className="text-gray-700">
                Get ongoing support during your job search including resume optimization, salary negotiation guidance, and interview follow-up strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Specialized Training Programs
            </h2>            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Comprehensive interview preparation for every industry and role level
            </p>
          </div>            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <Code className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2 text-gray-900">Software Engineering Mastery</h3>              <p className="text-gray-700 text-sm">Coding interviews, system design, algorithmic thinking</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <Calculator className="h-10 w-10 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2 text-gray-900">Data Science Excellence</h3>
              <p className="text-gray-700 text-sm">Statistical analysis, ML concepts, data interpretation</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <Building2 className="h-10 w-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2 text-gray-900">Business & Management</h3>
              <p className="text-gray-700 text-sm">Leadership scenarios, strategic thinking, team management</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <GraduationCap className="h-10 w-10 text-yellow-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2 text-gray-900">Fresh Graduate Success</h3>
              <p className="text-gray-700 text-sm">Entry-level positions, portfolio building, soft skills</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Proven Success Results
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Our students consistently achieve outstanding results in their job searches
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Success Rate</div>
              <div className="text-sm opacity-75">Students land jobs within 3 months</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-lg opacity-90">Students Trained</div>
              <div className="text-sm opacity-75">Across 50+ countries worldwide</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Expert Coaches</div>
              <div className="text-sm opacity-75">From top tech companies</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">40%</div>
              <div className="text-lg opacity-90">Salary Increase</div>
              <div className="text-sm opacity-75">Average improvement after training</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Real success stories from professionals who transformed their careers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>                <p className="text-gray-700 mb-4">
                  "Prepify helped me land a software engineer role at Google. The mock interviews were incredibly realistic and the feedback was invaluable."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    SR
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Rodriguez</div>
                    <div className="text-sm text-gray-600">Software Engineer @ Google</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>                <p className="text-gray-700 mb-4">
                  "The personalized coaching and industry insights gave me the confidence to negotiate a 45% salary increase. Absolutely worth it!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    MK
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Michael Kim</div>
                    <div className="text-sm text-gray-600">Data Scientist @ Microsoft</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>                <p className="text-gray-700 mb-4">
                  "As a fresh graduate, Prepify gave me the skills and confidence to compete with experienced candidates. Got 3 offers in 2 months!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    AP
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Aisha Patel</div>
                    <div className="text-sm text-gray-600">Product Manager @ Amazon</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Land Your Dream Job?
          </h2>          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of successful professionals who transformed their careers with Prepify. 
            Start your journey today with our free trial.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2">
                Talk to an Expert
                <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 flex justify-center items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-1" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              <span>Available Worldwide</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
