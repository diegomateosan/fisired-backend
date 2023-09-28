const ServiceResponse = require('../helpers/serviceResponse')
const Comment = require('../models/comment.model')
const Post = require('../models/post.model')

const getComments = async (req, res) => {
  const response = new ServiceResponse()
  try {
    const comentario = await Comment.find()
    response.setSucessResponse(
      'Todos los Comentarios Encontrados Exitosamente',
      comentario
    )
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
      throw new Error('No existe una publicación/Comentario con ese id')
    }

    const comentario = await Comment.findById(commentId)
    response.setSucessResponse('Comentario Encontrado Exitosamente', comentario)
  } catch (error) {
    response.setErrorResponse(error.message, 500)
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
      throw new Error('No existe una publicación/Comentario con ese id')
    }

    if (cantidad === undefined) {
      comentario = await Comment.find({ post: postId })
    } else {
      comentario = await Comment.find({ post: postId }).limit(cantidad)
    }

    response.setSucessResponse(
      'Comentarios de la publicación Encontrados Exitosamente',
      comentario
    )
  } catch (error) {
    response.setErrorResponse(error.message, 500)
  } finally {
    res.send(response)
  }
}

const addComment = async (req, res) => {
  const response = new ServiceResponse()
  const { content, postId, type } = req.body
  // Implementar Cuando el front funcione o pasarlo por el body
  // const {userId}= req;
  const userId = '6503399db637b81eaa4140d8'

  try {
    const valid =
      type !== 'comment-post'
        ? await Comment.findById(postId)
        : await Post.findById(postId)

    if (!valid) {
      throw new Error('No existe una publicación/Comentario con ese id')
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
    response.setErrorResponse(error.message, 500)
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
      throw new Error('No existe una Comentario con ese id')
    }

    const comentario = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    )
    response.setSucessResponse('Comentario Actualizado Exitosamente', comentario)
  } catch (error) {
    response.setErrorResponse(error.message, 500)
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
      throw new Error('No existe una Comentario con ese id')
    }

    const comentario = await Comment.findByIdAndRemove(commentId)
    // Eliminar EL COMENTARIO A LA PUBLICACIÓN TBM
    response.setSucessResponse('Comentario Eliminado Exitosamente', comentario)
  } catch (error) {
    response.setErrorResponse(error.message, 500)
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
      throw new Error('No existe una Comentario con ese id')
    }

    const comentario = await Comment.countDocuments({ post: postId })

    response.setSucessResponse(
      'El numero de comentarios de esta publicación es: ' + comentario,
      comentario
    )
  } catch (error) {
    response.setErrorResponse(error.message, 500)
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
