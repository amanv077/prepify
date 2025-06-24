import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Globe, Zap, Heart, Target } from "lucide-react";

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior AI Engineer",
      department: "Engineering",
      location: "Remote / San Francisco",
      type: "Full-time",
      description: "Lead the development of our AI-powered interview preparation algorithms and machine learning models."
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Remote / New York",
      type: "Full-time",
      description: "Drive product strategy and roadmap for our interview preparation platform, working closely with enterprise clients."
    },
    {
      title: "Enterprise Sales Manager",
      department: "Sales",
      location: "Remote / Chicago",
      type: "Full-time",
      description: "Build relationships with Fortune 500 companies and help them implement our interview training solutions."
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote / Los Angeles",
      type: "Full-time",
      description: "Create intuitive and engaging user experiences for candidates and recruiters across all platforms."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote / Austin",
      type: "Full-time",
      description: "Ensure our enterprise clients achieve maximum value from Prepify's interview preparation solutions."
    },
    {
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Remote / Boston",
      type: "Full-time",
      description: "Drive growth through content marketing, digital campaigns, and partnership initiatives."
    }
  ];

  const benefits = [
    {
      icon: <Heart className="h-6 w-6 text-blue-600" />,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance plus wellness stipends"
    },
    {
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      title: "Remote-First",
      description: "Work from anywhere with flexible hours and occasional team retreats"
    },
    {
      icon: <Target className="h-6 w-6 text-blue-600" />,
      title: "Growth & Learning",
      description: "Professional development budget and mentorship opportunities"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Equity & Inclusion",
      description: "Competitive equity packages and commitment to diverse hiring"
    },
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: "Innovation Time",
      description: "20% time for personal projects and innovation initiatives"
    },
    {
      icon: <Briefcase className="h-6 w-6 text-blue-600" />,
      title: "Work-Life Balance",
      description: "Unlimited PTO and sabbatical opportunities for long-term employees"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Join the Future of Interview Preparation
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Help us revolutionize how people prepare for their dream jobs. Be part of a team that's transforming careers through AI-powered interview training.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View Open Positions
            </Button>
            <Button variant="outline" size="lg">
              Learn About Our Culture
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join Prepify?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're not just building a product – we're creating a movement that empowers millions of professionals to achieve their career goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {benefit.icon}
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-lg text-gray-600">
              Find your next opportunity and help shape the future of career development
            </p>
          </div>

          <div className="grid gap-6">
            {openPositions.map((position, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-gray-900">{position.title}</CardTitle>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {position.location}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 md:w-auto w-full">
                      Apply Now
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700">
                    {position.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Don't see a position that matches your skills?
            </p>
            <Button variant="outline" size="lg">
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Culture</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation First</h3>
              <p className="text-gray-600">
                We encourage experimentation, embrace failure as learning, and constantly push the boundaries of what's possible.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">People-Centric</h3>
              <p className="text-gray-600">
                Every decision we make puts our team members and users at the center, ensuring we create meaningful impact.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Impact</h3>
              <p className="text-gray-600">
                We're building solutions that democratize access to career opportunities worldwide, regardless of background.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Make an Impact?</h3>
            <p className="text-lg text-gray-600 mb-6">
              Join a team that's passionate about empowering careers and transforming the interview process through technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Browse All Positions
              </Button>
              <Button variant="outline" size="lg">
                Contact Our Team
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
