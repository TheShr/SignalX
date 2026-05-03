import type { ImpactLevel } from '@/lib/types'

const TIMEOUT_MS = 15000

function isUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function sanitizeJson(value: unknown): unknown {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJson(item))
  }
  if (typeof value === 'object' && value !== null) {
    const sanitized: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      sanitized[key] = sanitizeJson(item)
    }
    return sanitized
  }
  return null
}

function getPathValue(source: any, path: Array<string | number>): unknown {
  return path.reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as any)[key]
    }
    return undefined
  }, source)
}

function findMetric(raw: unknown, candidates: Array<Array<string | number>>): number | undefined {
  if (!raw || typeof raw !== 'object') {
    return undefined
  }

  for (const path of candidates) {
    const value = getPathValue(raw, path)
    const numeric = toNumber(value)
    if (numeric !== undefined) {
      return numeric
    }
  }
  return undefined
}

function crawlForNumbers(source: unknown, path: string[] = [], depth = 0, found: Record<string, number> = {}) {
  if (depth > 5 || source === null) {
    return found
  }

  if (typeof source === 'number' && Number.isFinite(source)) {
    found[path.join('.')] = source
    return found
  }

  if (typeof source === 'object') {
    if (Array.isArray(source)) {
      source.forEach((item, index) => crawlForNumbers(item, [...path, String(index)], depth + 1, found))
    } else {
      Object.entries(source).forEach(([key, value]) => crawlForNumbers(value, [...path, key], depth + 1, found))
    }
  }

  return found
}

function extractMetrics(raw: unknown) {
  const precipitation = findMetric(raw, [
    ['precipitation'],
    ['rain'],
    ['rainfall'],
    ['precip'],
    ['current_weather', 'precipitation'],
    ['hourly', 'rain_sum', 0],
    ['hourly', 'precipitation', 0],
  ])

  const temperature = findMetric(raw, [
    ['temperature'],
    ['temp'],
    ['current_weather', 'temperature'],
    ['hourly', 'temperature_2m', 0],
    ['hourly', 'temp', 0],
  ])

  const humidity = findMetric(raw, [
    ['humidity'],
    ['relativeHumidity'],
    ['relativehumidity'],
    ['current_weather', 'humidity'],
    ['hourly', 'relativehumidity_2m', 0],
  ])

  const windSpeed = findMetric(raw, [
    ['windSpeed'],
    ['wind_speed'],
    ['current_weather', 'windspeed'],
    ['hourly', 'windspeed_10m', 0],
  ])

  const discoveredNumbers = crawlForNumbers(raw)

  return {
    temperature,
    precipitation,
    humidity,
    windSpeed,
    discoveredNumbers,
  }
}

function determineImpact(metrics: ReturnType<typeof extractMetrics>): ImpactLevel {
  if (metrics.precipitation !== undefined) {
    if (metrics.precipitation >= 15) return 'HIGH'
    if (metrics.precipitation >= 8) return 'MEDIUM'
    return 'LOW'
  }

  if (metrics.temperature !== undefined) {
    if (metrics.temperature >= 38) return 'HIGH'
    if (metrics.temperature >= 30) return 'MEDIUM'
  }

  if (metrics.humidity !== undefined && metrics.humidity >= 92) {
    return 'MEDIUM'
  }

  return 'LOW'
}

function numericSummary(metrics: ReturnType<typeof extractMetrics>) {
  const items: string[] = []
  if (metrics.precipitation !== undefined) items.push(`Rain ${metrics.precipitation} mm`)
  if (metrics.temperature !== undefined) items.push(`Temp ${metrics.temperature}°C`)
  if (metrics.humidity !== undefined) items.push(`Humidity ${metrics.humidity}%`)
  if (metrics.windSpeed !== undefined) items.push(`Wind ${metrics.windSpeed} m/s`)
  if (items.length === 0 && Object.keys(metrics.discoveredNumbers).length > 0) {
    Object.entries(metrics.discoveredNumbers).slice(0, 3).forEach(([path, value]) => items.push(`${path}: ${value}`))
  }
  return items.join(' · ')
}

