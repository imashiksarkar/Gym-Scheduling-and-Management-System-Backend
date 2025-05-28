import { catchAsync, jwt, response, validatedEnv } from '@src/lib'
import { Request, Response, Router } from 'express'
import { changeUserRoleDto, signinUserDto, signupUserDto } from './auth.dtos'
import AuthService from './auth.service'
import { requireRole, requireAuth } from '@src/middlewares'
import { ReqWithUser } from '@src/middlewares/requireAuth.middleware'
import { UserRole } from '@prisma/client'

class AuthController {
  private static readonly router = Router()
  private static readonly authService: typeof AuthService = AuthService
  private static readonly getPath = (path: string) => `/auth${path}`

  /* Prepare the module */
  static get authModule() {
    try {
      const EOFIndex = Object.keys(this).indexOf('EOF') + 1 || 0
      const methods = Object.keys(this).splice(EOFIndex) // skip constructor

      methods.forEach((name) => eval(`this.${name}()`))

      return this.router
    } catch (error) {
      console.log(`Auth module error: ${error}`)
    }
  }

  private static readonly EOF = null // routes begin after line

  /* Hare are all the routes */
  private static readonly getRoles = async (path = this.getPath('/roles')) => {
    this.router.get(
      path,
      catchAsync(async (_req: Request, res: Response) => {
        const roles = await this.authService.getRoles()

        const r = response()
          .success(200)
          .data(roles)
          .message('Here are all the roles.')
          .exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly signup = async (path = this.getPath('/signup')) => {
    this.router.post(
      path,
      catchAsync(async (req: Request, res: Response) => {
        const body = await signupUserDto.parseAsync(req.body)

        const signedUpUser = await this.authService.signup(body)

        const { token } = signedUpUser
        res.cookie('accessToken', token.accessToken, {
          httpOnly: true,
          secure: validatedEnv.IS_PRODUCTION,
          sameSite: 'lax',
        })
        res.cookie('refreshToken', token.refreshToken, {
          httpOnly: true,
          secure: validatedEnv.IS_PRODUCTION,
          sameSite: 'lax',
        })

        const r = response().success(201).data(signedUpUser).exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly signin = async (path = this.getPath('/signin')) => {
    this.router.post(
      path,
      catchAsync(async (req: Request, res: Response) => {
        const body = await signinUserDto.parseAsync(req.body)
        const signedInUser = await this.authService.signin(body)

        const { token } = signedInUser
        res.cookie('accessToken', token.accessToken, {
          httpOnly: true,
          secure: validatedEnv.IS_PRODUCTION,
          sameSite: 'lax',
        })
        res.cookie('refreshToken', token.refreshToken, {
          httpOnly: true,
          secure: validatedEnv.IS_PRODUCTION,
          sameSite: 'lax',
        })

        const r = response().success(200).data(signedInUser).exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly signout = async (path = this.getPath('/signout')) => {
    this.router.delete(
      path,
      catchAsync(async (req: Request, res: Response) => {
        const refreshToken: string | undefined = req.cookies['refreshToken']

        if (refreshToken) await this.authService.signout({ refreshToken })

        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        const r = response()
          .success(200)
          .message('Signed out successfully')
          .exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly changeRole = async (
    path = this.getPath('/roles')
  ) => {
    this.router.patch(
      path,
      requireAuth(),
      requireRole(UserRole.trainer),
      catchAsync(async (req: Request, res: Response) => {
        const body = changeUserRoleDto.parse(req.body)

        const user = await this.authService.changeRole(body)

        const r = response()
          .success(200)
          .message('Role changed successfully')
          .data(user)
          .exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly refresh = async (path = this.getPath('/refresh')) => {
    this.router.post(
      path,
      catchAsync(async (req: Request, res: Response) => {
        const refreshToken: string = req.cookies['refreshToken'] ?? ''

        jwt.decodeToken(refreshToken) // throws if invalid

        const { accessToken, refreshToken: newRefreshToken } =
          await this.authService.refresh(refreshToken)

        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: validatedEnv.IS_PRODUCTION,
          sameSite: 'lax',
        })
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: validatedEnv.IS_PRODUCTION,
          sameSite: 'lax',
        })

        const r = response()
          .success(200)
          .data({ accessToken, refreshToken: newRefreshToken })
          .message('Tokens refreshed successfully')
          .exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly profile = async (path = this.getPath('/profile')) => {
    this.router.get(
      path,
      requireAuth(),
      catchAsync(async (req: ReqWithUser, res: Response) => {
        const { id } = req.locals.user

        const user = await this.authService.getUserById(id)

        if (!user) throw response().error(404).message('User not found').exec()

        const r = response().success(200).data(user).exec()
        res.status(r.code).json(r)
      })
    )
  }

  /* Admin routes end here */
  private static readonly getAllUsers = async (
    path = this.getPath('/users')
  ) => {
    this.router.get(
      path,
      requireAuth(),
      requireRole(UserRole.admin),
      catchAsync(async (_req: Request, res: Response) => {
        const users = await this.authService.getAllUsers()

        const r = response().success(200).data(users).exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly getUserById = async (
    path = this.getPath('/users/:userId')
  ) => {
    this.router.get(
      path,
      requireAuth(),
      requireRole(UserRole.admin),
      catchAsync(async (req: Request, res: Response) => {
        const user = await this.authService.getUserById(req.params.userId)

        if (!user) throw response().error(404).message('User not found').exec()

        const r = response().success(200).data(user).exec()
        res.status(r.code).json(r)
      })
    )
  }
}

export default AuthController.authModule as Router
