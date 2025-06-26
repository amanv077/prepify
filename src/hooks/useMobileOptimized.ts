'use client'

import { useState, useEffect, useCallback } from 'react'

interface MobileOptimizedConfig {
  mobileTimeout?: number
  desktopTimeout?: number
  maxRetries?: number
  safetyTimeout?: number
}

export function useMobileOptimizedFetch<T>(
  config: MobileOptimizedConfig = {}
) {
  const {
    mobileTimeout = 3000,
    desktopTimeout = 5000,
    maxRetries = 1,
    safetyTimeout = 15000
  } = config

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [data, setData] = useState<T | null>(null)

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  const fetchWithTimeout = useCallback(async (
    url: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<Response> => {
    const controller = new AbortController()
    const timeoutDuration = isMobile ? mobileTimeout : desktopTimeout
    
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, timeoutDuration)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`${isMobile ? 'Mobile' : 'Desktop'} fetch timeout (${timeoutDuration}ms)`)
        
        // Retry logic for timeouts
        if (retryCount < maxRetries) {
          console.log(`Retrying fetch... (attempt ${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchWithTimeout(url, options, retryCount + 1)
        }
      }
      
      throw error
    }
  }, [isMobile, mobileTimeout, desktopTimeout, maxRetries])

  const execute = useCallback(async (
    url: string,
    options: RequestInit = {},
    parser?: (response: Response) => Promise<T>
  ) => {
    setLoading(true)
    setError(false)

    // Safety timeout to prevent infinite loading
    const safetyTimeoutId = setTimeout(() => {
      console.warn('Safety timeout: Forcing loading to stop')
      setLoading(false)
      setError(true)
    }, safetyTimeout)

    try {
      const response = await fetchWithTimeout(url, options)
      
      if (response.ok) {
        const result = parser ? await parser(response) : await response.json()
        setData(result)
        setError(false)
      } else {
        console.error('Fetch failed:', response.status)
        setError(true)
      }
    } catch (error) {
      console.error('Error during fetch:', error)
      setError(true)
    } finally {
      clearTimeout(safetyTimeoutId)
      setLoading(false)
    }
  }, [fetchWithTimeout, safetyTimeout])

  const reset = useCallback(() => {
    setLoading(false)
    setError(false)
    setData(null)
  }, [])

  const forceStop = useCallback(() => {
    setLoading(false)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset,
    forceStop,
    isMobile
  }
}

// Hook for detecting mobile device
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}
