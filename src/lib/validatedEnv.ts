import { config } from 'dotenv'
import z from 'zod'

config({
  path: './.env',
})

const validatedEnv = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production', 'dev', 'prod'])
      .default('test'),
    PORT: z.coerce.number().default(3000),
    JWT_SECRET: z.string().trim().min(2),
    DB_URL: z.string().trim().min(2),
    ACC_TOKEN_EXP: z.coerce.number(),
    REF_TOKEN_EXP: z.coerce.number(),
  })
  .transform((oldEnvs) => ({
    ...oldEnvs,
    IS_PRODUCTION:
      oldEnvs.NODE_ENV === 'production' || oldEnvs.NODE_ENV === 'prod',
    IS_DEVELOPMENT:
      oldEnvs.NODE_ENV === 'development' || oldEnvs.NODE_ENV === 'dev',
    IS_TEST: oldEnvs.NODE_ENV === 'test',
  }))

export default validatedEnv.parse(process.env)
