'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useAuth } from '@/contexts/auth-context'
import type { FeedItem, AIInsight, Alert as AlertModel } from '@/lib/types'

const MAX_BUFFER = 20
const DEBOUNCE_MS = 300

function toFeedItem(event: any): FeedItem {
  return {
    id: event.id,
    title: String(event.payload?.title ?? event.source ?? 'Signal event'),
    description: String(event.payload?.description ?? 'Queued event'),
    impact: (event.payload?.impact ?? 'LOW') as FeedItem['impact'],
    timestamp: new Date(event.created_at),
    source: event.source,
  }
}

export function useSignalXRealtime() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [alerts, setAlerts] = useState<AlertModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getIdToken, loading: authLoading } = useAuth()

  const resolveAlert = async (alertId: string) => {
    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error('Authenticate before resolving alerts')
      }

      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alertId }),
      })

      if (!response.ok) {
        throw new Error('Failed to resolve alert')
      }

      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
    } catch (resolveError) {
      console.error(resolveError)
    }
  }

  const updateBuffer = useMemo(() => ({
    feed: [] as FeedItem[],
    insights: [] as AIInsight[],
    alerts: [] as AlertModel[],
    timer: 0 as number | null,
  }), [])

  const flushBuffer = () => {
    setFeedItems((prev) => {
      const merged = [...updateBuffer.feed, ...prev].slice(0, MAX_BUFFER)
      updateBuffer.feed = []
      return merged
    })

    setInsights((prev) => {
      const merged = [...updateBuffer.insights, ...prev].slice(0, MAX_BUFFER)
      updateBuffer.insights = []
      return merged
    })

    setAlerts((prev) => {
      const merged = [...updateBuffer.alerts, ...prev].slice(0, MAX_BUFFER)
      updateBuffer.alerts = []
      return merged
    })

    if (updateBuffer.timer) {
      window.clearTimeout(updateBuffer.timer)
      updateBuffer.timer = null
    }
  }

  useEffect(() => {
    if (authLoading) {
      setLoading(true)
      return
    }

    let active = true
    let realtimeChannel: any = null

    async function loadInitial() {
      try {
        const token = await getIdToken()
        if (!token) {
          throw new Error('Authenticate before loading data')
        }

        const header = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }

        const [feedResponse, insightsResponse, alertsResponse, meResponse] = await Promise.all([
          fetch('/api/feed?page=1&pageSize=20', { headers: header }),
          fetch('/api/insights?page=1&pageSize=20', { headers: header }),
          fetch('/api/alerts?page=1&pageSize=20', { headers: header }),
          fetch('/api/me', { headers: header }),
        ])

        if (!feedResponse.ok || !insightsResponse.ok || !alertsResponse.ok || !meResponse.ok) {
          throw new Error('Failed to load initial signal data')
        }

        const [feedData, insightData, alertData, meData] = await Promise.all([
          feedResponse.json(),
          insightsResponse.json(),
          alertsResponse.json(),
          meResponse.json(),
        ])

        if (!active) return

        const userId = meData.userId as string

        setFeedItems((feedData.items ?? []).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })))
        setInsights(insightData.items ?? [])
        setAlerts((alertData.items ?? []).map((item: any) => ({
          ...item,
          timestamp: new Date(item.created_at ?? item.timestamp),
        })))

        realtimeChannel = supabaseBrowser
          .channel(`realtime-${userId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'events', filter: `user_id=eq.${userId}` },
            (payload) => {
              console.debug('[SignalXRealtime] new event payload:', payload)
              updateBuffer.feed.push(toFeedItem(payload.new))
              if (!updateBuffer.timer) {
                updateBuffer.timer = window.setTimeout(flushBuffer, DEBOUNCE_MS)
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'insights', filter: `user_id=eq.${userId}` },
            (payload) => {
              updateBuffer.insights.push({
                id: payload.new.id,
                title: payload.new.title,
                impact: payload.new.impact,
                explanation: payload.new.explanation,
                suggestedAction: payload.new.suggested_action,
                confidence: payload.new.confidence,
              })
              if (!updateBuffer.timer) {
                updateBuffer.timer = window.setTimeout(flushBuffer, DEBOUNCE_MS)
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'alerts', filter: `user_id=eq.${userId}` },
            (payload) => {
              updateBuffer.alerts.push({
                id: payload.new.id,
                title: payload.new.title,
                message: payload.new.message,
                priority: payload.new.priority,
                timestamp: new Date(payload.new.created_at),
                resolved: payload.new.resolved,
              })
              if (!updateBuffer.timer) {
                updateBuffer.timer = window.setTimeout(flushBuffer, DEBOUNCE_MS)
              }
            }
          )
          .subscribe()
      } catch (loadError) {
        setError(String(loadError))
      } finally {
        setLoading(false)
      }
    }

    loadInitial()

    return () => {
      active = false
      if (updateBuffer.timer) window.clearTimeout(updateBuffer.timer)
      if (realtimeChannel) {
        void supabaseBrowser.removeChannel(realtimeChannel)
      }
    }
  }, [getIdToken, authLoading, updateBuffer])

  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent
      const newEvent = customEvent.detail
      if (!newEvent || typeof newEvent !== 'object') {
        return
      }

      const feedItem = toFeedItem(newEvent)
      setFeedItems((prev) => {
        if (prev.some((item) => item.id === feedItem.id)) {
          return prev
        }
        return [feedItem, ...prev].slice(0, MAX_BUFFER)
      })
    }

    window.addEventListener('signalx:new-event', listener)
    return () => window.removeEventListener('signalx:new-event', listener)
  }, [])

  return {
    feedItems,
    insights,
    alerts,
    loading,
    error,
    resolveAlert,
  }
}
