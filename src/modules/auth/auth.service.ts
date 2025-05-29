import { UserRole } from '@prisma/client'
import { db } from '@src/config'
import { Hashing, jwt, response } from '@src/lib'
import { SigninUserDto, SignupUserDto } from './auth.dtos'

export default class AuthService {
  static readonly createTrainer = async (userAttr: SignupUserDto) => {
    const trainer = await db.user.findFirst({
      where: {
        email: userAttr.email,
      },
    })

    if (trainer)
      throw response().error(409).message('User already exists').exec()

    const hashedPassword = await Hashing.hash(userAttr.password)

    const user = await db.user.create({
      data: { ...userAttr, password: hashedPassword, role: UserRole.trainer },
      omit: {
        password: true,
      },
    })

    if (!user)
      throw response().error(500).message('Something went wrong').exec()

    return user
  }

  static readonly listAllTrainers = async () => {
    const trainers = await db.user.findMany({
      where: { role: UserRole.trainer },
      omit: {
        password: true,
      },
    })

    return trainers
  }

  static readonly signup = async (userAttr: SignupUserDto) => {
    const existingUser = await db.user.findFirst({
      where: {
        email: userAttr.email,
      },
    })

    if (existingUser)
      throw response().error(409).message('User already exists').exec()

    const hashedPassword = await Hashing.hash(userAttr.password)
    userAttr.password = hashedPassword

    const user = await db.user.create({
      data: userAttr,
      omit: {
        password: true,
      },
    })

    if (!user)
      throw response().error(500).message('Something went wrong').exec()

    const accessToken = jwt.createAccessToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

    const refreshToken = jwt.createRefreshToken({
      id: user.id,
    })

    // save refresh token to db
    await db.token.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(jwt.refreshTokenValidityMs),
      },
    })

    return {
      ...user,
      token: {
        accessToken,
        refreshToken,
      },
    }
  }

  static readonly signin = async (userAttr: SigninUserDto) => {
    const existingUser = await db.user.findFirst({
      where: {
        email: userAttr.email,
      },
    })

    if (!existingUser)
      throw response().error(401).message('Invalid credentials').exec()

    const isValidPassword = await Hashing.verify(
      userAttr.password,
      existingUser.password
    )

    if (!isValidPassword)
      throw response().error(401).message('Invalid credentials').exec()

    const { id, name, email, role } = existingUser
    const accessToken = jwt.createAccessToken({
      id,
      name,
      email,
      role,
    })

    const refreshToken = jwt.createRefreshToken({
      id,
    })

    // save refresh token to db
    await db.token.create({
      data: {
        userId: id,
        token: refreshToken,
        expiresAt: new Date(jwt.refreshTokenValidityMs),
      },
    })

    const { password, ...user } = existingUser
    return {
      ...user,
      token: {
        accessToken,
        refreshToken,
      },
    }
  }

  static readonly signout = async (userAttr: { refreshToken: string }) => {
    return await db.token.delete({
      where: {
        token: userAttr.refreshToken,
      },
    })
  }

  static readonly getRoles = async () => UserRole

  static readonly refresh = async (refreshToken: string) => {
    const deletedToken = await db.token.delete({
      where: {
        token: refreshToken,
      },
    })

    if (!deletedToken)
      throw response().error(401).message('Refresh token is missing.').exec()

    const user = await db.user.findFirst({
      where: {
        id: deletedToken.userId,
      },
      omit: {
        password: true,
      },
    })

    if (!user) throw response().error(401).message('User not found').exec()

    const { email, id, name, role } = user
    const accessToken = jwt.createAccessToken({
      id,
      name,
      email,
      role,
    })

    const newRefreshToken = jwt.createRefreshToken({
      id,
    })

    // save refresh token to db
    await db.token.create({
      data: {
        userId: deletedToken.userId,
        token: newRefreshToken,
        expiresAt: new Date(jwt.refreshTokenValidityMs),
      },
    })

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  static readonly getAllUsers = async () => {
    const users = await db.user.findMany({
      omit: {
        password: true,
      },
    })

    return users
  }

  static readonly getUserById = async (userId: string) => {
    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
      omit: {
        password: true,
      },
    })

    return user
  }

  // necesseary for testing
  static readonly changeRole = async (userAttr: {
    email: string
    role: UserRole
  }) => {
    return await db.user.update({
      where: {
        email: userAttr.email,
      },
      data: {
        role: userAttr.role,
      },
    })
  }
}
