import { z } from 'zod'

export const signupUserDto = z.object({
  name: z.string(),
  email: z.string().email(),
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

export const signinUserDto = z.object({
  email: z.string({ required_error: 'Email is required' }).email({
    message: 'Invalid email',
  }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, {
      message: 'Password must be at least 6 characters',
    })
    .max(20, {
      message: 'Password must be at most 20 characters',
    })
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

export const createTrainerDto = signupUserDto.omit({ password: true })

export type SignupUserDto = z.infer<typeof signupUserDto>
export type SigninUserDto = z.infer<typeof signinUserDto>
export type CreateTrainerDto = z.infer<typeof createTrainerDto>
