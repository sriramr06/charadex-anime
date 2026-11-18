import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Protects routes: only lets the request through if it has a valid JWT
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization

  // Expected format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  const token = authHeader.split(' ')[1]

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    // Token is invalid or expired
    return res.status(401).json({ message: 'Not authorized, invalid token' })
  }

  const user = await User.findById(decoded.id)
  if (!user) {
    return res.status(401).json({ message: 'Not authorized, user not found' })
  }

  req.user = user
  next()
}
