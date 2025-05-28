import { db } from '@src/config'
import { beforeEach } from 'vitest'

beforeEach(async () => {
  await db.user.deleteMany()
})
