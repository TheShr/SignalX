import type { ImpactLevel } from '@/lib/types'

const MAX_RETRIES = 2
const TIMEOUT_MS = 5000

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

function getPathValue(source: any, path: Array<string | number>): unknown {
  return path.reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as any)[key]
    }
    return undefined
  }, source)
}

function safeArrayValue(source: any, path: Array<string | number>): unknown {
  if (!source || typeof source !== 'object') {
    return undefined
  }
  return getPathValue(source, path)
}

function findMetric(raw: any, candidates: Array<Array<string | number>>): number | undefined {
  for (const path of candidates) {
    const value = safeArrayValue(raw, path)
    const numeric = toNumber(value)
    if (numeric !== undefined) {
      return numeric
    }
  }
  return undefined
}

function extractWeatherMetrics(raw: unknown) {
  const payload = raw ?? {}
  const precipitation = findMetric(payload, [
    ['precipitation'],
    ['rain'],
    ['rainfall'],
    ['precip'],
    ['current_weather', 'precipitation'],
    ['hourly', 'rain_sum', 0],
  ])

  const temperature = findMetric(payload, [
    ['temperature'],
    ['temp'],
    ['current_weather', 'temperature'],
    ['hourly', 'temperature_2m', 0],
  ])

  const humidity = findMetric(payload, [
    ['humidity'],
    ['relativehumidity'],
    ['current_weather', 'humidity'],
    ['hourly', 'relativehumidity_2m', 0],
  ])

  const windSpeed = findMetric(payload, [
    ['windSpeed'],
    ['wind_speed'],
    ['current_weather', 'windspeed'],
  ])

  return { precipitation, temperature, humidity, windSpeed }
}

function determineImpact(metrics: ReturnType<typeof extractWeatherMetrics>): ImpactLevel {
  if (metrics.precipitation !== undefined) {
    if (metrics.precipitation >= 12) {
      return 'HIGH'
    }
    if (metrics.precipitation >= 6) {
      return 'MEDIUM'
    }
    return 'LOW'
  }

  if (metrics.temperature !== undefined) {
    if (metrics.temperature >= 35) {
      return 'HIGH'
    }
    if (metrics.temperature >= 28) {
      return 'MEDIUM'
    }
  }

  if (metrics.humidity !== undefined && metrics.humidity >= 90) {
    return 'MEDIUM'
  }

  return 'LOW'
}

function getMetricDisplay(metrics: ReturnType<typeof extractWeatherMetrics>) {
  if (metrics.precipitation !== undefined) {
    return metrics.precipitation
  }
  if (metrics.temperature !== undefined) {
    return metrics.temperature
  }
  if (metrics.humidity !== undefined) {
    return metrics.humidity
  }
  return 0
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

async function fetchJsonFromWebhook(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Webhook fetch failed with status ${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchGrokInsight(payload: Record<string, unknown>) {
  if (!process.env.GROK_API_KEY) {
    return null
  }

  const url = 'https://api.grok.example/v1/insights'
  const response = await Promise.race([
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({ input: payload }),
    }),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Grok request timed out')), TIMEOUT_MS)
    ),
  ])

  if (!response.ok) {
    throw new Error(`Grok service error ${response.status}`)
  }

  return await response.json()
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
  const rawData = input.latitude !== undefined && input.longitude !== undefined
    ? await fetchOpenMeteoWeather(input.latitude, input.longitude)
    : input.payload ?? {}

  const metrics = extractWeatherMetrics(rawData)
  const impact = determineImpact(metrics)
  const riskValue = metrics.precipitation ?? 0
  const metric = getMetricDisplay(metrics)

  const title = `Flood risk analysis for ${input.locationName ?? input.source}`
  const locationLabel = input.locationName ? ` in ${input.locationName}` : ''
  const summary =
    impact === 'HIGH'
      ? `Heavy rainfall detected${locationLabel}. Flood risk is HIGH and local response is required.`
      : impact === 'MEDIUM'
      ? `Moderate rain is expected${locationLabel}. Flood risk is MEDIUM, stay prepared.`
      : `Weather conditions are stable${locationLabel}. Flood risk remains LOW.`

  const details = [`Risk: ${impact}`]
  if (metrics.precipitation !== undefined) {
    details.push(`Rain: ${metrics.precipitation} mm`)
  }
  if (metrics.temperature !== undefined) {
    details.push(`Temp: ${metrics.temperature}°C`)
  }
  if (metrics.humidity !== undefined) {
    details.push(`Humidity: ${metrics.humidity}%`)
  }

  const explanation = `${summary} ${details.join(' · ')}.`
  const suggestedAction =
    impact === 'HIGH'
      ? 'Avoid low-lying roads, stay indoors, and follow local emergency guidance.'
      : impact === 'MEDIUM'
      ? 'Monitor conditions closely and prepare to move to higher ground if needed.'
      : 'Continue normal operations while observing the next update.'
  const confidence = impact === 'HIGH' ? 0.96 : impact === 'MEDIUM' ? 0.84 : 0.72

  const processedPayload = {
    title,
    description: summary,
    impact,
    metric,
    locationName: input.locationName ?? null,
    weather: {
      temperature: metrics.temperature,
      precipitation: metrics.precipitation,
      humidity: metrics.humidity,
      windSpeed: metrics.windSpeed,
    },
    processedAt: new Date().toISOString(),
  }

  const grokUpdate = await (async () => {
    try {
      const grokResult = await fetchGrokInsight({
        source: input.source,
        metrics,
        impact,
        rawData,
      })
      if (grokResult && typeof grokResult === 'object') {
        return {
          title: String(grokResult.title ?? title),
          description: String(grokResult.explanation ?? summary),
          explanation: String(grokResult.explanation ?? explanation),
          suggestedAction: String(grokResult.suggested_action ?? suggestedAction),
          confidence: Number(grokResult.confidence ?? confidence),
        }
      }
    } catch (error) {
      console.warn('[processIncomingEvent] Groq enrichment failed:', error)
    }
    return null
  })()

  const finalTitle = grokUpdate?.title ?? title
  const finalDescription = grokUpdate?.description ?? summary
  const finalExplanation = grokUpdate?.explanation ?? explanation
  const finalSuggestedAction = grokUpdate?.suggestedAction ?? suggestedAction
  const finalConfidence = grokUpdate?.confidence ?? confidence

  return {
    title: finalTitle,
    description: finalDescription,
    impact,
    metric,
    confidence: finalConfidence,
    suggestedAction: finalSuggestedAction,
    explanation: finalExplanation,
    payload: {
      title: finalTitle,
      description: finalDescription,
      impact,
      metric,
      weather: processedPayload.weather,
      source: input.source,
      locationName: input.locationName ?? null,
      processedAt: processedPayload.processedAt,
    },
  }
}
