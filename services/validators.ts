import { z } from 'zod'

const parseNumberFromString = z.preprocess((value) => {
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return value
}, z.number())

const isUrlString = (value: string) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export const createEventSchema = z.object({
  source: z.string().min(1),
  latitude: parseNumberFromString.optional(),
  longitude: parseNumberFromString.optional(),
  locationName: z.string().min(1).optional(),
  payload: z.record(z.unknown()).optional(),
}).refine(
  (data) =>
    (data.latitude !== undefined && data.longitude !== undefined) ||
    !!data.payload ||
    isUrlString(data.source),
  {
    message: 'Provide a valid source URL, payload object, or latitude and longitude.',
    path: ['source'],
  }
)

export type CreateEventInput = z.infer<typeof createEventSchema>
