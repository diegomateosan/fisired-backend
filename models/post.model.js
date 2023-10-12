const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    desc: {
      type: String,
      max: 500
    },
    img: {
      type: String
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ],
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Post', PostSchema)
