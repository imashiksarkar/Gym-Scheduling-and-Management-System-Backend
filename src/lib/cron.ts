import { logger } from 'config'
import cron from 'node-cron'
import validatedEnv from './validatedEnv'

const runCron = () => {
  if (!validatedEnv.API_URL) {
    logger.warn(
      'API_URL is not set, skipping cron job for pinging main domain.'
    )
    return
  }

  cron.schedule('*/14 * * * *', async () => {
    try {
      const response = await fetch(validatedEnv.API_URL!)
      const data = await response.json()

      logger.info(`Ping to main domain successful - ${data.message}`)
    } catch (error) {
      // @ts-expect-error
      logger.error(`Error pinging main domain: ${error.message}`)
    }
  })
}

export default runCron
