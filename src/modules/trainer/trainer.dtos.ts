import { z } from 'zod'

export const validateTrainerPass = z.object({
  password: z
    .string()
    .min(6)
    .max(20)
    .refine(
      (arg) => {
        const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/
        return regex.test(arg)
      },
      {
        message:
          'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      }
    ),
})

export const createTrainerDto = z.object({
  name: z.string(),
  email: z.string().email(),
})

export const getTrainerParamsDto = z.object({
  trainerId: z.string({ required_error: 'Trainer ID is required' }).uuid({
    message: 'Invalid trainer ID',
  }),
})

export const deleteTrainerParams = z.object({
  trainerId: z.string({ required_error: 'trainerId is required' }).uuid({
    message: 'Invalid trainerId',
  }),
})

export type CreateTrainerDto = z.infer<typeof createTrainerDto>
export type GetTrainerParamsDto = z.infer<typeof getTrainerParamsDto>
