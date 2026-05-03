'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { ProfileModal } from '../modals/profile-modal'
import { NotificationsModal } from '../modals/notifications-modal'

export function Navbar() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full border-b border-white/5 transition-all duration-300 ${
        isScrolled ? 'glass bg-card/20' : 'bg-background/50'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">SX</span>
            </div>
            <span className="hidden sm:inline text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              SignalX
            </span>
          </motion.div>
        </Link>

        {/* Center - Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/">
            <motion.span
              className="text-sm text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              whileHover={{ y: -2 }}
            >
              Home
            </motion.span>
          </Link>
          <Link href="/dashboard">
            <motion.span
              className="text-sm text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              whileHover={{ y: -2 }}
            >
              Dashboard
            </motion.span>
          </Link>
          <Link href="/insights">
            <motion.span
              className="text-sm text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              whileHover={{ y: -2 }}
            >
              Insights
            </motion.span>
          </Link>
        </nav>

        {/* Right - User Menu */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-24 rounded-full bg-white/5 animate-pulse" />
          ) : user ? (
            <>
              <motion.button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={20} className="text-foreground/60" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              </motion.button>

              <motion.button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <User size={20} className="text-foreground/60" />
              </motion.button>
            </>
          ) : (
            <Link href="/auth/login" className="rounded-full border border-white/10 px-4 py-2 text-sm text-foreground/80 hover:bg-white/5 transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Modals */}
      {user && <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
      {user && <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />}
    </motion.header>
  )
}
