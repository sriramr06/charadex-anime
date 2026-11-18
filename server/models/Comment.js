import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      trim: true,
      maxlength: [500, 'Comment must be at most 500 characters'],
    },
  },
  { timestamps: true }
)

// Listing a character's comments, newest first
commentSchema.index({ character: 1, createdAt: -1 })

const Comment = mongoose.model('Comment', commentSchema)

export default Comment
