'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { generateRandomFeedItem, generateRandomAlert, FeedItem, Alert } from '@/lib/mock-data'

interface UseRealTimeUpdatesOptions {
  feedInterval?: number
  alertInterval?: number
  enabled?: boolean
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const { feedInterval = 8000, alertInterval = 15000, enabled = true } = options

  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const feedIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const addFeedItem = useCallback(() => {
    const newItem = generateRandomFeedItem()
    setFeedItems((prev) => [newItem, ...prev.slice(0, 19)])
  }, [])

  const addAlert = useCallback(() => {
    const newAlert = generateRandomAlert()
    setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  useEffect(() => {
    if (!enabled) return

    // Feed updates
    feedIntervalRef.current = setInterval(addFeedItem, feedInterval)

    // Alert updates (less frequent)
    alertIntervalRef.current = setInterval(addAlert, alertInterval)

    return () => {
      if (feedIntervalRef.current) clearInterval(feedIntervalRef.current)
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current)
    }
  }, [enabled, feedInterval, alertInterval, addFeedItem, addAlert])

  return {
    feedItems,
    alerts,
    addFeedItem,
    addAlert,
    removeAlert,
    clearAlerts,
  }
}
