'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FullPageLoader } from '@/components/ui/loader'
import { 
  Users, 
  TrendingUp, 
  Star, 
  Settings,
  UserCheck,
  MessageSquare,
  Calendar,
  BarChart3,
  Activity,
  Shield,
  Database,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      // Redirect non-admin users to their appropriate dashboard
      const redirectPath = session?.user?.role === 'AGENT' ? '/agent/dashboard' : '/dashboard'
      router.push(redirectPath)
      return
    }

    if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, session, router])

  if (status === 'loading' || loading) {
    return <FullPageLoader text="Loading admin dashboard..." />
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {session.user.name}. Here's your platform overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/admin/users">
                      <Users className="h-6 w-6 text-blue-600" />
                      <span className="text-sm">Manage Users</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/admin/agents">
                      <UserCheck className="h-6 w-6 text-green-600" />
                      <span className="text-sm">Manage Agents</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/admin/analytics">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                      <span className="text-sm">Analytics</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/admin/settings">
                      <Settings className="h-6 w-6 text-gray-600" />
                      <span className="text-sm">Settings</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/admin/support">
                      <MessageSquare className="h-6 w-6 text-orange-600" />
                      <span className="text-sm">Support Tickets</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/admin/profile">
                      <Shield className="h-6 w-6 text-red-600" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest system events and user activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registration</p>
                      <p className="text-xs text-gray-500">john.doe@example.com - 2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Interview session completed</p>
                      <p className="text-xs text-gray-500">Agent Sarah completed session with Mike - 15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System maintenance scheduled</p>
                      <p className="text-xs text-gray-500">Maintenance window: Tonight 2-4 AM - 1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Support ticket created</p>
                      <p className="text-xs text-gray-500">High priority issue reported - 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service</span>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600">Degraded</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">File Storage</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Healthy</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Pending Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">5 Support tickets awaiting response</p>
                  <p className="text-xs text-gray-500">Oldest: 2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">3 Agent applications pending</p>
                  <p className="text-xs text-gray-500">Review required</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">1 System update available</p>
                  <p className="text-xs text-gray-500">Security patch v2.1.3</p>
                </div>
                <Button size="sm" className="w-full mt-3">
                  View All Tasks
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">New Users</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed Sessions</span>
                  <span className="text-sm font-medium">34</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="text-sm font-medium">$2,840</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Support Tickets</span>
                  <span className="text-sm font-medium">8</span>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  )
}
