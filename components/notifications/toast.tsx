'use client'

import { motion } from 'framer-motion'
import { X, Check, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  message: string
  type?: ToastType
  duration?: number
  onClose: (id: string) => void
}

const toastConfig = {
  success: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    icon: Check,
    color: 'text-green-400',
  },
  error: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: AlertTriangle,
    color: 'text-red-400',
  },
  warning: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    icon: AlertTriangle,
    color: 'text-yellow-400',
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: Info,
    color: 'text-blue-400',
  },
}

export function Toast({
  id,
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: ToastProps) {
  const config = toastConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 50, y: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => {
        const timer = setTimeout(() => onClose(id), duration)
        return () => clearTimeout(timer)
      }}
      className={`glass rounded-lg p-4 border ${config.bg} ${config.border} flex items-center gap-3 backdrop-blur-xl`}
    >
      <Icon size={20} className={config.color} />
      <p className="text-sm text-foreground flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded hover:bg-white/10 transition-colors"
      >
        <X size={16} className="text-foreground/40" />
      </button>
    </motion.div>
  )
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} />
        </div>
      ))}
    </div>
  )
}
