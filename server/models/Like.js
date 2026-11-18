import mongoose from 'mongoose'

// One document = one user likes one character
const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
  },
  { timestamps: true }
)

// A user can like a character only once (the database rejects duplicates)
likeSchema.index({ user: 1, character: 1 }, { unique: true })
// Fast counting of a character's likes
likeSchema.index({ character: 1 })

const Like = mongoose.model('Like', likeSchema)

export default Like
