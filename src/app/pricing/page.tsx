import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Check, 
  Star, 
  ArrowRight,
  Crown,
  Zap,
  Shield,
  Users,
  Video,
  MessageSquare,
  BookOpen,
  Award,
  Clock,
  Target
} from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: 0,
      period: "Forever Free",
      description: "Perfect for getting started with interview preparation",
      featured: false,
      features: [
        "5 AI-powered practice sessions per month",
        "Basic interview question bank",
        "Self-assessment tools",
        "Email support",
        "Community forum access",
        "Basic progress tracking"
      ],
      limitations: [
        "No live coaching sessions",
        "Limited feedback",
        "No custom programs"
      ],
      cta: "Get Started Free",
      color: "border-gray-200"
    },
    {
      name: "Professional",
      price: 99,
      period: "per month",
      description: "Most popular choice for serious job seekers",
      featured: true,
      features: [
        "Unlimited AI practice sessions",
        "2 live 1-on-1 coaching sessions/month",
        "Complete question bank (1000+ questions)",
        "Personalized learning path",
        "Detailed performance analytics",
        "Industry-specific training modules",
        "Resume review & optimization",
        "Mock interview recordings",
        "Priority email & chat support",
        "Salary negotiation guidance"
      ],
      limitations: [],
      cta: "Start 7-Day Free Trial",
      color: "border-blue-500 ring-2 ring-blue-500"
    },
    {
      name: "Premium",
      price: 199,
      period: "per month",
      description: "For executives and senior professionals",
      featured: false,
      features: [
        "Everything in Professional",
        "4 live 1-on-1 coaching sessions/month",
        "Expert-level coach matching",
        "Custom interview scenarios",
        "Leadership & executive coaching",
        "C-suite interview preparation",
        "Personal branding consultation",
        "LinkedIn profile optimization",
        "Reference check preparation",
        "Offer negotiation support",
        "Career transition planning",
        "24/7 priority support"
      ],
      limitations: [],
      cta: "Start 7-Day Free Trial",
      color: "border-purple-200"
    }
  ]

  const programs = [
    {
      name: "Software Engineering Bootcamp",
      duration: "8 weeks",
      price: 599,
      features: [
        "16 live coaching sessions",
        "FAANG interview preparation",
        "System design mastery",
        "Coding interview practice",
        "Job placement assistance"
      ]
    },
    {
      name: "Data Science Intensive",
      duration: "6 weeks",
      price: 499,
      features: [
        "12 live coaching sessions",
        "ML interview preparation",
        "Case study practice",
        "SQL & Python mastery",
        "Portfolio development"
      ]
    },
    {
      name: "Executive Leadership Program",
      duration: "4 weeks",
      price: 899,
      features: [
        "8 executive coaching sessions",
        "C-suite interview prep",
        "Leadership assessment",
        "Personal branding",
        "Salary negotiation mastery"
      ]
    }
  ]

  const faqs = [
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll provide a full refund."
    },
    {
      question: "How do live coaching sessions work?",
      answer: "Live sessions are conducted via video call with expert coaches. You can schedule them at your convenience through our platform."
    },
    {
      question: "Are there any setup fees?",
      answer: "No, there are no setup fees or hidden costs. The price you see is exactly what you pay."
    },
    {
      question: "Can I switch plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Choose the plan that fits your career goals. All plans include our satisfaction guarantee.
          </p>
          
          <div className="flex justify-center items-center space-x-4 mb-12">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-4 h-4 mr-1 text-green-500" />
              30-day money-back guarantee
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Zap className="w-4 h-4 mr-1 text-blue-500" />
              No setup fees
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1 text-purple-500" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative border-2 ${plan.color} ${plan.featured ? 'scale-105 shadow-2xl' : 'shadow-lg'} transition-all duration-300 hover:shadow-xl`}>
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                      <Crown className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Not included:</p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="text-xs text-gray-400">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Link href="/register">
                    <Button 
                      className={`w-full ${plan.featured 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specialized Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Specialized Bootcamp Programs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Intensive programs designed for specific career paths with guaranteed results
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">{program.name}</CardTitle>
                  <div className="flex items-center justify-center space-x-4 mt-2">
                    <span className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {program.duration}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">${program.price}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <Target className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
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

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We have answers.
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Invest in Your Future?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who transformed their careers with Prepify.
            Start with our free plan or dive into our comprehensive programs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
                <MessageSquare className="mr-2 h-5 w-5" />
                Talk to Sales
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 flex justify-center items-center space-x-6 text-sm opacity-80">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              <span>30-day guarantee</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>50,000+ students</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
