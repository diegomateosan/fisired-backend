const ServiceResponse = require('../helpers/serviceResponse')
const Comment = require('../models/comment.model')
const Post = require('../models/post.model')
const { createCustomError } = require('../helpers/createCustomError')

const getComments = async (req, res) => {
  const response = new ServiceResponse()
  try {
    const comentario = await Comment.find()
    response.setSucessResponse('Todos los Comentarios Encontrados Exitosamente', comentario)
  } catch (error) {
    response.setErrorResponse(error.message, 500)
  } finally {
    res.send(response)
  }
}

const getOneComment = async (req, res) => {
  const commentId = req.params.commentId
  const response = new ServiceResponse()
  try {
    const valid = await Comment.findById(commentId)

    if (!valid) {
      throw createCustomError('No existe una Comentario con ese id', 404)
    }

    const comentario = await Comment.findById(commentId)
    response.setSucessResponse('Comentario Encontrado Exitosamente', comentario)
  } catch (error) {
    response.setErrorResponse(error.message, error.code)
  } finally {
    res.send(response)
  }
}

const getCommentsComents = async (req, res) => {
  const postId = req.params.commentId
  const cantidad = req.query.amount
  const response = new ServiceResponse()
  let comentario
  try {
    const valid = await Comment.findById(postId)

    if (!valid) {
      throw createCustomError('No existe una Comentario con ese id', 404)
    }
    if (cantidad === undefined) {
      comentario = await Comment.find({ post: postId })
        .populate({
          path: 'user',
          select: 'username profilePicture'
        })
        .populate({
          path: 'comments',
          select: 'content user',
          populate: {
            path: 'user',
            select: 'username profilePicture'
          }
        })
    } else {
      comentario = await Comment.find({ post: postId }).limit(cantidad)
    }

    response.setSucessResponse(
      'Comentarios de la publicación Encontrados Exitosamente',
      comentario
    )
  } catch (error) {
    response.setErrorResponse(error.message, error.code)
  } finally {
    res.send(response)
  }
}

const addComment = async (req, res) => {
  const response = new ServiceResponse()
  const { content, postId, type } = req.body
  const userId = req.uid

  try {
    const valid =
      type !== 'comment-post' ? await Comment.findById(postId) : await Post.findById(postId)

    if (!valid) {
      throw createCustomError('No existe una publicación/Comentario con ese id', 404)
    }

    const newComment = new Comment({
      user: userId,
      post: postId,
      content,
      type
    })

    const comentario = await newComment.save()

    if (type !== 'comment-post') {
      await Comment.findByIdAndUpdate(
        postId,
        { $push: { comments: newComment._id } },
        { new: true }
      )

      await Post.findByIdAndUpdate(
        valid.post,
        { $push: { comments: newComment._id } },
        { new: true }
      )
    } else {
      await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: newComment._id } },
        { new: true }
      )
    }

    response.setSucessResponse('Comentario Guardado Exitosamente', comentario)
  } catch (error) {
    response.setErrorResponse(error.message, error.code)
  } finally {
    res.send(response)
  }
}

const updateComment = async (req, res) => {
  const { content } = req.body
  const commentId = req.params.commentId
  const response = new ServiceResponse()
  try {
    const valid = await Comment.findById(commentId)

    if (!valid) {
      throw createCustomError('No existe una Comentario con ese id', 404)
    }
    const comentario = await Comment.findByIdAndUpdate(commentId, { content }, { new: true })
    response.setSucessResponse('Comentario Actualizado Exitosamente', comentario)
  } catch (error) {
    response.setErrorResponse(error.message, error.code)
  } finally {
    res.send(response)
  }
}

const deleteComment = async (req, res) => {
  const commentId = req.params.commentId
  const response = new ServiceResponse()
  try {
    const valid = await Comment.findById(commentId)

    if (!valid) {
      throw createCustomError('No existe una Comentario con ese id', 404)
    }

    const comentario = await Comment.findByIdAndRemove(commentId)
    // Eliminar EL COMENTARIO A LA PUBLICACIÓN TBM

    if (valid.type !== 'comment-post') {
      await Comment.findByIdAndUpdate(
        valid.post,
        { $pull: { comments: commentId } },
        { new: true }
      )
    }

    await Post.updateMany(
      { comments: commentId },
      { $pull: { comments: commentId } },
      { new: true }
    )

    response.setSucessResponse('Comentario Eliminado Exitosamente', comentario)
  } catch (error) {
    response.setErrorResponse(error.message, error.code)
  } finally {
    res.send(response)
  }
}

const countCommetsComents = async (req, res) => {
  const postId = req.params.commentId
  const response = new ServiceResponse()
  try {
    const valid = await Comment.findById(postId)

    if (!valid) {
      throw createCustomError('No existe unaomentario con ese id', 404)
    }

    const comentario = await Comment.countDocuments({ post: postId })

    response.setSucessResponse(
      'El numero de comentarios de esta publicación es: ' + comentario,
      comentario
    )
  } catch (error) {
    response.setErrorResponse(error.message, error.code)
  } finally {
    res.send(response)
  }
}

module.exports = {
  getComments,
  getOneComment,
  getCommentsComents,
  addComment,
  updateComment,
  deleteComment,
  countCommetsComents
}
