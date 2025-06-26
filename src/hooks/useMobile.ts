'use client'

import { useState, useEffect } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
      const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword))
      const isMobileScreen = window.innerWidth <= 768
      
      setIsMobile(isMobileUA || isMobileScreen)
      setIsLoaded(true)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile, isLoaded }
}

export function getMobileInfo() {
  if (typeof window === 'undefined') return null
  
  return {
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    connection: (navigator as any).connection?.effectiveType || 'unknown'
  }
}
