'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the agent dashboard
    router.replace('/agent/dashboard')
  }, [router])

  return null
}
