const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true
    },
    password: {
      type: String,
      required: true,
      min: 6
    },
    profilePicture: {
      type: String,
      default: ''
    },
    coverPicture: {
      type: String,
      default: ''
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isAdmin: {
      type: Boolean,
      default: false
    },
    desc: {
      type: String,
      max: 15
    },
    city: {
      type: String,
      max: 50
    },
    from: {
      type: String,
      max: 50
    },
    relationship: {
      type: Number,
      enum: [1, 2, 3]
    }
  },
  { timestamps: true }
)

UserSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject()
  object.id = _id
  return object
})

module.exports = mongoose.model('User', UserSchema)
