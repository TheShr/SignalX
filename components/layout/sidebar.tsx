'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Zap, BarChart3, Settings } from 'lucide-react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  const sidebarVariants = {
    open: { width: '250px', transition: { duration: 0.3 } },
    closed: { width: '80px', transition: { duration: 0.3 } },
  }

  const textVariants = {
    open: { opacity: 1, transition: { delay: 0.15, duration: 0.2 } },
    closed: { opacity: 0, transition: { duration: 0.1 } },
  }

  const navItems = [
    { name: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { name: 'Insights', icon: Zap, href: '/dashboard' },
    { name: 'Settings', icon: Settings, href: '/dashboard' },
  ]

  return (
    <motion.div
      variants={sidebarVariants}
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      className="glass fixed left-0 top-16 z-40 h-screen border-r border-white/10 bg-card/40"
    >
      <div className="flex h-full flex-col gap-6 p-4">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-primary hover:bg-white/5 transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-white/5 hover:text-primary transition-colors cursor-pointer"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <motion.span variants={textVariants} animate={isOpen ? 'open' : 'closed'}>
                  {item.name}
                </motion.span>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="border-t border-white/10 pt-4">
          <motion.div
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground/50"
            animate={isOpen ? 'open' : 'closed'}
            variants={textVariants}
          >
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Connected</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
