import { NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/services/auth'
import { fetchRecentNotifications, findOrCreateUser } from '@/services/db'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const decoded = await verifyFirebaseToken(token)
  const user = await findOrCreateUser(decoded.uid, decoded.email ?? '')

  const items = await fetchRecentNotifications(user.id, 10)
  return NextResponse.json({ items })
}
