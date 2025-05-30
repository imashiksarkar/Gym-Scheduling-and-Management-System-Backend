import { faker } from '@faker-js/faker'
import { UserRole } from '@prisma/client'
import { type Express } from 'express'
import request from 'supertest'
import { db } from '../config'
import { SigninUserDto } from '../modules/auth/auth.dtos'
import authService from '../modules/auth/auth.service'

export const getSchedulePayload = (trainerId: string) => ({
  startsAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
  title: faker.lorem.word({ length: { min: 5, max: 10 } }),
  trainerId,
})

export const getUserCred = () => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: 'Aa@6mk',
})

export const createTrainee = async (app: Express) => {
  const userPayload: Partial<ReturnType<typeof getUserCred>> = getUserCred()
  const res = await request(app).post('/auth/signup').send(userPayload)

  if (res.body.success === false)
    throw new Error(res.body.error.message.join('\n'))

  return {
    userPayload,
    body: res.body,
    at: res.headers['set-cookie'][0],
    rt: res.headers['set-cookie'][1],
  }
}

export const signinUser = async (app: Express, userPayload: SigninUserDto) => {
  const res = await request(app).post('/auth/signin').send(userPayload)
  if (res.body.success === false)
    throw new Error(res.body.error.message.join('\n'))

  const [at, rt] = res.header['set-cookie']

  return {
    body: res.body,
    at,
    rt,
  }
}

export const createAdmin = async (app: Express) => {
  // signup a user
  const { userPayload } = await createTrainee(app)

  // make the user admin using service
  await authService.changeRole({
    email: userPayload.email!,
    role: UserRole.admin,
  })

  // signin as admin
  const admin = await request(app).post('/auth/signin').send(userPayload)

  if (admin.body.success === false)
    throw new Error(admin.body.error.message.join('\n'))

  const [adminAT, adminRT] = admin.headers['set-cookie']

  return {
    userPayload,
    body: admin.body,
    at: adminAT,
    rt: adminRT,
  }
}

export const createTrainer = async (app: Express) => {
  const { at: adminAT } = await createAdmin(app)

  const trainer = await request(app)
    .post('/trainers')
    .set('Cookie', adminAT)
    .send(getUserCred())

  if (trainer.body.success === false)
    throw new Error(trainer.body.error.message.join('\n'))

  return {
    body: trainer.body,
  }
}

export const signinAsTrainer = async (app: Express) => {
  const { body: trainer } = await createTrainer(app)

  const { email, password } = trainer.data

  const signedInTrainer = await signinUser(app, {
    email,
    password,
  })

  return {
    body: signedInTrainer.body,
    at: signedInTrainer.at,
    rt: signedInTrainer.rt,
  }
}

export const createSchedule = async (
  app: Express,
  adminAT: string,
  trainerId: string,
  trainerCount: number = 1
) => {
  if (trainerCount < 2) {
    const schedule = await request(app)
      .post('/schedules')
      .set('Cookie', adminAT)
      .send(getSchedulePayload(trainerId))

    if (schedule.body.success === false)
      throw new Error(schedule.body.error.message.join('\n'))

    return schedule.body
  }

  const schedulesRes = await Promise.all(
    Array.from({ length: trainerCount }).map(() => {
      return request(app)
        .post('/schedules')
        .set('Cookie', adminAT)
        .send(getSchedulePayload(trainerId))
    })
  )

  schedulesRes.forEach((schedule) => {
    if (schedule.body.success === false)
      throw new Error(schedule.body.error.message.join('\n'))
  })
}

export const makeSchedulesUnavailable = async () => {
  const backTo5Days = Date.now() - 5 * 24 * 60 * 60 * 1000
  const startsAt = new Date(backTo5Days).toISOString()
  const endsAt = new Date(backTo5Days + 2 * 60 * 60 * 1000).toISOString() // 5 days + 2 hours

  await db.schedule.updateMany({
    data: {
      startsAt,
      endsAt,
    },
  })
}
