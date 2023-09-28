const Post = require('../models/post.model')
const User = require('../models/user.model')

const getTimeline = async (req, res) => {
  const uid = req.uid

  try {
    // Traer los post del usuario y de sus amigos
    const currentUser = await User.findById(uid)
    const userPosts = await Post.find({ user: currentUser })
    const friendPosts = await Promise.all(
      currentUser.followings.map((followedUser) => {
        return Post.find({ user: followedUser })
      })
    )
    // Combinar los posts del usuario actual y los posts de sus amigos en una sola matriz
    let timelinePosts = userPosts.concat(...friendPosts)
    // Ordenar los posts por fecha de creación (los más recientes primero)
    timelinePosts = timelinePosts.sort((a, b) => b.createdAt - a.createdAt)

    res.json({
      ok: true,
      posts: timelinePosts
    })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
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
  const idPost = req.params.id
  const uid = req.uid

  try {
    const post = await Post.findById(idPost)
    if (!post) {
      return res.status(404).json({
        ok: false,
        msg: 'No existe una publicación con ese id'
      })
    }
    console.log(post.user.toString())
    if (post.user.toString() !== uid) {
      return res.status(401).json({
        ok: false,
        msg: 'No tiene previlegios de editar este publicación'
      })
    }

    const newPost = {
      ...req.body,
      user: uid
    }

    const updatedPost = await Post.findByIdAndUpdate(idPost, newPost, { new: true })

    res.json({
      ok: true,
      event: updatedPost
    })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

const deletePost = async (req, res) => {
  const idPost = req.params.id
  const uid = req.uid
  try {
    const post = await Post.findById(idPost)

    if (!post) {
      return res.status(404).json({
        ok: false,
        msg: 'No existe una publicación con ese id'
      })
    }

    if (post.user.toString() !== uid) {
      return res.status(401).json({
        ok: false,
        msg: 'No tiene previlegios para eliminar esta publicación'
      })
    }

    const deletedPost = await Post.findOneAndDelete(idPost)

    res.json({
      ok: true,
      deletedPost
    })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

const getSinglePost = async (req, res) => {
  const idPost = req.params.id

  try {
    const post = await Post.findById(idPost)
      .populate({
        path: 'user',
        select: 'username profilePicture' // Selecciona tanto el nombre de usuario como la foto de perfil del usuario
      })

    if (!post) {
      return res.status(404).json({
        ok: false,
        msg: 'No existe una publicación con ese id'
      })
    }

    res.status(200).json({
      ok: true,
      post
    })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

const likeDislikePost = async (req, res) => {
  const idPost = req.params.id
  const uid = req.uid

  try {
    const post = await Post.findById(idPost)

    if (!post) {
      return res.status(404).json({
        ok: false,
        msg: 'No existe una publicación con ese id'
      })
    }

    if (!post.likes.includes(uid)) {
      await post.updateOne({ $push: { likes: uid } })
      res.status(200).json({
        ok: true,
        msg: 'La publicación ha recibido me gusta'
      })
    } else {
      await post.updateOne({ $pull: { likes: uid } })
      res.status(200).json({
        ok: true,
        msg: 'La publicación ha recibido no me gusta'
      })
    }
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
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
