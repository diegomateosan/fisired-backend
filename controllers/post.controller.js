const ServiceResponse = require('../helpers/serviceResponse')
const Post = require('../models/post.model')
const User = require('../models/user.model')
const { createCustomError } = require('../helpers/createCustomError')

const getTimeline = async (req, res) => {
  const response = new ServiceResponse()
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

    response.setSucessResponse('Posts del timeline encontrados exitosamente', timelinePosts)
  } catch (err) {
    console.log(err.message)
    response.setErrorResponse(err.message, 500)
  } finally {
    res.send(response)
  }
}

const createPost = async (req, res) => {
  const response = new ServiceResponse()
  const newPost = new Post(req.body)
  try {
    newPost.user = req.uid
    const savedPost = await newPost.save()
    response.setSucessResponse('Post creado exitosamente', savedPost, 201)
  } catch (err) {
    console.log(err.message)
    response.setErrorResponse(err.message, 500)
  } finally {
    res.send(response)
  }
}

const updatePost = async (req, res) => {
  const response = new ServiceResponse()
  const idPost = req.params.id
  const uid = req.uid

  try {
    const post = await Post.findById(idPost)
    if (!post) {
      throw createCustomError('No existe una publicación con ese id', 404)
    }

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

    response.setSucessResponse('Post actualizado exitosamente', updatedPost)
  } catch (err) {
    console.log(err.message)
    response.setErrorResponse(err.message, err.code)
  } finally {
    res.send(response)
  }
}

const deletePost = async (req, res) => {
  const response = new ServiceResponse()
  const idPost = req.params.id
  const uid = req.uid
  try {
    const post = await Post.findById(idPost)

    if (!post) {
      throw createCustomError('No existe una publicación con ese id', 404)
    }

    if (post.user.toString() !== uid) {
      throw createCustomError('No tiene previlegios de eliminar este publicación', 401)
    }

    const deletedPost = await Post.findOneAndDelete(idPost)

    response.setSucessResponse('Post eliminado exitosamente', deletedPost)
  } catch (err) {
    console.log(err.message)
    response.setErrorResponse(err.message, err.code)
  } finally {
    res.send(response)
  }
}

const getSinglePost = async (req, res) => {
  const response = new ServiceResponse()
  const idPost = req.params.id

  try {
    const post = await Post.findById(idPost)
      .populate({
        path: 'user',
        select: 'username profilePicture'
      })
      .populate({
        path: 'comments',
        select: 'content type',
        match: { type: 'comment-post' }
      })

    if (!post) {
      throw createCustomError('No existe una publicación con ese id', 404)
    }

    response.setSucessResponse('Post encontrado exitosamente', post)
  } catch (err) {
    console.log(err.message)
    response.setErrorResponse(err.message, err.code)
  } finally {
    res.send(response)
  }
}

const likeDislikePost = async (req, res) => {
  const response = new ServiceResponse()
  const idPost = req.params.id
  const uid = req.uid

  try {
    const post = await Post.findById(idPost)

    if (!post) {
      throw createCustomError('No existe una publicación con ese id', 404)
    }

    if (!post.likes.includes(uid)) {
      await post.updateOne({ $push: { likes: uid } })
      response.setSucessResponse('La publicación ha recibido me gusta')
    } else {
      await post.updateOne({ $pull: { likes: uid } })
      response.setSucessResponse('La publicación ha recibido no me gusta')
    }
  } catch (err) {
    console.log(err.message)
    response.setErrorResponse(err.message, err.code)
  } finally {
    res.send(response)
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
