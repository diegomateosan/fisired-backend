const router = require('express').Router()
const {
  getTimeline,
  createPost,
  likeDislikePost,
  updatePost,
  deletePost,
  getSinglePost,
  getLikesPost
} = require('../controllers/post.controller')
const { jwtValidator } = require('../middlewares/jwt-validator')

// Todas la peticiones deben ser protegidas por el jwt
router.use(jwtValidator)

// GET TIMELINE POSTS
router.get('/timeline/all', getTimeline)

// CREATE A POST
router.post('/', createPost)

// UPDATE A POST
router.put('/:id', updatePost)

// DELETE A POST
router.delete('/:id', deletePost)

// LIKE DISLIKE A POST
router.put('/:id/like', likeDislikePost)

// GET LIKES FROM A POST
router.get('/:id/likes', getLikesPost)

// GET A POST
router.get('/:id', getSinglePost)

module.exports = router
