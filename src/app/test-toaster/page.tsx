'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { showToast } from '@/components/ui/toaster'

export default function ToasterTestPage() {
  const [loadingToast, setLoadingToast] = useState<string | undefined>()

  const testSuccessToast = () => {
    showToast.success('This is a success message that will auto-dismiss in 4 seconds!')
  }

  const testErrorToast = () => {
    showToast.error('This is an error message that will auto-dismiss in 6 seconds!')
  }

  const testInterviewToast = () => {
    showToast.interviewSuccess('Great job! This interview-themed toast will auto-dismiss in 5 seconds!')
  }

  const testLoadingToast = () => {
    if (loadingToast) {
      showToast.dismiss(loadingToast)
      setLoadingToast(undefined)
    } else {
      const toast = showToast.loading('This is a loading toast - click again to dismiss')
      setLoadingToast(toast)
    }
  }

  const testApplicationToast = () => {
    showToast.applicationSubmitted('Your application has been submitted successfully!')
  }

  const dismissAllToasts = () => {
    showToast.dismissAll()
    setLoadingToast(undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Toaster Test Page
          </h1>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={testSuccessToast} className="bg-green-600 hover:bg-green-700">
                Test Success Toast (4s)
              </Button>
              
              <Button onClick={testErrorToast} className="bg-red-600 hover:bg-red-700">
                Test Error Toast (6s)
              </Button>
              
              <Button onClick={testInterviewToast} className="bg-purple-600 hover:bg-purple-700">
                Test Interview Success (5s)
              </Button>
              
              <Button onClick={testApplicationToast} className="bg-blue-600 hover:bg-blue-700">
                Test Application Toast (5s)
              </Button>
              
              <Button 
                onClick={testLoadingToast} 
                className={`${loadingToast ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-orange-600 hover:bg-orange-700'}`}
              >
                {loadingToast ? 'Dismiss Loading Toast' : 'Test Loading Toast'}
              </Button>
              
              <Button onClick={dismissAllToasts} variant="outline">
                Dismiss All Toasts
              </Button>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="font-semibold text-gray-800 mb-2">Test Instructions:</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Success toasts auto-dismiss after 4 seconds</li>
              <li>• Error toasts auto-dismiss after 6 seconds</li>
              <li>• Interview toasts auto-dismiss after 5 seconds</li>
              <li>• Loading toasts persist until manually dismissed</li>
              <li>• All toasts can be clicked to dismiss immediately</li>
              <li>• Toasts appear in the top-right corner</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
