'use client'

import { motion } from 'framer-motion'
import type { FeedItem } from '@/lib/types'
import { Clock } from 'lucide-react'

interface RealTimeFeedProps {
  items: FeedItem[]
}

const impactColors = {
  HIGH: 'bg-red-500/20 text-red-300 border-red-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  LOW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

export function RealTimeFeed({ items }: RealTimeFeedProps) {
  const displayItems = items

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, x: -20 },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Real-Time Feed</h3>
        <div className="flex items-center gap-2 text-sm text-foreground/50">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayItems.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="glass rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all group cursor-pointer"
            whileHover={{ scale: 1.02, borderColor: 'rgba(0, 212, 255, 0.5)' }}
            layout
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm truncate group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${
                      impactColors[item.impact]
                    }`}
                  >
                    {item.impact}
                  </span>
                </div>
                <p className="text-sm text-foreground/60 line-clamp-2">{item.description}</p>
                <div className="grid gap-2 mt-2 text-xs text-foreground/40 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span>Source: {item.source}</span>
                    {item.locationName && <span>Location: {item.locationName}</span>}
                  </div>
                  <div className="flex items-center gap-1 justify-end sm:justify-start">
                    <Clock size={12} />
                    <span>
                      {Math.round((Date.now() - item.timestamp.getTime()) / 60000)}m ago
                    </span>
                  </div>
                </div>

                {(item.metric !== undefined || item.temperature !== undefined || item.precipitation !== undefined || item.humidity !== undefined || item.windSpeed !== undefined) && (
                  <div className="mt-3 grid gap-2 text-xs text-foreground/50 sm:grid-cols-2">
                    {item.precipitation !== undefined && <span>Rain: {item.precipitation} mm</span>}
                    {item.temperature !== undefined && <span>Temp: {item.temperature}°C</span>}
                    {item.humidity !== undefined && <span>Humidity: {item.humidity}%</span>}
                    {item.windSpeed !== undefined && <span>Wind: {item.windSpeed} m/s</span>}
                    {item.metric !== undefined && <span>Primary metric: {item.metric}</span>}
                  </div>
                )}
              </div>

              {/* Pulse indicator for new items */}
              {displayItems.indexOf(item) === 0 && (
                <div className="flex-shrink-0">
                  <motion.div
                    className="h-3 w-3 rounded-full bg-cyan-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {displayItems.length === 0 && (
        <div className="glass rounded-lg p-8 text-center border border-white/10">
          <p className="text-foreground/50">No feed items yet. Waiting for data...</p>
        </div>
      )}
    </div>
  )
}
