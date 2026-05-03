import { NextResponse } from 'next/server'
import { runWorkerBatch } from '@/services/worker'

const getAuthHeader = (request: Request) => {
  const bearer = request.headers.get('authorization')
  if (bearer) {
    return bearer
  }
  const schedulerSecret = request.headers.get('x-scheduler-secret')
  if (schedulerSecret) {
    return `Bearer ${schedulerSecret}`
  }
  return null
}

const isAuthorized = (authHeader: string | null) => {
  if (!authHeader) {
    return false
  }

  const validHeaders = new Set<string>()
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    validHeaders.add(`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`)
  }
  if (process.env.WORKER_TRIGGER_SECRET) {
    validHeaders.add(`Bearer ${process.env.WORKER_TRIGGER_SECRET}`)
  }

  return validHeaders.has(authHeader)
}

const handleWorkerTrigger = async (request: Request) => {
  const authHeader = getAuthHeader(request)
  if (!isAuthorized(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
}

export async function GET(request: Request) {
  return handleWorkerTrigger(request)
}

export async function POST(request: Request) {
  return handleWorkerTrigger(request)
}
