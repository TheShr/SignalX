import { NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/services/auth'
import { fetchPaginatedAlerts, resolveAlert, findOrCreateUser } from '@/services/db'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const decoded = await verifyFirebaseToken(token)
  const user = await findOrCreateUser(decoded.uid, decoded.email ?? '')

  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20')

  const items = await fetchPaginatedAlerts(user.id, page, pageSize)
  return NextResponse.json({ items })
}

export async function PATCH(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const decoded = await verifyFirebaseToken(token)
  const user = await findOrCreateUser(decoded.uid, decoded.email ?? '')

  const body = await request.json()
  const alertId = String(body.alertId ?? '')
  if (!alertId) {
    return NextResponse.json({ error: 'Missing alertId' }, { status: 400 })
  }

  const item = await resolveAlert(alertId, user.id)
  return NextResponse.json({ item })
}
