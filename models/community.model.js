const mongoose = require('mongoose')
const Schema = mongoose.Schema

const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    banner: {
      type: String
    },

    moderators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }
    ],

    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }
    ],

    bannedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }
    ],

    Posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        default: []
      }
    ]
  },

  {
    timestamps: true
  }
)

communitySchema.index({ name: 'text' })

module.exports = mongoose.model('Community', communitySchema)
