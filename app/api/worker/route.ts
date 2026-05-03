import { NextResponse } from 'next/server'
import { runWorkerBatch } from '@/services/worker'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = await runWorkerBatch()
  return NextResponse.json({ results })
}
