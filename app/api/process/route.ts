import { NextResponse } from 'next/server'
import { runWorkerBatch } from '@/services/worker'
import { verifyFirebaseToken } from '@/services/auth'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await verifyFirebaseToken(authHeader.replace('Bearer ', ''))
    const results = await runWorkerBatch()
    const completed = results.filter((result) => result.status === 'fulfilled').length
    const failed = results.filter((result) => result.status === 'rejected').length

    return NextResponse.json({
      summary: {
        attempted: results.length,
        completed,
        failed,
      },
      results,
    })
  } catch (error) {
    console.error('[API /api/process] error:', error)
    return NextResponse.json({ error: 'Unauthorized or processing failed' }, { status: 401 })
  }
}
