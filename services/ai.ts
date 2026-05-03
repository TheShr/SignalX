import type { EventRecord, ImpactLevel } from '@/lib/types'

const MAX_RETRIES = 2
const TIMEOUT_MS = 4000

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchGrokInsight(payload: Record<string, unknown>) {
  if (!process.env.GROK_API_KEY) {
    throw new Error('Missing GROK_API_KEY')
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

  const body = await response.json()
  return body
}

export async function processEvent(event: EventRecord) {
  let attempt = 0
  while (attempt <= MAX_RETRIES) {
    try {
      const insightData = await fetchGrokInsight(event.payload)
      return {
        title: insightData.title || `Signal from ${event.source}`,
        explanation:
          insightData.explanation ||
          `Automated signal analysis completed for event ${event.id}`,
        suggested_action:
          insightData.suggested_action ||
          'Review the flagged item and apply mitigation steps.',
        confidence: Number(insightData.confidence ?? 0.82),
        impact: (insightData.impact as ImpactLevel) || 'MEDIUM',
      }
    } catch (error) {
      attempt += 1
      if (attempt > MAX_RETRIES) {
        throw error
      }
      await delay(250 * attempt)
    }
  }

  return {
    title: `Fallback Insight for ${event.source}`,
    explanation: 'Insight generation failed after retries; returning fallback analysis.',
    suggested_action: 'Investigate the underlying event data manually.',
    confidence: 0.45,
    impact: 'LOW' as ImpactLevel,
  }
}
