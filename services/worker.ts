import { getPendingEvents, markEventProcessing, completeEventProcessing, failEventProcessing, createInsight, createAlert, createSignal } from './db'
import { processIncomingEvent } from './ai'

const CONCURRENT_WORKERS = 3

export async function runWorkerBatch() {
  const pendingEvents = await getPendingEvents(CONCURRENT_WORKERS)

  if (pendingEvents.length === 0) {
    return []
  }

  const results = await Promise.allSettled(
    pendingEvents.map(async (event) => {
      await markEventProcessing(event.id)

      try {
        const insight = await processIncomingEvent({
          source: event.source,
          latitude: typeof event.payload?.latitude === 'number' ? event.payload.latitude : undefined,
          longitude: typeof event.payload?.longitude === 'number' ? event.payload.longitude : undefined,
          payload: (event.payload?.rawPayload ?? event.payload) as Record<string, unknown> | undefined,
          locationName: typeof event.payload?.locationName === 'string' ? event.payload.locationName : undefined,
        })

        await createSignal(event.id, event.user_id, {
          event_id: event.id,
          user_id: event.user_id,
          source: event.source,
          location_name: typeof event.payload?.locationName === 'string' ? event.payload.locationName : null,
          latitude: typeof event.payload?.latitude === 'number' ? event.payload.latitude : null,
          longitude: typeof event.payload?.longitude === 'number' ? event.payload.longitude : null,
          risk: insight.impact,
          summary: insight.description,
          temperature: insight.payload.weather?.temperature ?? null,
          precipitation: insight.payload.weather?.precipitation ?? null,
          humidity: insight.payload.weather?.humidity ?? null,
          wind_speed: insight.payload.weather?.windSpeed ?? null,
          processed_at: new Date().toISOString(),
        })

        await createInsight(event.id, event.user_id, {
          title: insight.title,
          explanation: insight.explanation,
          suggested_action: insight.suggestedAction,
          confidence: insight.confidence,
          impact: insight.impact,
        })

        if (insight.impact === 'HIGH') {
          await createAlert(event.user_id, event.id, {
            title: 'High-impact signal detected',
            message: insight.explanation,
            priority: 'CRITICAL',
            resolved: false,
          })
        }

        await completeEventProcessing(event.id)
        return { eventId: event.id, success: true }
      } catch (error) {
        await failEventProcessing(event.id, String(error))
        return { eventId: event.id, success: false, error: String(error) }
      }
    })
  )

  return results
}

export async function startWorkerLoop() {
  while (true) {
    await runWorkerBatch()
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
}
