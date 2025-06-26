'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useIsMobile, getMobileInfo } from '@/hooks/useMobile'

export default function MobileDebugPage() {
  const { data: session, status } = useSession()
  const { isMobile, isLoaded } = useIsMobile()
  const [mobileInfo, setMobileInfo] = useState<any>(null)
  const [apiTests, setApiTests] = useState<any>({})

  useEffect(() => {
    if (isLoaded) {
      setMobileInfo(getMobileInfo())
    }
  }, [isLoaded])

  const testAPI = async (endpoint: string, name: string) => {
    const startTime = Date.now()
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      const endTime = Date.now()
      
      setApiTests((prev: any) => ({
        ...prev,
        [name]: {
          success: true,
          status: response.status,
          responseTime: endTime - startTime,
          data: data
        }
      }))
    } catch (error) {
      const endTime = Date.now()
      setApiTests((prev: any) => ({
        ...prev,
        [name]: {
          success: false,
          responseTime: endTime - startTime,
          error: error?.toString()
        }
      }))
    }
  }

  const quickDashboardBypass = () => {
    // Force navigate to dashboard with basic mode
    localStorage.setItem('mobile-bypass', 'true')
    window.location.href = session?.user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📱 Mobile Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Session Status</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify({
                  status,
                  role: session?.user?.role,
                  email: session?.user?.email,
                  name: session?.user?.name
                }, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Mobile Detection</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify({
                  isMobile,
                  isLoaded,
                  info: mobileInfo
                }, null, 2)}
              </pre>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="font-medium">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={() => testAPI('/api/profile', 'profile')}
              >
                Test Profile API
              </Button>
              <Button 
                size="sm" 
                onClick={() => testAPI('/api/admin/stats', 'adminStats')}
              >
                Test Admin Stats API
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={quickDashboardBypass}
              >
                🚀 Quick Dashboard Bypass
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                🔄 Reload Page
              </Button>
            </div>
          </div>

          {/* API Test Results */}
          {Object.keys(apiTests).length > 0 && (
            <div>
              <h3 className="font-medium mb-2">API Test Results</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-64">
                {JSON.stringify(apiTests, null, 2)}
              </pre>
            </div>
          )}

          {/* Navigation */}
          <div className="space-y-2">
            <h3 className="font-medium">Navigation</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <a href="/dashboard">User Dashboard</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/admin/dashboard">Admin Dashboard</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/debug">Debug Page</a>
              </Button>
            </div>
          </div>

          {/* Mobile Specific Tips */}
          {isMobile && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">📱 Mobile Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Try refreshing if stuck on loading</li>
                <li>• Use "Quick Dashboard Bypass" for immediate access</li>
                <li>• Check network connection if APIs are failing</li>
                <li>• Clear browser cache if issues persist</li>
              </ul>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
