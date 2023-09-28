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
    likes: {
      type: Array,
      default: []
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Post', PostSchema)
