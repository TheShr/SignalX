import { supabaseServer } from '@/lib/supabase-server'
import { CreateEventInput } from './validators'
import type { AlertRecord, EventRecord, InsightRecord, UserRecord } from '@/lib/types'

const DEFAULT_PAGE_SIZE = 20

export async function findOrCreateUser(firebaseUid: string, email: string) {
  const { data: existingUser, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('firebase_uid', firebaseUid)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (existingUser) {
    return existingUser as UserRecord
  }

  const { data, error: insertError } = await supabaseServer
    .from('users')
    .insert({ firebase_uid: firebaseUid, email })
    .select('*')
    .single()

  if (insertError) {
    throw insertError
  }

  return data as UserRecord
}

export async function createEvent(userId: string, input: CreateEventInput) {
  const { data, error } = await supabaseServer
    .from('events')
    .insert({
      user_id: userId,
      source: input.source,
      payload: input.payload ?? {},
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as EventRecord
}

export async function getPendingEvents(limit = 10) {
  const { data, error } = await supabaseServer
    .from('events')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw error
  }

  return (data ?? []) as EventRecord[]
}

export async function markEventProcessing(eventId: string) {
  const { data, error } = await supabaseServer
    .from('events')
    .update({ status: 'processing' })
    .eq('id', eventId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as EventRecord
}

export async function completeEventProcessing(eventId: string) {
  const { error } = await supabaseServer
    .from('events')
    .update({ status: 'processed' })
    .eq('id', eventId)

  if (error) {
    throw error
  }
}

export async function failEventProcessing(eventId: string, reason: string) {
  const { error } = await supabaseServer
    .from('events')
    .update({ status: 'failed', payload: { failureReason: reason } })
    .eq('id', eventId)

  if (error) {
    console.error('failed to mark event failed', error)
  }
}

export async function createInsight(
  eventId: string,
  userId: string,
  insight: Omit<InsightRecord, 'id' | 'created_at' | 'event_id' | 'user_id'>
) {
  const { data, error } = await supabaseServer
    .from('insights')
    .insert({
      event_id: eventId,
      user_id: userId,
      title: insight.title,
      explanation: insight.explanation,
      suggested_action: insight.suggested_action,
      confidence: insight.confidence,
      impact: insight.impact,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as InsightRecord
}

export async function createAlert(userId: string, eventId: string | null, alert: Omit<AlertRecord, 'id' | 'created_at' | 'user_id' | 'event_id'>) {
  const { data, error } = await supabaseServer
    .from('alerts')
    .insert({
      user_id: userId,
      event_id: eventId,
      title: alert.title,
      message: alert.message,
      priority: alert.priority,
      resolved: alert.resolved ?? false,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as AlertRecord
}

export async function fetchPaginatedInsights(userId: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const offset = (page - 1) * pageSize
  const { data, error } = await supabaseServer
    .from('insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    throw error
  }

  return (data ?? []) as InsightRecord[]
}

export async function fetchPaginatedAlerts(userId: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const offset = (page - 1) * pageSize
  const { data, error } = await supabaseServer
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    throw error
  }

  return (data ?? []) as AlertRecord[]
}

export async function fetchFeedItems(userId: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const offset = (page - 1) * pageSize
  const { data, error } = await supabaseServer
    .from('events')
    .select('id, source, payload, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    throw error
  }

  const events = (data ?? []) as Array<{
    id: string
    source: string
    payload: Record<string, any>
    status: string
    created_at: string
  }>

  return events.map((event) => ({
    id: event.id,
    title: String(event.payload.title ?? event.source ?? 'New signal'),
    description: String(event.payload.description ?? 'Event queued for processing'),
    impact: (event.payload.impact ?? 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
    timestamp: event.created_at,
    source: event.source,
  }))
}

export async function resolveAlert(alertId: string, userId: string) {
  const { data, error } = await supabaseServer
    .from('alerts')
    .update({ resolved: true })
    .eq('id', alertId)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}
