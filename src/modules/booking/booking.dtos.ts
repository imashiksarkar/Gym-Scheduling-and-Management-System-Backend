import { z } from 'zod'

export const createBookingDto = z.object({
  scheduleId: z.string({ required_error: 'Schedule ID is required' }).uuid({
    message: 'Invalid schedule ID',
  }),
})

export type CreateBookingDto = z.infer<typeof createBookingDto>
