'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Drivers', path: '/drivers' },
    { label: 'Customers', path: '/customers' },
    { label: 'Bookings', path: '/bookings' },
    { label: 'Settings', path: '/settings' },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <div className="w-64 bg-slate-900 min-h-screen border-r border-slate-800 flex flex-col">

      {/* Top Section */}
      <div className="p-6">
        <h1 className="text-white text-xl font-bold mb-8">
          Mobile Track
        </h1>

        <nav className="flex flex-col gap-3">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className={`px-4 py-3 rounded-md transition ${
                pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section (Logout) */}
      <div className="mt-auto p-6 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-md text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

    </div>
  )
}
