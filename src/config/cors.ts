import cors from 'cors'

const allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173']

const corsConfig = () =>
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    maxAge: 3600,
    credentials: true,
  })

export default corsConfig
