export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW'
export type AlertPriority = 'CRITICAL' | 'WARNING' | 'INFO'

export interface EventRecord {
  id: string
  user_id: string
  source: string
  payload: Record<string, unknown>
  status: 'pending' | 'processing' | 'processed' | 'failed'
  created_at: string
  updated_at: string
}

export interface SignalRecord {
  id: string
  event_id: string
  user_id: string
  source: string
  location_name: string | null
  latitude: number | null
  longitude: number | null
  risk: 'HIGH' | 'MEDIUM' | 'LOW'
  summary: string
  temperature: number | null
  precipitation: number | null
  humidity: number | null
  wind_speed: number | null
  raw_data: Record<string, unknown> | null
  parsed_data: Record<string, unknown> | null
  processed_at: string
  created_at: string
}

export interface InsightRecord {
  id: string
  event_id: string
  user_id: string
  title: string
  explanation: string
  suggested_action: string
  confidence: number
  impact: ImpactLevel
  created_at: string
}

export interface AlertRecord {
  id: string
  user_id: string
  event_id: string | null
  title: string
  message: string
  priority: AlertPriority
  resolved: boolean
  created_at: string
}

export interface UserRecord {
  id: string
  firebase_uid: string
  email: string
  created_at: string
}

export interface FeedItem {
  id: string
  title: string
  description: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  timestamp: Date
  source: string
  metric?: number
  processedAt?: Date
  locationName?: string
  temperature?: number
  precipitation?: number
  humidity?: number
  windSpeed?: number
  rawData?: Record<string, unknown> | null
  parsedData?: Record<string, unknown> | null
  weather?: {
    temperature?: number
    precipitation?: number
    humidity?: number
    windSpeed?: number
  }
}

export interface AIInsight {
  id: string
  title: string
  impact: string
  explanation: string
  suggestedAction: string
  confidence: number
}

export interface Alert {
  id: string
  title: string
  message: string
  priority: 'CRITICAL' | 'WARNING' | 'INFO'
  timestamp: Date
  resolved: boolean
}
