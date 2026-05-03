'use client'

import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RealTimeFeed } from '@/components/dashboard/real-time-feed'
import { AIInsightsPanel } from '@/components/dashboard/ai-insights-panel'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { ChartsSection } from '@/components/dashboard/charts-section'
import { GradientBackground } from '@/components/animations/gradient-background'
import { SignalIngestionPanel } from '@/components/dashboard/signal-ingestion-panel'
import { useSignalXRealtime } from '@/hooks/use-signalx-realtime'

export default function Dashboard() {
  const { feedItems, insights, alerts, analytics, loading, error, resolveAlert } = useSignalXRealtime()

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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <DashboardLayout>
      <GradientBackground />

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-foreground/60">Real-time intelligence and decision support</p>
        </motion.div>

        {loading && (
          <div className="glass rounded-xl p-6 mb-6 border border-white/10 text-center">
            <p className="text-sm text-foreground/60">Loading live SignalX data...</p>
          </div>
        )}

        {error && (
          <div className="glass rounded-xl p-6 mb-6 border border-amber-400/20 bg-amber-500/5 text-center">
            <p className="text-sm text-amber-100">{error}</p>
          </div>
        )}

        {/* Main Grid Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Feed */}
          <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1">
            <RealTimeFeed items={feedItems} />
          </motion.div>

          {/* Center Column - Insights */}
          <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1">
            <AIInsightsPanel insights={insights} />
          </motion.div>

          {/* Right Column - Alerts */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
            <AlertsPanel alerts={alerts} onRemoveAlert={resolveAlert} />
          </motion.div>
        </motion.div>

        {/* Charts Section - Full Width */}
        <motion.div variants={itemVariants} className="mt-8">
          <SignalIngestionPanel />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <ChartsSection feedItems={feedItems} alerts={alerts} />
        </motion.div>

        {/* Footer Stats */}
        <motion.div
          variants={itemVariants}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            {
              label: 'Total signals',
              value: analytics ? analytics.total_signals.toLocaleString() : '—',
              subtitle: 'Processed by SignalX',
            },
            {
              label: 'High risk',
              value: analytics ? analytics.high_risk.toString() : '—',
              subtitle: 'Immediate attention needed',
            },
            {
              label: 'Medium risk',
              value: analytics ? analytics.medium_risk.toString() : '—',
              subtitle: 'Monitor trends',
            },
            {
              label: 'Active alerts',
              value: analytics ? analytics.active_alerts.toString() : '—',
              subtitle: 'Unresolved notifications',
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="glass rounded-lg p-4 border border-white/10"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 212, 255, 0.5)' }}
            >
              <p className="text-xs text-foreground/60 mb-2">{stat.label}</p>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <p className="mt-3 text-xs text-foreground/50">{stat.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
