import { z } from 'zod'

const startTimeOffset = 5 * 60 * 1000 // 5 minutes
const endTimeOffset = 2 * 60 * 60 * 1000 // 2 hours

export const createScheduleDto = z
  .object({
    startsAt: z
      .string({ required_error: 'Start time is required' })
      .datetime({
        message: 'Invalid start time',
      })
      .refine(
        (val) => new Date(val).getTime() >= Date.now() + startTimeOffset,
        { message: 'Start time must be 5 minutes in the future' }
      ),
    title: z.string({ required_error: 'Title is required' }).min(3, {
      message: 'Title must be at least 3 characters',
    }),
    trainerId: z.string({ required_error: 'Trainer ID is required' }).uuid({
      message: 'Invalid trainer ID',
    }),
  })
  .transform((data) => ({
    ...data,
    endsAt: new Date(
      new Date(data.startsAt).getTime() + endTimeOffset
    ).toISOString(),
  }))

export const scheduleParamsDto = z.object({
  scheduleId: z.string({ required_error: 'Schedule id is required!' }).uuid(),
})

export type CreateScheduleDto = z.infer<typeof createScheduleDto>
export type ScheduleParamsDto = z.infer<typeof scheduleParamsDto>
