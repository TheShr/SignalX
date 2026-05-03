'use client'

import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Bell, Lock, Zap, BarChart3, Database, Mail } from 'lucide-react'
import { useState } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

interface SettingItem {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  type: 'toggle' | 'select' | 'input'
  value?: any
}

const settingsSections = [
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      {
        id: 'alerts',
        title: 'Critical Alerts',
        description: 'Get notified for critical market events',
        type: 'toggle',
        value: true,
      },
      {
        id: 'daily',
        title: 'Daily Summary',
        description: 'Receive daily performance summary',
        type: 'toggle',
        value: true,
      },
      {
        id: 'email-notifications',
        title: 'Email Notifications',
        description: 'Send important updates to email',
        type: 'toggle',
        value: false,
      },
    ],
  },
  {
    title: 'AI Preferences',
    icon: Zap,
    items: [
      {
        id: 'confidence',
        title: 'Minimum Confidence Level',
        description: 'Only execute signals above this threshold',
        type: 'select',
        value: '85%',
      },
      {
        id: 'frequency',
        title: 'Decision Frequency',
        description: 'How often AI makes decisions',
        type: 'select',
        value: 'Real-time',
      },
      {
        id: 'risk-profile',
        title: 'Risk Profile',
        description: 'Conservative, Moderate, or Aggressive',
        type: 'select',
        value: 'Moderate',
      },
    ],
  },
  {
    title: 'Data & Privacy',
    icon: Lock,
    items: [
      {
        id: 'data-retention',
        title: 'Data Retention Period',
        description: 'How long to keep historical data',
        type: 'select',
        value: '2 Years',
      },
      {
        id: 'analytics',
        title: 'Usage Analytics',
        description: 'Help improve SignalX with usage data',
        type: 'toggle',
        value: true,
      },
      {
        id: 'api-key',
        title: 'API Key',
        description: 'Manage your API access',
        type: 'input',
        value: 'sk-***',
      },
    ],
  },
  {
    title: 'Performance',
    icon: BarChart3,
    items: [
      {
        id: 'auto-optimize',
        title: 'Auto Optimization',
        description: 'Automatically optimize model parameters',
        type: 'toggle',
        value: true,
      },
      {
        id: 'caching',
        title: 'Enable Caching',
        description: 'Cache predictions for faster responses',
        type: 'toggle',
        value: true,
      },
      {
        id: 'batch-size',
        title: 'Batch Processing Size',
        description: 'Number of records to process at once',
        type: 'select',
        value: '1000',
      },
    ],
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({
    alerts: true,
    daily: true,
    'email-notifications': false,
    confidence: '85%',
    frequency: 'Real-time',
    'risk-profile': 'Moderate',
    'data-retention': '2 Years',
    analytics: true,
    'api-key': 'sk-***',
    'auto-optimize': true,
    caching: true,
    'batch-size': '1000',
  })

  const handleToggle = (id: string) => {
    setSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-foreground/60">Configure your SignalX preferences and AI behavior</p>
          </motion.div>

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIdx) => {
            const SectionIcon = section.icon
            return (
              <motion.div
                key={sectionIdx}
                variants={itemVariants}
                className="space-y-4"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <SectionIcon size={20} className="text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                </div>

                {/* Section Items */}
                <div className="glass rounded-xl divide-y divide-white/10">
                  {section.items.map((item, itemIdx) => (
                    <motion.div
                      key={item.id}
                      className="p-5 hover:bg-white/5 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <p className="text-sm text-foreground/60 mt-1">{item.description}</p>
                        </div>

                        {/* Control */}
                        {item.type === 'toggle' && (
                          <motion.button
                            onClick={() => handleToggle(item.id)}
                            className={`relative h-7 w-12 rounded-full transition-colors ${
                              settings[item.id] ? 'bg-cyan-500' : 'bg-white/10'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.div
                              className="absolute h-6 w-6 rounded-full bg-white top-0.5"
                              animate={{
                                left: settings[item.id] ? '26px' : '2px',
                              }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          </motion.button>
                        )}

                        {item.type === 'select' && (
                          <select
                            defaultValue={String(item.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value={String(item.value)}>{String(item.value)}</option>
                          </select>
                        )}

                        {item.type === 'input' && (
                          <input
                            type="password"
                            defaultValue={String(item.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 w-40"
                            readOnly
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex gap-4 pt-6">
            <motion.button
              className="px-6 py-3 rounded-lg bg-cyan-500 text-background font-semibold hover:bg-cyan-600 transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Changes
            </motion.button>
            <motion.button
              className="px-6 py-3 rounded-lg bg-white/5 text-foreground font-semibold hover:bg-white/10 transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset to Defaults
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
