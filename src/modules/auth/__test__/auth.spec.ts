import getAppInstance from '@src/app'
import { Hashing } from '@src/lib'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { ChangeUserRoleDto, signupUserDto } from '../auth.dtos'
import authService from '../auth.service'
import { UserRole } from '@prisma/client'

describe('auth', async () => {
  const app = await getAppInstance()

  const pokominCred = {
    name: 'Pokomin S',
    email: 'pokomin@gmail.com',
    password: 'A5shikadmin',
  }

  const marioCred = {
    name: 'Mario R',
    email: 'amrio@gmail.com',
    password: 'A5shikmario',
  }

  describe('validations', () => {
    it('validate signup user dto', async () => {
      const data = signupUserDto.parse(pokominCred)

      expect(data).toBeDefined()
    })

    it('verifies the password', async () => {
      const data = signupUserDto.parse(pokominCred)

      data.password = await Hashing.hash(data.password)

      expect(await Hashing.verify(pokominCred.password, data.password)).toBe(
        true
      )
    })
  })

  describe('Role: Trainee', () => {
    it('should be able to signup', async () => {
      const res = await request(app).post('/auth/signup').send(pokominCred)

      expect(res.body.data.email).toBe(pokominCred.email)
      expect(res.body.data.password).toBeUndefined()
      expect(res.headers['set-cookie']).toHaveLength(2)
    })

    it('should be able to signin', async () => {
      await request(app).post('/auth/signup').send(pokominCred).expect(201)

      const { name, ...signInCred } = pokominCred
      const res = await request(app).post('/auth/signin').send(signInCred)

      expect(res.body.success).toBe(true)
      expect(res.headers['set-cookie']).toHaveLength(2)
      expect(res.body.data.email).toBe(pokominCred.email)
      expect(res.body.data.password).toBeUndefined()
    })

    it('should not be able to signin with wrong password', async () => {
      await request(app).post('/auth/signup').send(pokominCred).expect(201)

      const res = await request(app).post('/auth/signin').send({
        email: pokominCred.email,
        password: 'A5shiklngya', // wrong password
      })

      expect(res.body.success).toBe(false)
      expect(res.body.error.message[0]).toMatch(/invalid/gi)
    })

    it('should be able to signout', async () => {
      const user = await request(app)
        .post('/auth/signup')
        .send(pokominCred)
        .expect(201)
      const [_, refreshToken] = user.headers['set-cookie']

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
      const res = await request(app)
        .get('/auth/roles')
        .send(pokominCred)
        .expect(200)
      console.log('Here are all the allowed roles', res.body.data)
    })

    it('lets user to refresh token', async () => {
      const user = await request(app)
        .post('/auth/signup')
        .send(pokominCred)
        .expect(201)

      const [_, refreshToken] = user.headers['set-cookie']

      const res = await request(app)
        .post('/auth/refresh')
        .set('Cookie', refreshToken)

      expect(res.body.success).toBe(true)
    })

    it('should be able to fetch own profile', async () => {
      // create user
      const user = await request(app)
        .post('/auth/signup')
        .send(pokominCred)
        .expect(201)
      const [userAT] = user.headers['set-cookie']

      // fetch own profile
      const profile = await request(app)
        .get('/auth/profile')
        .set('Cookie', userAT)

      expect(profile.body.success).toBe(true)
      expect(profile.body.data.id).toBeDefined()
    })
  })

  describe('Role: Admin', () => {
    it('should be able to change the user role', async () => {
      const rolePayload: ChangeUserRoleDto = {
        email: marioCred.email,
        role: UserRole.admin,
      }

      await request(app).post('/auth/signup').send(pokominCred).expect(201)
      // change user role using service
      await authService.changeRole({
        email: pokominCred.email,
        role: UserRole.admin,
      })

      // signin as admin
      const { name, ...signInCred } = pokominCred
      const admin = await request(app)
        .post('/auth/signin')
        .send(signInCred)
        .expect(200)
      const [adminAT] = admin.headers['set-cookie']

      // create user
      await request(app).post('/auth/signup').send(marioCred).expect(201)

      const roleRes = await request(app)
        .patch('/auth/roles')
        .set('Cookie', adminAT)
        .send(rolePayload)

      expect(roleRes.body.success).toBe(true)
      expect(roleRes.body.data.role).toEqual(rolePayload.role)
    })

    it('should be able to fetch all users', async () => {
      // signup a user
      const user = await request(app)
        .post('/auth/signup')
        .send(pokominCred)
        .expect(201)

      await request(app)
        .post('/auth/signup')
        .send({ ...pokominCred, email: 'pokimin2@gmail.com' })
        .expect(201)

      // make the user admin using service
      await authService.changeRole({
        email: user.body.data.email,
        role: UserRole.admin,
      })

      // signin as admin
      const admin = await request(app)
        .post('/auth/signin')
        .send(pokominCred)
        .expect(200)
      const [adminAT] = admin.headers['set-cookie']

      // fetch all users as admin
      const users = await request(app).get('/auth/users').set('Cookie', adminAT)

      expect(users.body.success).toBe(true)
      expect(users.body.data.length).toBe(2)
    })

    it('should be able to fetch a single user', async () => {
      // signup a user
      const user = await request(app)
        .post('/auth/signup')
        .send(pokominCred)
        .expect(201)

      // make the user admin using service
      await authService.changeRole({
        email: user.body.data.email,
        role: UserRole.admin,
      })

      // signin as admin
      const admin = await request(app)
        .post('/auth/signin')
        .send(pokominCred)
        .expect(200)
      const [adminAT] = admin.headers['set-cookie']

      // fetch all users as admin
      const users = await request(app)
        .get(`/auth/users/${user.body.data.id}`)
        .set('Cookie', adminAT)

      expect(users.body.success).toBe(true)
      expect(users.body.data.id).toBeDefined()
    })
  })
})
