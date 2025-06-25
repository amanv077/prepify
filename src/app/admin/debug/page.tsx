'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function DebugPage() {
  const { data: session } = useSession()
  const [testResults, setTestResults] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const runDiagnostics = async () => {
    setTesting(true)
    setTestResults(null)

    try {
      // Test Gemini API
      const geminiTest = await fetch('/api/debug/gemini', {
        method: 'POST'
      })
      const geminiResult = await geminiTest.json()

      // Test Database
      const dbTest = await fetch('/api/debug/database', {
        method: 'POST'
      })
      const dbResult = await dbTest.json()

      setTestResults({
        gemini: geminiResult,
        database: dbResult,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setTestResults({
        error: 'Failed to run diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTesting(false)
    }
  }

  if (!session?.user) {
    return <div>Please log in to access debug tools.</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>System Diagnostics</CardTitle>
          <CardDescription>
            Debug tools for checking API connectivity and system health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={runDiagnostics} 
            disabled={testing}
            className="w-full"
          >
            {testing ? 'Running Diagnostics...' : 'Run System Diagnostics'}
          </Button>

          {testResults && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              
              {/* Gemini API Status */}
              {testResults.gemini && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Gemini API
                      <Badge variant={testResults.gemini.success ? 'default' : 'destructive'}>
                        {testResults.gemini.success ? 'OK' : 'ERROR'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults.gemini.success ? (
                      <div className="text-green-600">
                        ✅ API key is valid and working
                        <br />
                        <small>Quota remaining: {testResults.gemini.quotaInfo || 'Unknown'}</small>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-red-600">
                          ❌ {testResults.gemini.error}
                        </div>
                        {testResults.gemini.isRateLimit && (
                          <Alert>
                            <AlertDescription>
                              <strong>Rate Limit Exceeded:</strong> You've reached the daily quota for the Gemini API.
                              <br />
                              <strong>Solutions:</strong>
                              <ul className="mt-2 ml-4 list-disc">
                                <li>Wait for the quota to reset (usually 24 hours)</li>
                                <li>Upgrade to a paid Gemini API plan</li>
                                <li>Use the fallback question system (automatically enabled)</li>
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}
                        {testResults.gemini.isApiKeyInvalid && (
                          <Alert>
                            <AlertDescription>
                              <strong>Invalid API Key:</strong> Check your GEMINI_API_KEY environment variable.
                              <br />
                              <strong>Steps:</strong>
                              <ol className="mt-2 ml-4 list-decimal">
                                <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google AI Studio</a></li>
                                <li>Create a new API key</li>
                                <li>Update your .env.local file</li>
                                <li>Restart the development server</li>
                              </ol>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Database Status */}
              {testResults.database && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Database Connection
                      <Badge variant={testResults.database.success ? 'default' : 'destructive'}>
                        {testResults.database.success ? 'OK' : 'ERROR'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults.database.success ? (
                      <div className="text-green-600">
                        ✅ Database connection successful
                        <br />
                        <small>Connected to: {testResults.database.dbName}</small>
                      </div>
                    ) : (
                      <div className="text-red-600">
                        ❌ {testResults.database.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {testResults.error && (
                <Alert>
                  <AlertDescription>
                    <strong>Diagnostic Error:</strong> {testResults.error}
                    <br />
                    {testResults.details && <small>{testResults.details}</small>}
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-gray-500">
                Last run: {new Date(testResults.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