async function fetchJsonFromUrl(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch source URL with status ${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

function parseJsonString(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'string') {
    return null
  }

  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

async function fetchGroqInsight(rawData: unknown, parsedData: Record<string, unknown>) {
  const apiKey = process.env.GROQ_API_KEY
  const apiUrl = process.env.GROQ_API_URL ?? 'https://api.groq.com/v1/interpret'
  if (!apiKey) {
    return null
  }

  const prompt = `You are an AI analyst for real-time risk signals. Analyze the provided JSON data and return a JSON object with the keys: summary, risk, explanation, suggested_action, confidence. Use only LOW, MEDIUM, or HIGH for risk. Keep the summary concise and highlight the most critical observation. Do not include any additional text outside the JSON object.`

  const payload = {
    prompt,
    data: {
      rawData,
      parsedData,
    },
    max_tokens: 300,
    temperature: 0.2,
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Groq API returned ${response.status}`)
    }

    const data = await response.json()
    if (typeof data !== 'object' || data === null) {
      return null
    }

    const candidate = (data as any).output ?? (data as any).result ?? data
    if (typeof candidate === 'string') {
      return parseJsonString(candidate)
    }

    if (typeof candidate === 'object' && candidate !== null) {
      return candidate as Record<string, unknown>
    }

    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchOpenMeteoWeather(latitude: number, longitude: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('current_weather', 'true')
  url.searchParams.set('hourly', 'temperature_2m,relativehumidity_2m,precipitation,windspeed_10m')
  url.searchParams.set('forecast_days', '1')
  url.searchParams.set('timezone', 'auto')

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Open-Meteo request failed with status ${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

export interface ProcessedSignalPayload {
  title: string
  description: string
  impact: ImpactLevel
  metric: number
  source: string
  locationName: string | null
  processedAt: string
  weather: {
    temperature?: number
    precipitation?: number
    humidity?: number
    windSpeed?: number
  }
  rawData: Record<string, unknown>
  parsedData: Record<string, unknown>
}

export interface ProcessedSignal {
  title: string
  description: string
  impact: ImpactLevel
  metric: number
  confidence: number
  suggestedAction: string
  explanation: string
  payload: ProcessedSignalPayload
}

export async function processIncomingEvent(input: {
  source: string
  latitude?: number
  longitude?: number
  payload?: Record<string, unknown>
  locationName?: string
}): Promise<ProcessedSignal> {
  let rawData: unknown = input.payload ?? {}

  if (isUrl(input.source)) {
    rawData = await fetchJsonFromUrl(input.source)
  } else if ((input.latitude !== undefined || input.longitude !== undefined) && !input.payload) {
    if (input.latitude === undefined || input.longitude === undefined) {
      throw new Error('Both latitude and longitude are required when source is not a URL')
    }
    rawData = await fetchOpenMeteoWeather(input.latitude, input.longitude)
  }

  const metrics = extractMetrics(rawData)
  const derivedImpact = determineImpact(metrics)
  const metric = metrics.precipitation ?? metrics.temperature ?? metrics.humidity ?? metrics.windSpeed ?? 0

  const locationLabel = input.locationName ? ` in ${input.locationName}` : ''
  const summary =
    derivedImpact === 'HIGH'
      ? `Data indicates a HIGH risk${locationLabel}. Immediate attention is recommended.`
      : derivedImpact === 'MEDIUM'
      ? `Data indicates a MEDIUM risk${locationLabel}. Continue monitoring closely.`
      : `Data indicates LOW risk${locationLabel}. Conditions remain stable.`

  const explanation = [summary, numericSummary(metrics)].filter(Boolean).join(' ')
  const suggestedAction =
    derivedImpact === 'HIGH'
      ? 'Act quickly: notify stakeholders, avoid affected areas, and follow local emergency guidance.'
      : derivedImpact === 'MEDIUM'
      ? 'Continue monitoring and prepare contingency plans in case conditions worsen.'
      : 'Maintain normal operations and observe the next update.'
  const defaultConfidence = derivedImpact === 'HIGH' ? 0.95 : derivedImpact === 'MEDIUM' ? 0.82 : 0.68

  let groqResult: Record<string, unknown> | null = null
  try {
    groqResult = await fetchGroqInsight(rawData, sanitizeJson(metrics) as Record<string, unknown>)
  } catch (aiError) {
    console.warn('[processIncomingEvent] Groq request failed:', aiError)
    groqResult = null
  }

  const finalRisk = groqResult && typeof groqResult.risk === 'string' && ['HIGH', 'MEDIUM', 'LOW'].includes(groqResult.risk.toUpperCase())
    ? (groqResult.risk.toUpperCase() as ImpactLevel)
    : derivedImpact

  const finalTitle = String(groqResult?.summary ?? summary)
  const finalDescription = String(groqResult?.summary ?? summary)
  const finalExplanation = String(groqResult?.explanation ?? explanation)
  const finalSuggestedAction = String(groqResult?.suggested_action ?? suggestedAction)
  const finalConfidence = toNumber(groqResult?.confidence) ?? defaultConfidence

  return {
    title: finalTitle,
    description: finalDescription,
    impact: finalRisk,
    metric,
    confidence: finalConfidence,
    suggestedAction: finalSuggestedAction,
    explanation: finalExplanation,
    payload: {
      title: finalTitle,
      description: finalDescription,
      impact: finalRisk,
      metric,
      source: input.source,
      locationName: input.locationName ?? null,
      processedAt: new Date().toISOString(),
      weather: {
        temperature: metrics.temperature,
        precipitation: metrics.precipitation,
        humidity: metrics.humidity,
        windSpeed: metrics.windSpeed,
      },
      rawData: sanitizeJson(rawData) as Record<string, unknown>,
      parsedData: {
        metrics: {
          temperature: metrics.temperature,
          precipitation: metrics.precipitation,
          humidity: metrics.humidity,
          windSpeed: metrics.windSpeed,
        },
        discoveredNumbers: metrics.discoveredNumbers,
      },
    },
  }
}
