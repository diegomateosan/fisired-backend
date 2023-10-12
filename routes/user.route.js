const router = require('express').Router()
const bcrypt = require('bcryptjs')
// const passport = require('passport')
const User = require('../models/user.model')

const {
  addUser,
  updateInfo,
  getUser,
  deleteUser,
  getcommunity,
  getUserCommunities
} = require('../controllers/user.controller')

// const decodeToken = require('../middlewares/decodeToken')
// const requireAuth = passport.authenticate('jwt', { session: false }, null)

// ADD USER
router.post('/add', addUser)

router.put('/:id/update', updateInfo)

router.get('/:id/get', getUser)

router.delete('/:id/delete', deleteUser)

router.get('/:userId/communities', getUserCommunities)

router.get('/:userId/populate', getcommunity)

// UPDATE USER
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
      } catch (err) {
        return res.status(500).json(err)
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body
      })
      res.status(200).json('Account has been updated')
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(403).json('You can update only your account')
  }
})

// DELETE USER
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id)
      res.status(200).json('Account has been deleted')
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(403).json('You can delete only your account')
  }
})

// GET A USER
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    console.log('Llegó')
    const { password, updatedAt, ...others } = user._doc
    res.status(200).json(others)
  } catch (err) {
    res.status(500).json(err)
  }
})

// FOLLOW A USER
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } })
        await currentUser.updateOne({ $push: { followings: req.params.id } })
        res.status(200).json('User has been followed')
      } else {
        res.status(403).json('You already follow this user')
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json("You can't follow yourself")
  }
})

router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } })
        await currentUser.updateOne({ $pull: { followings: req.params.id } })
        res.status(200).json('User has been unfollowed')
      } else {
        res.status(403).json("You don't follow this user")
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json("You can't unfollow yourself")
  }
})
// UNFOLLOW A USER

module.exports = router
