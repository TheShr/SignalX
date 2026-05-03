import { ReactNode } from 'react'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-16">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        
        {/* Main content - full width on mobile, adjusted on desktop */}
        <main className="w-full sm:ml-20 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
