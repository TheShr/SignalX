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
    title: String(event.title ?? event.summary ?? event.payload?.title ?? event.source ?? 'Signal event'),
    description: String(event.description ?? event.summary ?? event.payload?.description ?? 'Processed weather signal'),
    impact: (event.impact ?? event.risk ?? event.payload?.impact ?? 'LOW') as FeedItem['impact'],
    timestamp: new Date(event.processedAt ?? event.processed_at ?? event.created_at ?? event.timestamp),
    source: String(event.source ?? event.payload?.source ?? 'unknown'),
    metric: typeof event.metric === 'number'
      ? event.metric
      : typeof event.precipitation === 'number'
      ? event.precipitation
      : typeof event.temperature === 'number'
      ? event.temperature
      : undefined,
    processedAt: event.processedAt ? new Date(event.processedAt) : event.processed_at ? new Date(event.processed_at) : undefined,
    locationName: String(event.locationName ?? event.location_name ?? event.payload?.locationName ?? ''),
    temperature: typeof event.temperature === 'number' ? event.temperature : undefined,
    precipitation: typeof event.precipitation === 'number' ? event.precipitation : undefined,
    humidity: typeof event.humidity === 'number' ? event.humidity : undefined,
    windSpeed: typeof event.windSpeed === 'number' ? event.windSpeed : typeof event.wind_speed === 'number' ? event.wind_speed : undefined,
  }
}

export function useSignalXRealtime() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [alerts, setAlerts] = useState<AlertModel[]>([])
  const [analytics, setAnalytics] = useState<{
    total_signals: number
    high_risk: number
    medium_risk: number
    low_risk: number
    active_alerts: number
  } | null>(null)
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

        const [feedResponse, insightsResponse, alertsResponse, analyticsResponse, meResponse] = await Promise.all([
          fetch('/api/feed?page=1&pageSize=20', { headers: header }),
          fetch('/api/insights?page=1&pageSize=20', { headers: header }),
          fetch('/api/alerts?page=1&pageSize=20', { headers: header }),
          fetch('/api/analytics', { headers: header }),
          fetch('/api/me', { headers: header }),
        ])

        if (!feedResponse.ok || !insightsResponse.ok || !alertsResponse.ok || !analyticsResponse.ok || !meResponse.ok) {
          throw new Error('Failed to load initial signal data')
        }

        const [feedData, insightData, alertData, analyticsData, meData] = await Promise.all([
          feedResponse.json(),
          insightsResponse.json(),
          alertsResponse.json(),
          analyticsResponse.json(),
          meResponse.json(),
        ])

        if (!active) return

        const userId = meData.userId as string

        setFeedItems((feedData.items ?? []).map((item: any) => ({
          ...toFeedItem(item),
        })))
        setInsights(insightData.items ?? [])
        setAlerts((alertData.items ?? []).map((item: any) => ({
          ...item,
          timestamp: new Date(item.created_at ?? item.timestamp),
        })))
        setAnalytics(analyticsData?.summary ?? null)

        realtimeChannel = supabaseBrowser
          .channel(`realtime-${userId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'signals', filter: `user_id=eq.${userId}` },
            (payload) => {
              console.debug('[SignalXRealtime] new signal payload:', payload)
              updateBuffer.feed.push(toFeedItem(payload.new))
              setAnalytics((prev) => {
                if (!prev) return prev
                const impact = (payload.new.risk ?? payload.new.impact ?? 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW'
                return {
                  ...prev,
                  total_signals: prev.total_signals + 1,
                  high_risk: prev.high_risk + (impact === 'HIGH' ? 1 : 0),
                  medium_risk: prev.medium_risk + (impact === 'MEDIUM' ? 1 : 0),
                  low_risk: prev.low_risk + (impact === 'LOW' ? 1 : 0),
                }
              })
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
              setAnalytics((prev) => {
                if (!prev) return prev
                return {
                  ...prev,
                  active_alerts: prev.active_alerts + 1,
                }
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
    analytics,
    loading,
    error,
    resolveAlert,
  }
}
