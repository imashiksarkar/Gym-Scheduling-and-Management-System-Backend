import { db, logger } from '@src/config'

const gracefulShutdown = async (reason: string, error?: unknown) => {
  logger.error({ reason, error }, 'Shutting down application')

  try {
    await db.$disconnect()
    logger.info('Database disconnected successfully')
  } catch (err) {
    logger.error({ err }, 'Error during DB disconnection')
  } finally {
    process.exit(1)
  }
}

export default gracefulShutdown
