'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Users, Axe as Taxi, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { io } from 'socket.io-client'

export function DashboardWrapper({ stats }: { stats: any }) {
  const router = useRouter()

  const LiveMap = dynamic(() => import('@/components/LiveMap'), {
    ssr: false,
  })

  // 🔐 Auth check
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/login')
    }
  }, [router])

  // 🔌 Socket connection
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) return

    const socket = io(process.env.NEXT_PUBLIC_API_URL)

    socket.on('locationUpdate', (data) => {
      console.log('Driver Location:', data)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Drivers</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats?.activeDrivers ?? 0}
                </p>
                <p className="text-slate-500 text-xs mt-2">Across cities</p>
              </div>
              <div className="bg-blue-500/20 p-4 rounded-lg">
                <Taxi className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Customers</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {stats?.totalCustomers ?? 0}
                </p>
                <p className="text-slate-500 text-xs mt-2">This month</p>
              </div>
              <div className="bg-green-500/20 p-4 rounded-lg">
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Trips</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {stats?.activeTrips ?? 0}
                </p>
                <p className="text-slate-500 text-xs mt-2">In progress</p>
              </div>
              <div className="bg-purple-500/20 p-4 rounded-lg">
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">
                  ₹{stats?.totalRevenue ?? 0}
                </p>
                <p className="text-slate-500 text-xs mt-2">This month</p>
              </div>
              <div className="bg-yellow-500/20 p-4 rounded-lg">
                <TrendingUp className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending Bookings</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {stats?.pendingBookings ?? 0}
                </p>
                <p className="text-slate-500 text-xs mt-2">Awaiting assignment</p>
              </div>
              <div className="bg-orange-500/20 p-4 rounded-lg">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Avg Driver Rating</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {stats?.avgRating ?? '—'}
                </p>
                <p className="text-slate-500 text-xs mt-2">Out of 5 stars</p>
              </div>
              <div className="bg-pink-500/20 p-4 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </Card>

        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-900 border-slate-800 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/bookings">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Create Booking
              </Button>
            </Link>
            <Link href="/drivers">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Add Driver
              </Button>
            </Link>
            <Link href="/customers">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Add Customer
              </Button>
            </Link>
            <Link href="/settings">
              <Button className="w-full bg-slate-700 hover:bg-slate-600">
                Settings
              </Button>
            </Link>
          </div>
        </Card>
        {/* Footer */}
    
        <div className="mt-16 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Mobile Track Taxi. All rights reserved. Developed by <a href="https://www.skryptee.com">Skryptee</a> 
        </div>

      </main>
    </div>
  )
}
