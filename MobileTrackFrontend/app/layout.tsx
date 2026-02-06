import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './(protected)/globals.css'

const geist = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mobile Track - Taxi Management',
  description: 'Professional taxi dispatch and management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.className} ${geistMono.className} font-sans antialiased bg-slate-950 text-slate-50`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
