'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const router = useRouter()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      onClose()
      router.push('/auth/login')
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }

  if (!isOpen || !user) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed right-6 top-20 z-50 w-72 glass rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Profile</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Profile Info */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user?.email?.[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-sm text-foreground/60">{user.email}</p>
                  </div>
                </div>
                <p className="text-xs text-foreground/50">Premium Plan • Active</p>
              </div>

              {/* Menu Items */}
              <div className="space-y-2 mb-6">
                <Link href="/settings">
                  <button
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-left text-foreground/80 hover:text-foreground"
                  >
                    <Settings size={18} />
                    <span className="text-sm">Settings</span>
                  </button>
                </Link>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
