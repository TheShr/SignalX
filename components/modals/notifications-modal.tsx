'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import type { AlertRecord } from '@/lib/types'

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const router = useRouter()
  const { user, getIdToken } = useAuth()
  const [notifications, setNotifications] = useState<AlertRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !user) {
      setNotifications([])
      setErrorMessage(null)
      return
    }

    let active = true
    const fetchNotifications = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const token = await getIdToken()
        if (!token) {
          throw new Error('Unable to verify auth token')
        }

        const response = await fetch('/api/notifications', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          const result = await response.json().catch(() => null)
          throw new Error(result?.error || 'Failed to load notifications')
        }

        const payload = await response.json()
        if (!active) {
          return
        }

        setNotifications(payload.items ?? [])
      } catch (error) {
        console.error('[v0] Notification fetch error:', error)
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load notifications')
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    fetchNotifications()
    return () => {
      active = false
    }
  }, [isOpen, user, getIdToken])

  const getIcon = (priority: AlertRecord['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return <AlertCircle size={18} className="text-red-400" />
      case 'WARNING':
        return <TrendingUp size={18} className="text-cyan-400" />
      case 'INFO':
        return <CheckCircle size={18} className="text-green-400" />
      default:
        return <AlertCircle size={18} className="text-foreground/60" />
    }
  }

  const renderTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed right-6 top-20 z-50 w-96 glass rounded-2xl overflow-hidden max-h-96 flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {errorMessage ? (
                <div className="p-6 text-sm text-red-300">{errorMessage}</div>
              ) : !user ? (
                <div className="flex h-56 flex-col items-center justify-center gap-4 p-6 text-center text-foreground/70">
                  <p>You need to sign in to view your notifications.</p>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="rounded-full bg-cyan-500 px-4 py-2 text-sm text-white hover:bg-cyan-400 transition-colors"
                  >
                    Sign in
                  </button>
                </div>
              ) : isLoading ? (
                <div className="flex h-56 items-center justify-center p-6 text-foreground/60">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center gap-2 p-6 text-center text-foreground/70">
                  <p className="font-semibold text-foreground">No notifications yet</p>
                  <p className="text-sm">Your inbox is clear. The system will post alerts here when new signals arrive.</p>
                </div>
              ) : (
                notifications.map((notification, idx) => (
                  <motion.div
                    key={notification.id}
                    className={`p-4 border-b border-white/5 transition-colors cursor-pointer ${
                      !notification.resolved ? 'bg-white/5' : ''
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex gap-3">
                      <div className="pt-1 flex-shrink-0">
                        {getIcon(notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm">
                            {notification.title}
                          </h3>
                          {!notification.resolved && (
                            <div className="h-2 w-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-foreground/60 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-foreground/40 mt-2">
                          {renderTimestamp(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/10 text-center">
              <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors disabled:cursor-not-allowed disabled:text-foreground/40" disabled={notifications.length === 0}>
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
