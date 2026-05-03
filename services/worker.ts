import { getPendingEvents, markEventProcessing, completeEventProcessing, failEventProcessing, createInsight, createAlert } from './db'
import { processEvent } from './ai'

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
        const insight = await processEvent(event)
        await createInsight(event.id, event.user_id, insight)

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
