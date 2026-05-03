import { NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/services/auth'
import { createEvent, findOrCreateUser } from '@/services/db'
import { createEventSchema } from '@/services/validators'

export async function POST(request: Request) {
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
  const event = await createEvent(user.id, result.data)
  return NextResponse.json({ event, status: 'accepted' }, { status: 202 })
}
