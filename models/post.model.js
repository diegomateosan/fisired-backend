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
    }
  },
  { timestamps: true }
)

PostSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject()
  object.id = _id
  return object
})

module.exports = mongoose.model('Post', PostSchema)
