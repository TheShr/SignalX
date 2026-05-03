import { NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/services/auth'
import { createEvent, createSignal, createInsight, createAlert, findOrCreateUser, completeEventProcessing } from '@/services/db'
import { processIncomingEvent } from '@/services/ai'
import { createEventSchema } from '@/services/validators'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = await verifyFirebaseToken(token)
    const body = await request.json()
    const result = createEventSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const user = await findOrCreateUser(decoded.uid, decoded.email ?? '')
    const event = await createEvent(user.id, {
      source: result.data.source,
      payload: {
        source: result.data.source,
        latitude: result.data.latitude,
        longitude: result.data.longitude,
        locationName: result.data.locationName ?? null,
        rawPayload: result.data.payload ?? null,
      },
    })

    const processed = await processIncomingEvent({
      source: result.data.source,
      latitude: result.data.latitude,
      longitude: result.data.longitude,
      payload: result.data.payload,
      locationName: result.data.locationName,
    })

    const signal = await createSignal(event.id, user.id, {
      event_id: event.id,
      user_id: user.id,
      source: result.data.source,
      location_name: result.data.locationName ?? null,
      latitude: result.data.latitude ?? null,
      longitude: result.data.longitude ?? null,
      risk: processed.impact,
      summary: processed.description,
      temperature: processed.payload.weather?.temperature ?? null,
      precipitation: processed.payload.weather?.precipitation ?? null,
      humidity: processed.payload.weather?.humidity ?? null,
      wind_speed: processed.payload.weather?.windSpeed ?? null,
      processed_at: new Date().toISOString(),
    })

    const insight = await createInsight(event.id, user.id, {
      title: processed.title,
      explanation: processed.explanation,
      suggested_action: processed.suggestedAction,
      confidence: processed.confidence,
      impact: processed.impact,
    })

    let alert = null
    if (processed.impact === 'HIGH') {
      alert = await createAlert(user.id, event.id, {
        title: '⚠️ High flood risk detected',
        message: processed.description,
        priority: 'CRITICAL',
        resolved: false,
      })
    }

    await completeEventProcessing(event.id)

    return NextResponse.json({
      event,
      signal,
      insight,
      alert,
      status: 'accepted',
    }, { status: 202 })
  } catch (error) {
    console.error('[API /api/events] POST error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
