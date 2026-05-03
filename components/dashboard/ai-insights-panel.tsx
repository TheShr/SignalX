'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AIInsight } from '@/lib/types'
import { ChevronDown, Zap } from 'lucide-react'

const impactColorMap = {
  HIGH: 'bg-red-500/20 text-red-300 border-red-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  LOW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

interface AIInsightsPanelProps {
  insights: AIInsight[]
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap size={20} className="text-purple-400" />
        <h3 className="text-lg font-semibold">AI Insights</h3>
      </div>

      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {insights.map((insight) => (
          <motion.div
            key={insight.id}
            variants={cardVariants}
            layout
          >
            <motion.div
              className="glass rounded-lg border border-white/10 hover:border-purple-400/50 transition-colors overflow-hidden cursor-pointer group"
              onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
              whileHover={{ scale: 1.01 }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm group-hover:text-purple-400 transition-colors">
                        {insight.title}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${
                          impactColorMap[insight.impact as keyof typeof impactColorMap] || impactColorMap.LOW
                        }`}
                      >
                        {insight.impact}
                      </span>
                    </div>

                    {/* Confidence score */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-xs">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.confidence * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                      <span className="text-xs text-foreground/50">{Math.round(insight.confidence * 100)}%</span>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: expandedId === insight.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} className="text-foreground/40" />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === insight.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-foreground/60 mb-2">EXPLANATION</p>
                        <p className="text-sm text-foreground/70">{insight.explanation}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground/60 mb-2">SUGGESTED ACTION</p>
                        <p className="text-sm text-cyan-300">{insight.suggestedAction}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
