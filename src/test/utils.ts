import { faker } from '@faker-js/faker'
import { UserRole } from '@prisma/client'
import { type Express } from 'express'
import request from 'supertest'
import { db } from '../config'
import { SignupUserDto } from '../modules/auth/auth.dtos'
import authService from '../modules/auth/auth.service'

export const getSchedulePayload = (trainerId: string) => ({
  startsAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  title: faker.lorem.word(),
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

  return {
    userPayload,
    body: res.body,
    at: res.headers['set-cookie'][0],
    rt: res.headers['set-cookie'][1],
  }
}

export const signinUser = async (app: Express, userPayload: SignupUserDto) => {
  const res = await request(app).post('/auth/signin').send(userPayload)

  return {
    userPayload,
    body: res.body,
    at: res.headers['set-cookie'][0],
    rt: res.headers['set-cookie'][1],
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
  const admin = await request(app)
    .post('/auth/signin')
    .send(userPayload)
    .expect(200)

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

  return {
    body: trainer.body,
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
      .expect(201)

    return schedule.body
  }

  for (const element of Array.from({ length: trainerCount })) {
    await request(app)
      .post('/schedules')
      .set('Cookie', adminAT)
      .send(getSchedulePayload(trainerId))
      .expect(201)
  }
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
