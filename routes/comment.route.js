const {
  getComments,
  getOneComment,
  getCommentsComents,
  addComment,
  updateComment,
  deleteComment,
  countCommetsComents
} = require('../controllers/comment.controller')
const { jwtValidator } = require('../middlewares/jwt-validator')

const router = require('express').Router()
// Todas la peticiones deben ser protegidas por el jwt
router.use(jwtValidator)

router.get('/getAll', getComments)

router.get('/getOne/:commentId', getOneComment)

router.get('/getComments/:commentId', getCommentsComents)

router.post('/add', addComment)

router.patch('/update/:commentId', updateComment)

router.delete('/delete/:commentId', deleteComment)

router.get('/count/:commentId', countCommetsComents)

module.exports = router
