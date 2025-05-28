import { UserRole } from '@prisma/client'
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

export const changeUserRoleDto = z.object(
  {
    email: z.string().email(),
    role: z.nativeEnum(UserRole).refine((role) => role.length > 0, {
      message: 'Role must not be empty',
    }),
  },
  {
    message: 'Request body required!',
  }
)

export type SignupUserDto = z.infer<typeof signupUserDto>
export type SigninUserDto = z.infer<typeof signinUserDto>
export type ChangeUserRoleDto = z.infer<typeof changeUserRoleDto>
