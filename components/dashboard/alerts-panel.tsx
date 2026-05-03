'use client'

import { motion } from 'framer-motion'
import type { Alert } from '@/lib/types'
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react'

interface AlertsPanelProps {
  alerts: Alert[]
  onRemoveAlert?: (id: string) => void
}

const priorityConfig = {
  CRITICAL: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
    icon: AlertTriangle,
  },
  WARNING: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    icon: AlertCircle,
  },
  INFO: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    icon: Info,
  },
}

export function AlertsPanel({ alerts, onRemoveAlert }: AlertsPanelProps) {
  const displayAlerts = alerts

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      x: 100,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Alerts</h3>
        <span className="text-sm text-foreground/50">{displayAlerts.length} active</span>
      </div>

      <motion.div
        className="space-y-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayAlerts.map((alert) => {
          const config = priorityConfig[alert.priority]
          const Icon = config.icon

          return (
            <motion.div
              key={alert.id}
              variants={itemVariants}
              layout
              className={`glass rounded-lg p-4 border ${config.bg} ${config.border} group relative overflow-hidden`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  <Icon size={18} className={config.text} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm ${config.text} mb-1`}>{alert.title}</h4>
                  <p className="text-sm text-foreground/60">{alert.message}</p>
                  <p className="text-xs text-foreground/40 mt-2">
                    {Math.round((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                  </p>
                </div>

                {onRemoveAlert && (
                  <motion.button
                    onClick={() => onRemoveAlert(alert.id)}
                    className="flex-shrink-0 rounded p-1.5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={16} className="text-foreground/50" />
                  </motion.button>
                )}
              </div>

              {/* Animated gradient border for critical alerts */}
              {alert.priority === 'CRITICAL' && (
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    background: 'linear-gradient(45deg, rgba(239, 68, 68, 0.1) 0%, transparent 100%)',
                  }}
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {displayAlerts.length === 0 && (
        <div className="glass rounded-lg p-8 text-center border border-white/10">
          <p className="text-foreground/50">No active alerts</p>
        </div>
      )}
    </div>
  )
}
