const Post = require('../models/post.model')
const User = require('../models/user.model')

const getTimeline = async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId)
    const userPosts = await Post.find({ userId: currentUser._id })
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId })
      })
    )
    res.json(userPosts.concat(...friendPosts))
  } catch (err) {
    res.status(500).json(err)
  }
}

const createPost = async (req, res) => {
  const newPost = new Post(req.body)
  try {
    newPost.user = req.uid
    const savedPost = await newPost.save()
    res.json({
      ok: true,
      post: savedPost
    })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body })
      res.status(200).json('This post has been updated')
    } else {
      res.status(403).json('You can update only your post')
    }
  } catch (err) {
    res.status(500).json(err)
  }
}

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (post.userId === req.body.userId) {
      await post.deleteOne()
      res.status(200).json('This post has been deleted')
    } else {
      res.status(403).json('You can delete only your post')
    }
  } catch (err) {
    res.status(500).json(err)
  }
}

const likeDislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } })
      res.status(200).json('The post has been liked')
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } })
      res.status(200).json('The post has been disliked')
    }
  } catch (err) {
    res.status(500).json(err)
  }
}

const getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    res.status(200).json(post)
  } catch (err) {
    res.status(500).json(err)
  }
}

module.exports = {
  getTimeline,
  createPost,
  updatePost,
  deletePost,
  likeDislikePost,
  getSinglePost
}
