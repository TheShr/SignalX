'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'alert' | 'update' | 'success'
  timestamp: string
  read: boolean
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Critical Alert',
      message: 'Unusual trading pattern detected in portfolio',
      type: 'alert',
      timestamp: '2 mins ago',
      read: false,
    },
    {
      id: '2',
      title: 'Market Update',
      message: 'Tech sector showing strong momentum',
      type: 'update',
      timestamp: '15 mins ago',
      read: false,
    },
    {
      id: '3',
      title: 'Goal Achieved',
      message: 'Your Q2 performance target has been met',
      type: 'success',
      timestamp: '1 hour ago',
      read: true,
    },
    {
      id: '4',
      title: 'Signal Generated',
      message: 'AI has generated 3 new trading signals',
      type: 'update',
      timestamp: '3 hours ago',
      read: true,
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle size={18} className="text-red-400" />
      case 'update':
        return <TrendingUp size={18} className="text-cyan-400" />
      case 'success':
        return <CheckCircle size={18} className="text-green-400" />
      default:
        return null
    }
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
            className="fixed right-6 top-20 z-50 w-96 glass rounded-2xl overflow-hidden max-h-96 flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.map((notification, idx) => (
                <motion.div
                  key={notification.id}
                  className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-white/2' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex gap-3">
                    <div className="pt-1 flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-foreground/60 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-foreground/40 mt-2">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 text-center">
              <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
