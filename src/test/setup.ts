import { beforeEach } from 'vitest'
import { db } from '../config'

beforeEach(async () => {
  await db.user.deleteMany()
  await db.token.deleteMany()
  await db.schedule.deleteMany()
  await db.booking.deleteMany()
})
