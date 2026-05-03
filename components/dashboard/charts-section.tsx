'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { FeedItem, Alert } from '@/lib/types'
import { TrendingUp } from 'lucide-react'

interface ChartsSectionProps {
  feedItems: FeedItem[]
  alerts: Alert[]
}

export function ChartsSection({ feedItems, alerts }: ChartsSectionProps) {
  const trendData = useMemo(() => {
    return feedItems.slice(0, 12).reverse().map((item) => ({
      time: item.processedAt?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) ?? item.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: item.precipitation ?? item.temperature ?? 0,
      risk: item.impact,
    }))
  }, [feedItems])

  const riskCounts = useMemo(() => {
    return [
      { name: 'HIGH', count: feedItems.filter((item) => item.impact === 'HIGH').length, color: '#ef4444' },
      { name: 'MEDIUM', count: feedItems.filter((item) => item.impact === 'MEDIUM').length, color: '#f59e0b' },
      { name: 'LOW', count: feedItems.filter((item) => item.impact === 'LOW').length, color: '#38bdf8' },
    ]
  }, [feedItems])

  const recentAlerts = alerts.slice(0, 10).length
  const recentSignal = feedItems[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp size={20} className="text-cyan-400" />
        <h3 className="text-lg font-semibold">Operational insights</h3>
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="glass rounded-lg p-6 border border-white/10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-foreground/60">Weather trend</p>
              <h4 className="font-semibold">Recent signal intensity</h4>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-foreground/50">Last 12</span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 14, 39, 0.92)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '10px',
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="url(#rainGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="glass rounded-lg p-6 border border-white/10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-foreground/60">Risk distribution</p>
              <h4 className="font-semibold">Current signal breakdown</h4>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-foreground/50">alerts</span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskCounts} margin={{ left: -20, right: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 14, 39, 0.92)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: '10px',
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="count" fill="#22d3ee" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-3 text-sm text-foreground/60">
            <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">Recent active alerts</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{recentAlerts}</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">Latest risk</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{recentSignal?.impact ?? 'LOW'}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
