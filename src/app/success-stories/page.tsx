import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Star, 
  Quote,
  ArrowRight,
  Briefcase,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

export default function SuccessStoriesPage() {
  const stories = [
    {
      name: "Sarah Rodriguez",
      role: "Software Engineer",
      company: "Google",
      location: "Mountain View, CA",
      previousRole: "Junior Developer",
      salaryIncrease: "85%",
      timeToLand: "6 weeks",
      image: "SR",
      story: "After struggling with technical interviews for months, I joined Prepify's Software Engineering program. The mock interviews with actual Google engineers were game-changing. I learned not just how to code, but how to think and communicate during high-pressure situations.",
      bgColor: "bg-blue-500"
    },
    {
      name: "Michael Kim",
      role: "Senior Data Scientist",
      company: "Microsoft",
      location: "Seattle, WA",
      previousRole: "Data Analyst",
      salaryIncrease: "65%",
      timeToLand: "8 weeks",
      image: "MK",
      story: "The Data Science program at Prepify completely transformed my approach to ML interviews. The case studies were incredibly realistic, and the feedback helped me identify and fix my weak points. The salary negotiation tips alone were worth the entire program.",
      bgColor: "bg-green-500"
    },
    {
      name: "Aisha Patel",
      role: "Product Manager",
      company: "Amazon",
      location: "New York, NY",
      previousRole: "Fresh Graduate",
      salaryIncrease: "120%",
      timeToLand: "4 weeks",
      image: "AP",
      story: "As a fresh graduate with no PM experience, I thought landing a role at Amazon was impossible. Prepify's coaches helped me understand the product mindset and taught me how to structure my answers. I got 3 offers within 2 months!",
      bgColor: "bg-purple-500"
    },
    {
      name: "David Chen",
      role: "Engineering Manager",
      company: "Netflix",
      location: "Los Gatos, CA",
      previousRole: "Senior Engineer",
      salaryIncrease: "45%",
      timeToLand: "10 weeks",
      image: "DC",
      story: "Moving from IC to management required a completely different skill set. Prepify's leadership coaching and behavioral interview prep were exceptional. The 1-on-1 sessions with actual engineering managers gave me insights I couldn't get anywhere else.",
      bgColor: "bg-red-500"
    },
    {
      name: "Emily Johnson",
      role: "UX Designer",
      company: "Apple",
      location: "Cupertino, CA",
      previousRole: "Freelancer",
      salaryIncrease: "90%",
      timeToLand: "5 weeks",
      image: "EJ",
      story: "Transitioning from freelance to full-time at a top tech company seemed daunting. Prepify's design program helped me present my portfolio effectively and nail the design challenges. The interview confidence I gained was invaluable.",
      bgColor: "bg-indigo-500"
    },
    {
      name: "James Wilson",
      role: "Solutions Architect",
      company: "AWS",
      location: "Austin, TX",
      previousRole: "DevOps Engineer",
      salaryIncrease: "55%",
      timeToLand: "7 weeks",
      image: "JW",
      story: "The system design portion of Prepify's program was incredible. Learning to think at scale and communicate complex architectures clearly made all the difference. I went from struggling with system design to confidently leading architecture discussions.",
      bgColor: "bg-yellow-500"
    }
  ]

  const stats = [
    { number: "95%", label: "Success Rate", description: "Students land their target role" },
    { number: "65%", label: "Average Salary Increase", description: "After completing our programs" },
    { number: "6 weeks", label: "Average Time to Offer", description: "From program completion" },
    { number: "4.9/5", label: "Student Rating", description: "Average program satisfaction" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Real Stories,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Real Success
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Meet professionals who transformed their careers with Prepify. From fresh graduates 
            to senior executives, our students consistently land roles at top companies.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {stories.map((story, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 ${story.bgColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                        {story.image}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                        <p className="text-blue-600 font-semibold">{story.role}</p>
                        <p className="text-gray-600">{story.company}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {story.location}
                        </div>
                      </div>
                    </div>
                    <Quote className="w-8 h-8 text-gray-300" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">+{story.salaryIncrease}</div>
                      <div className="text-xs text-gray-600">Salary Increase</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{story.timeToLand}</div>
                      <div className="text-xs text-gray-600">Time to Offer</div>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="text-xs text-gray-600">Experience</div>
                    </div>
                  </div>

                  {/* Story */}
                  <blockquote className="text-gray-700 italic leading-relaxed mb-4">
                    "{story.story}"
                  </blockquote>

                  {/* Journey */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="w-4 h-4 mr-1" />
                      From: {story.previousRole}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex items-center text-blue-600 font-medium">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      To: {story.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hear From Our Students
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Watch video testimonials from professionals who achieved their career goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((video, index) => (
              <div key={index} className="relative group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-6 h-6 text-blue-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <h4 className="font-semibold text-gray-900">Success Story {index + 1}</h4>
                      <p className="text-sm text-gray-600">3:45 minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who transformed their careers with Prepify.
            Your success story could be next.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/programs">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
                View Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
