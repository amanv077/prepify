'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/loader'
import { useMobileOptimizedFetch, useIsMobile } from '@/hooks/useMobileOptimized'
import { 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

export default function MobileTestPage() {
  const isMobile = useIsMobile()
  const [testResults, setTestResults] = useState<any[]>([])
  
  const {
    loading: statsLoading,
    error: statsError,
    data: statsData,
    execute: executeStats,
    forceStop: forceStopStats
  } = useMobileOptimizedFetch<any>({
    mobileTimeout: 3000,
    desktopTimeout: 5000,
    maxRetries: 1,
    safetyTimeout: 10000
  })

  const {
    loading: profileLoading,
    error: profileError,
    data: profileData,
    execute: executeProfile,
    forceStop: forceStopProfile
  } = useMobileOptimizedFetch<any>({
    mobileTimeout: 2000,
    desktopTimeout: 4000,
    maxRetries: 1,
    safetyTimeout: 8000
  })

  const runTest = async (testName: string, apiUrl: string, executor: any) => {
    const startTime = Date.now()
    console.log(`Starting test: ${testName}`)
    
    try {
      await executor(apiUrl)
      const endTime = Date.now()
      const duration = endTime - startTime
      
      setTestResults(prev => [...prev, {
        name: testName,
        success: true,
        duration,
        timestamp: new Date().toLocaleTimeString()
      }])
      
      console.log(`Test ${testName} completed in ${duration}ms`)
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      setTestResults(prev => [...prev, {
        name: testName,
        success: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      }])
      
      console.error(`Test ${testName} failed after ${duration}ms:`, error)
    }
  }

  const simulateSlowConnection = () => {
    // Simulate slow connection by adding delay
    const originalFetch = window.fetch
    window.fetch = (...args) => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(originalFetch(...args))
        }, 8000) // 8 second delay
      })
    }
    
    setTimeout(() => {
      window.fetch = originalFetch
    }, 15000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isMobile ? <Smartphone className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
              <span>Mobile Optimization Test Suite</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {isMobile ? 'Mobile' : 'Desktop'}
                </div>
                <div className="text-sm text-gray-500">Device Type</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {typeof window !== 'undefined' ? window.innerWidth : 0}px
                </div>
                <div className="text-sm text-gray-500">Screen Width</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {navigator.onLine ? 'Online' : 'Offline'}
                </div>
                <div className="text-sm text-gray-500">Connection</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {testResults.length}
                </div>
                <div className="text-sm text-gray-500">Tests Run</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                onClick={() => runTest('Admin Stats', '/api/admin/stats', executeStats)}
                disabled={statsLoading}
                className="flex items-center space-x-2"
              >
                {statsLoading ? <Loader size="sm" /> : <RefreshCw className="h-4 w-4" />}
                <span>Test Admin Stats</span>
              </Button>

              <Button 
                onClick={() => runTest('User Profile', '/api/profile', executeProfile)}
                disabled={profileLoading}
                className="flex items-center space-x-2"
              >
                {profileLoading ? <Loader size="sm" /> : <RefreshCw className="h-4 w-4" />}
                <span>Test User Profile</span>
              </Button>

              <Button 
                onClick={simulateSlowConnection}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <WifiOff className="h-4 w-4" />
                <span>Simulate Slow Network</span>
              </Button>

              <Button 
                onClick={() => {
                  forceStopStats()
                  forceStopProfile()
                }}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Force Stop All</span>
              </Button>

              <Button 
                onClick={() => setTestResults([])}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clear Results</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Stats API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`flex items-center space-x-1 ${
                    statsLoading ? 'text-blue-600' : 
                    statsError ? 'text-red-600' : 
                    statsData ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {statsLoading ? (
                      <>
                        <Loader size="sm" />
                        <span>Loading...</span>
                      </>
                    ) : statsError ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Error</span>
                      </>
                    ) : statsData ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Success</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>Ready</span>
                      </>
                    )}
                  </span>
                </div>
                {statsLoading && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={forceStopStats}
                    className="w-full"
                  >
                    Force Stop Loading
                  </Button>
                )}
                {statsData && (
                  <div className="text-sm bg-green-50 p-2 rounded">
                    <pre>{JSON.stringify(statsData, null, 2)}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Profile API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`flex items-center space-x-1 ${
                    profileLoading ? 'text-blue-600' : 
                    profileError ? 'text-red-600' : 
                    profileData ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {profileLoading ? (
                      <>
                        <Loader size="sm" />
                        <span>Loading...</span>
                      </>
                    ) : profileError ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Error</span>
                      </>
                    ) : profileData ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Success</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>Ready</span>
                      </>
                    )}
                  </span>
                </div>
                {profileLoading && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={forceStopProfile}
                    className="w-full"
                  >
                    Force Stop Loading
                  </Button>
                )}
                {profileData && (
                  <div className="text-sm bg-green-50 p-2 rounded">
                    Data loaded successfully
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded border ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500">
                          {result.timestamp} • {result.duration}ms
                        </div>
                        {result.error && (
                          <div className="text-sm text-red-600 mt-1">
                            {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Testing Instructions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Test on different devices:</strong> Open this page on both mobile and desktop</p>
              <p>2. <strong>Test slow networks:</strong> Use "Simulate Slow Network" to test timeout behavior</p>
              <p>3. <strong>Test force stop:</strong> Start a test and immediately use "Force Stop All"</p>
              <p>4. <strong>Mobile timeouts:</strong> On mobile, timeouts are shorter (3s vs 5s)</p>
              <p>5. <strong>Safety fallbacks:</strong> All loaders have 15s maximum timeout</p>
              <p>6. <strong>Retry logic:</strong> Failed requests are automatically retried once</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
