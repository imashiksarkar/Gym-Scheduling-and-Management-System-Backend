import { db } from '@src/config'
import { beforeEach } from 'vitest'

beforeEach(async () => {
  await db.user.deleteMany()
  await db.token.deleteMany()
  await db.schedule.deleteMany()
  await db.booking.deleteMany()
})
