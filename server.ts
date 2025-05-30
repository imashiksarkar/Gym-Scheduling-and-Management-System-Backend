import getAppInstance from './src/app'
import { validatedEnv } from './src/lib'

const PORT = validatedEnv.PORT || 3000

const bootstrap = async () => {
  const app = await getAppInstance()

  app.listen(PORT, () =>
    console.log(`Server is running at http://localhost:${PORT}`)
  )
}

bootstrap()
