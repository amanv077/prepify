'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      sessionStatus: status,
      sessionData: session,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : null,
      timestamp: new Date().toISOString()
    })
  }, [session, status])

  const testProfileAPI = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      setDebugInfo((prev: any) => ({
        ...prev,
        profileAPITest: {
          status: response.status,
          ok: response.ok,
          data: data
        }
      }))
    } catch (error) {
      setDebugInfo((prev: any) => ({
        ...prev,
        profileAPITest: {
          error: error?.toString()
        }
      }))
    }
  }

  const testAdminAPI = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      setDebugInfo((prev: any) => ({
        ...prev,
        adminAPITest: {
          status: response.status,
          ok: response.ok,
          data: data
        }
      }))
    } catch (error) {
      setDebugInfo((prev: any) => ({
        ...prev,
        adminAPITest: {
          error: error?.toString()
        }
      }))
    }
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Debug Information</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <button 
            onClick={testProfileAPI}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Profile API
          </button>
          <button 
            onClick={testAdminAPI}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Admin API
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/dashboard" className="block text-blue-600 hover:underline">
              User Dashboard
            </a>
            <a href="/admin/dashboard" className="block text-blue-600 hover:underline">
              Admin Dashboard
            </a>
            <a href="/login" className="block text-blue-600 hover:underline">
              Login Page
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
