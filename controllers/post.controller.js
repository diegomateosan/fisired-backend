const ServiceResponse = require('../helpers/serviceResponse')
const Post = require('../models/post.model')
const User = require('../models/user.model')
const { createCustomError } = require('../helpers/createCustomError')
const Comment = require('../models/comment.model')
const cloudinary = require('../helpers/cloudinary')

const getTimeline = async (req, res) => {
  const response = new ServiceResponse()
  const uid = req.uid

  try {
    // Traer los post del usuario y de sus amigos
    const currentUser = await User.findById(uid)
    const userPosts = await Post.find({ user: currentUser }).populate('user', '-password')
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
    // req.bodi.img es un string para subirlo al cloudinary
    if (req.body.img !== '') {
      const result = await cloudinary.uploader.upload(req.body.img, {
        folder: 'posts'
      })
      newPost.img = {
        public_id: result.public_id,
        url: result.secure_url
      }
    } else {
      newPost.img = {
        public_id: '',
        url: ''
      }
    }
    const savedPost = await newPost.save()
    await savedPost.populate('user', '-password')
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

    // Eliminamos la foto de cloudinary
    if (post.img.public_id !== '') {
      const imgId = post.img.public_id
      await cloudinary.uploader.destroy(imgId)
    }
    // Subimos la nueva foto a cloudinary
    if (req.body.img === '') {
      // No se hace nada con la imagen, deja el campo de imagen vacío
      newPost.img = {
        public_id: '',
        url: ''
      }
    } else if (req.body.img?.startsWith('http') || req.body.img?.startsWith('https')) {
      // Si es una URL, no se hace ningun cambio
      newPost.img = {
        public_id: post.img.public_id,
        url: post.img.url
      }
    } else {
      // Si es una cadena codificada en base64, se sube Cloudinary y guarda la URL
      const result = await cloudinary.uploader.upload(req.body.img, {
        folder: 'posts'
      })
      newPost.img = {
        public_id: result.public_id,
        url: result.secure_url
      }
    }
    const updatedPost = await Post.findByIdAndUpdate(idPost, newPost, { new: true })
    await updatedPost.populate('user', '-password')
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

    // Eliminamos la foto de cloudinary
    if (post.img.public_id !== '') {
      const imgId = post.img.public_id
      await cloudinary.uploader.destroy(imgId)
    }

    const deletedPost = await Post.findOneAndDelete({ _id: idPost })
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
        select: 'content type user',
        match: { type: 'comment-post' }
      })
      .exec()

    if (!post) {
      throw createCustomError('No existe una publicación con ese id', 404)
    }

    // Itera a través de los comentarios y obtén los detalles de los usuarios.
    const populatedComments = await Promise.all(
      post.comments.map(async (comment) => {
        const populatedComment = await Comment.findById(comment._id).populate({
          path: 'user',
          select: 'username profilePicture'
        })
        // Reemplaza el comentario con el comentario poblado.
        return populatedComment
      })
    )

    // Reemplaza los comentarios en el post con los comentarios poblados.
    post.comments = populatedComments

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

const getLikesPost = async (req, res) => {
  const response = new ServiceResponse()
  const idPost = req.params.id

  try {
    const post = await Post.findById(idPost)

    if (!post) {
      throw createCustomError('No existe una publicación con ese id', 404)
    }

    await post.populate('likes', 'username profilePicture email desc')

    const likesFromPost = post.likes // Lista de usuarios que dieron "me gusta" a la publicación
    const likes = {
      users: likesFromPost,
      count: likesFromPost.length // cantidad total de "me gusta"
    }

    response.setSucessResponse('Post encontrado exitosamente', likes)
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
  getSinglePost,
  getLikesPost
}
