import mongoose from 'mongoose'
import { MAX_TAGS, isValidTag } from '../utils/tags.js'

// A named technique inside an ability (e.g. a special move or form)
const techniqueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Technique name is required'],
      trim: true,
      maxlength: [80, 'Technique name must be at most 80 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Technique description must be at most 1000 characters'],
    },
  },
  { _id: false }
)

// An ability, which can contain several techniques
const abilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ability name is required'],
      trim: true,
      maxlength: [80, 'Ability name must be at most 80 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Ability description must be at most 1000 characters'],
    },
    techniques: {
      type: [techniqueSchema],
      validate: [(arr) => arr.length <= 20, 'An ability can have at most 20 techniques'],
    },
  },
  { _id: false }
)

const characterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Character name is required'],
      trim: true,
      maxlength: [60, 'Name must be at most 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description must be at most 300 characters'],
    },
    personality: {
      type: String,
      maxlength: [2000, 'Personality must be at most 2000 characters'],
    },
    abilities: {
      type: [abilitySchema],
      validate: [(arr) => arr.length <= 20, 'A character can have at most 20 abilities'],
    },
    backstory: {
      type: String,
      maxlength: [10000, 'Backstory must be at most 10000 characters'],
    },
    // Free-form tags, e.g. ["swordswoman", "sky pirate"] (see utils/tags.js)
    tags: {
      type: [String],
      validate: [
        {
          validator: (arr) => arr.length <= MAX_TAGS,
          message: `A character can have at most ${MAX_TAGS} tags`,
        },
        {
          validator: (arr) => arr.every(isValidTag),
          message: 'Tags must be 2–30 characters: letters, numbers, spaces, or hyphens',
        },
      ],
    },
    image: {
      url: String,
      publicId: String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

characterSchema.index({ creator: 1 })
characterSchema.index({ createdAt: -1 })
// Filtering Explore by tag (MongoDB indexes each tag in the array)
characterSchema.index({ tags: 1 })

const Character = mongoose.model('Character', characterSchema)

export default Character