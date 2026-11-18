// The user fields that are safe to send to the logged-in user (never the password)
const userResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  bio: user.bio,
  avatar: user.avatar,
  createdAt: user.createdAt,
})

export default userResponse
