import gracefulShutdown from './gracefulShutdown'

process.on('uncaughtException', (error) => {
  gracefulShutdown('Uncaught Exception', error)
})

process.on('unhandledRejection', (reason) => {
  gracefulShutdown('Unhandled Rejection', reason)
})

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
