'use client'

import { useEffect, useState } from 'react'
import { DashboardWrapper } from '../dashboard-wrapper'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)

useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`
      )

      const data = await res.json()

      if (!res.ok) {
        console.error('Backend error:', data)
        return
      }

      setStats(data.stats)
    } catch (error) {
      console.error('Fetch error:', error)
    }
  }

  fetchStats()
}, [])

  return <DashboardWrapper stats={stats} />
}
