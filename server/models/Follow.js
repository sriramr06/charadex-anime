import mongoose from 'mongoose'

// One document = "follower" follows "following" (both are users)
const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

// You can follow someone only once (the database rejects duplicates)
followSchema.index({ follower: 1, following: 1 }, { unique: true })
// Fast counting of someone's followers
followSchema.index({ following: 1 })

const Follow = mongoose.model('Follow', followSchema)

export default Follow
