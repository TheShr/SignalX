import { z } from 'zod'

export const createEventSchema = z.object({
  source: z.string().min(1),
  payload: z.record(z.unknown()).optional(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
