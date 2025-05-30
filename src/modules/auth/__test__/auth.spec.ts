import { UserRole } from '@prisma/client'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import getAppInstance from '../../../app'
import {
  createAdmin,
  createTrainee,
  getUserCred,
  signinUser,
} from '../../../test/utils'
import authService from '../auth.service'

describe('Auth Module', async () => {
  const app = await getAppInstance()

  describe('Role: Trainee', () => {
    it('should be able to signup', async () => {
      const userPayload = getUserCred()

      const user = await request(app).post('/auth/signup').send(userPayload)

      expect(user.body.data.email).toBe(userPayload.email)
      expect(user.body.data.password).toBeUndefined()
      expect(user.headers['set-cookie']).toHaveLength(2)
    })

    it('should be able to signin', async () => {
      const { userPayload } = await createTrainee(app)

      delete userPayload.name
      const signedInUser = await request(app)
        .post('/auth/signin')
        .send(userPayload)

      expect(signedInUser.body.success).toBe(true)
      expect(signedInUser.headers['set-cookie']).toHaveLength(2)
      expect(signedInUser.body.data.email).toBe(userPayload.email)
      expect(signedInUser.body.data.password).toBeUndefined()
    })

    it('should not be able to signin with wrong password', async () => {
      const { userPayload } = await createTrainee(app)

      const res = await request(app).post('/auth/signin').send({
        email: userPayload.email,
        password: 'A5shiklngya', // wrong password
      })

      expect(res.body.success).toBe(false)
      expect(res.body.error.message[0]).toMatch(/invalid/gi)
    })

    it('should be able to signout', async () => {
      const { rt: refreshToken } = await createTrainee(app)

      const res = await request(app)
        .delete('/auth/signout')
        .set('Cookie', refreshToken)
        .expect(200)

      expect(res.headers['set-cookie']).toEqual([
        'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      ])
    })

    it('should return all roles', async () => {
      const roles = await request(app).get('/auth/roles').expect(200)

      expect(roles.body.success).toBe(true)
      expect(roles.body.data).toEqual(UserRole)
    })

    it('lets user to refresh token', async () => {
      const { rt, at } = await createTrainee(app)

      const res = await request(app).get('/auth/refresh').set('Cookie', rt)
      const [newAt, newRt] = res.headers['set-cookie']

      expect(res.body.success).toBe(true)
      expect(at).not.toBe(newAt)
      expect(rt).not.toBe(newRt)
    })

    it('should be able to fetch own profile', async () => {
      // create user
      const { at: userAT } = await createTrainee(app)

      // fetch own profile
      const profile = await request(app)
        .get('/auth/profile')
        .set('Cookie', userAT)

      expect(profile.body.success).toBe(true)
      expect(profile.body.data.id).toBeDefined()
    })
  })

  describe('Role: Admin', () => {
    it('should be able to fetch all users', async () => {
      // signup a user
      const { userPayload } = await createTrainee(app)

      await request(app)
        .post('/auth/signup')
        .send({ ...userPayload, email: 'pokimin2@gmail.com' })
        .expect(201)

      // make the user admin using service
      await authService.changeRole({
        email: userPayload.email!,
        role: UserRole.admin,
      })

      // signin as admin
      delete userPayload.name
      const { at: adminAT } = await signinUser(
        app,
        userPayload as Required<typeof userPayload>
      )

      // fetch all users as admin
      const users = await request(app).get('/auth/users').set('Cookie', adminAT)

      expect(users.body.success).toBe(true)
      expect(users.body.data.length).toBe(2)
    })

    it('should be able to fetch a single user', async () => {
      const { body, at: adminAT } = await createAdmin(app)

      // fetch all users as admin
      const users = await request(app)
        .get(`/auth/users/${body.data.id}`)
        .set('Cookie', adminAT)

      expect(users.body.success).toBe(true)
      expect(users.body.data.id).toBeDefined()
    })
  })
})
