import { UserRole } from '@prisma/client'
import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from 'jsonwebtoken'
import validatedEnv from './validatedEnv'

export default class JWT {
  static get accessTokenValidityMs() {
    return Date.now() + validatedEnv.ACC_TOKEN_EXP
  }
  static get refreshTokenValidityMs() {
    return Date.now() + validatedEnv.REF_TOKEN_EXP
  }

  static readonly createAccessToken = (user: {
    id: string
    email: string
    role: UserRole
    name: string
  }) => {
    const payload = {
      email: user.email,
      role: user.role,
      name: user.name,
    }

    const accessToken = jwt.sign(payload, validatedEnv.JWT_SECRET, {
      expiresIn: this.accessTokenValidityMs,
      subject: user.id,
    })

    return accessToken
  }

  static readonly createRefreshToken = (user: { id: string }) => {
    const payload = {}

    const accessToken = jwt.sign(payload, validatedEnv.JWT_SECRET, {
      expiresIn: this.refreshTokenValidityMs,
      subject: user.id,
    })

    return accessToken
  }

  static readonly decodeToken = (token: string) => {
    const decoded = jwt.verify(token, validatedEnv.JWT_SECRET)
    return decoded as {
      email: string
      exp: number
      iat: number
      name: string
      role: UserRole
      sub: string
    }
  }

  static readonly isJWTError = (err: any): boolean => {
    return (
      err instanceof TokenExpiredError ||
      err instanceof NotBeforeError ||
      err instanceof JsonWebTokenError
    )
  }
}
