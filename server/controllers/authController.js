import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

// Only send safe fields back to the client (never the password)
const userResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  bio: user.bio,
  avatar: user.avatar,
  createdAt: user.createdAt,
})

// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' })
  }

  // Friendly duplicate checks (the unique indexes are the final safety net)
  const emailTaken = await User.findOne({ email: email.toLowerCase().trim() })
  if (emailTaken) {
    return res.status(400).json({ message: 'Email is already registered' })
  }

  const usernameTaken = await User.findOne({ username: username.toLowerCase().trim() })
  if (usernameTaken) {
    return res.status(400).json({ message: 'Username is already taken' })
  }

  // Password is hashed by the pre('save') hook in the User model
  const user = await User.create({ username, email, password, displayName: username })

  res.status(201).json({
    token: generateToken(user._id),
    user: userResponse(user),
  })
}

// Used by step 1 of the sign-up form, before the user picks a username
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmail = async (req, res) => {
  const { email } = req.body

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' })
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() })
  res.json({ available: !existing })
}

// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  // Password has select: false, so we must ask for it explicitly
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')

  // Same message for both cases so we don't reveal which emails exist
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  res.json({
    token: generateToken(user._id),
    user: userResponse(user),
  })
}

// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.json({ user: userResponse(req.user) })
}
