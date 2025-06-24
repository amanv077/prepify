import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Code, 
  Calculator, 
  Building2, 
  GraduationCap, 
  Users, 
  MessageSquare,
  Video,
  BookOpen,
  Target,
  Clock,
  ArrowRight
} from 'lucide-react'

export default function ProgramsPage() {
  const programs = [
    {
      title: "Software Engineering Mastery",
      description: "Complete interview preparation for software engineering roles",
      duration: "8 weeks",
      level: "All Levels",
      icon: Code,
      features: [
        "Data Structures & Algorithms",
        "System Design Interviews",
        "Behavioral Questions",
        "Code Reviews & Best Practices",
        "Mock Interviews with FAANG Engineers"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Data Science Excellence",
      description: "Master data science interviews from junior to senior level",
      duration: "6 weeks",
      level: "Intermediate+",
      icon: Calculator,
      features: [
        "Statistics & Probability",
        "Machine Learning Concepts",
        "SQL & Database Design",
        "Case Study Analysis",
        "Python/R Programming Challenges"
      ],
      color: "from-green-500 to-green-600"
    },
    {
      title: "Business & Management",
      description: "Executive and management role interview preparation",
      duration: "4 weeks",
      level: "Senior Level",
      icon: Building2,
      features: [
        "Leadership Scenarios",
        "Strategic Thinking",
        "Team Management",
        "Business Case Studies",
        "Negotiation Skills"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Fresh Graduate Program",
      description: "Entry-level interview preparation for new graduates",
      duration: "4 weeks",
      level: "Entry Level",
      icon: GraduationCap,
      features: [
        "Resume Building",
        "Basic Interview Skills",
        "Confidence Building",
        "Industry Knowledge",
        "Portfolio Development"
      ],
      color: "from-yellow-500 to-yellow-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Interview Training
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Programs
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose from our specialized training programs designed by industry experts. 
            Each program includes live coaching, personalized feedback, and guaranteed results.
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${program.color}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${program.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <program.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">{program.title}</CardTitle>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {program.duration}
                          </span>
                          <span className="text-sm text-gray-500">{program.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-6">
                    {program.description}
                  </CardDescription>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-gray-900">What You'll Learn:</h4>
                    <ul className="space-y-2">
                      {program.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Every Program Includes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive support and resources to ensure your success
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Live 1-on-1 Sessions</h3>
              <p className="text-gray-600">
                Weekly personalized coaching sessions with industry experts and hiring managers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Peer Learning Groups</h3>
              <p className="text-gray-600">
                Connect with fellow students, practice together, and learn from shared experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Premium Resources</h3>
              <p className="text-gray-600">
                Access to exclusive content, question banks, and industry insights from top companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Your Journey Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful professionals who transformed their careers with our programs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
                <MessageSquare className="mr-2 h-5 w-5" />
                Schedule Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
