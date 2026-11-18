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

// For public routes that show a little extra to logged-in users
// (e.g. "did I like this?"). Sets req.user when the token is valid,
// but never blocks the request.
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id)
    } catch (error) {
      // Invalid or expired token: just continue as a visitor
    }
  }

  next()
}
