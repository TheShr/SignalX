'use client'

import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Brain, Zap, Target } from 'lucide-react'

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

const chartData = [
  { date: 'Jan', accuracy: 78, confidence: 82, roi: 12 },
  { date: 'Feb', accuracy: 82, confidence: 85, roi: 18 },
  { date: 'Mar', accuracy: 85, confidence: 88, roi: 22 },
  { date: 'Apr', accuracy: 88, confidence: 91, roi: 28 },
  { date: 'May', accuracy: 91, confidence: 93, roi: 35 },
  { date: 'Jun', accuracy: 93, confidence: 95, roi: 42 },
]

const correlationData = [
  { metric: 'Volume', value: 45 },
  { metric: 'Volatility', value: 62 },
  { metric: 'Momentum', value: 78 },
  { metric: 'Trend', value: 85 },
  { metric: 'Sentiment', value: 71 },
]

const performanceMetrics = [
  { icon: Brain, label: 'AI Accuracy', value: '93%', change: '+5%' },
  { icon: Zap, label: 'Decision Speed', value: '45ms', change: '-10ms' },
  { icon: Target, label: 'Win Rate', value: '76%', change: '+8%' },
  { icon: TrendingUp, label: 'Avg Return', value: '42%', change: '+12%' },
]

export default function InsightsPage() {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Insights & Analytics</h1>
            <p className="text-foreground/60">Deep dive into AI decision patterns and performance metrics</p>
          </motion.div>

          {/* Performance Metrics Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {performanceMetrics.map((metric, idx) => {
              const Icon = metric.icon
              return (
                <motion.div
                  key={idx}
                  className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon size={20} className="text-cyan-400" />
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/60 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Charts Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy & Confidence Trend */}
            <motion.div className="glass rounded-xl p-6" whileHover={{ y: -2 }}>
              <h3 className="text-lg font-semibold text-foreground mb-4">Model Performance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f1330', border: '1px solid #1a2340' }}
                    labelStyle={{ color: '#e6e6fa' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#00d4ff" strokeWidth={2} />
                  <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* ROI Trend */}
            <motion.div className="glass rounded-xl p-6" whileHover={{ y: -2 }}>
              <h3 className="text-lg font-semibold text-foreground mb-4">Return on Investment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f1330', border: '1px solid #1a2340' }}
                    labelStyle={{ color: '#e6e6fa' }}
                  />
                  <Area type="monotone" dataKey="roi" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Feature Correlation */}
            <motion.div className="glass rounded-xl p-6 lg:col-span-2" whileHover={{ y: -2 }}>
              <h3 className="text-lg font-semibold text-foreground mb-4">Feature Correlation with Outcomes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                  <XAxis dataKey="metric" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f1330', border: '1px solid #1a2340' }}
                    labelStyle={{ color: '#e6e6fa' }}
                  />
                  <Bar dataKey="value" fill="#00d4ff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>

          {/* Insights Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Top Signal',
                value: 'BUY / MSFT',
                desc: 'Confidence: 94%',
                color: 'from-green-500/20 to-emerald-500/10',
              },
              {
                title: 'Risk Level',
                value: 'MODERATE',
                desc: 'Portfolio volatility up 8%',
                color: 'from-yellow-500/20 to-orange-500/10',
              },
              {
                title: 'Market Sentiment',
                value: 'BULLISH',
                desc: '73% positive indicators',
                color: 'from-blue-500/20 to-cyan-500/10',
              },
            ].map((insight, idx) => (
              <motion.div
                key={idx}
                className={`glass rounded-xl p-6 bg-gradient-to-br ${insight.color}`}
                whileHover={{ y: -4 }}
              >
                <p className="text-sm text-foreground/60 mb-2">{insight.title}</p>
                <p className="text-2xl font-bold text-foreground mb-2">{insight.value}</p>
                <p className="text-xs text-foreground/50">{insight.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
