import { z } from 'zod'

const parseNumberFromString = z.preprocess((value) => {
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return value
}, z.number())

export const createEventSchema = z.object({
  source: z.string().min(1),
  latitude: parseNumberFromString.optional(),
  longitude: parseNumberFromString.optional(),
  locationName: z.string().min(1).optional(),
  payload: z.record(z.unknown()).optional(),
}).refine(
  (data) => (
    data.latitude !== undefined && data.longitude !== undefined
  ) || !!data.payload,
  {
    message: 'Either latitude and longitude or payload must be provided',
    path: ['latitude'],
  }
)

export type CreateEventInput = z.infer<typeof createEventSchema>
