import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import characterRoutes from './routes/characterRoutes.js'
import userRoutes from './routes/userRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

const app = express()

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/characters', characterRoutes)
app.use('/api/users', userRoutes)
app.use('/api/comments', commentRoutes)

// Error handling (must come after all routes)
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

// Connect to MongoDB first, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})
