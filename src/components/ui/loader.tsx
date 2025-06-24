'use client'

import { cn } from "@/lib/utils"

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function Loader({ size = 'md', text, className }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {/* Interview-themed animated loader */}
      <div className="relative">
        {/* Rotating briefcase */}
        <div className={cn(
          "relative border-4 border-blue-200 border-t-blue-600 rounded-lg animate-spin",
          sizeClasses[size]
        )}>
          <div className="absolute inset-2 bg-blue-50 rounded-sm flex items-center justify-center">
            <svg 
              className="w-1/2 h-1/2 text-blue-600" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M14,2H10A2,2 0 0,0 8,4V6H16V4A2,2 0 0,0 14,2M20,19V8H17V6H20A2,2 0 0,1 22,8V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V8A2,2 0 0,1 4,6H7V8H4V19H20M16,10V12H8V10H16Z" />
            </svg>
          </div>
        </div>
        
        {/* Floating dots animation */}
        <div className="absolute -top-2 -right-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        </div>
        <div className="absolute -bottom-2 -left-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        </div>
        <div className="absolute -top-2 -left-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Loading text with typing animation */}
      {text && (
        <div className={cn("text-gray-600 font-medium", textSizes[size])}>
          <span className="inline-block animate-pulse">{text}</span>
          <span className="inline-block animate-ping ml-1">...</span>
        </div>
      )}
    </div>
  )
}

// Full page loader component
export function FullPageLoader({ text = "Preparing your interview experience" }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <Loader size="lg" text={text} />
      </div>
    </div>
  )
}

// Button loader component
export function ButtonLoader({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center space-x-2">
      <div className={cn(
        "border-2 border-current border-t-transparent rounded-full animate-spin",
        size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
      )}></div>
    </div>
  )
}
