const {
  getComments,
  getOneComment,
  getCommentsComents,
  addComment,
  updateComment,
  deleteComment,
  countCommetsComents,
} = require('../controllers/comment.controller');

const router = require('express').Router();

router.get('/getAll', getComments);

router.get('/getOne/:commentId', getOneComment);

router.get('/getComments/:commentId', getCommentsComents);

router.post('/add', addComment);

router.patch('/update/:commentId', updateComment);

router.delete('/delete/:commentId', deleteComment);

router.get('/count/:commentId', countCommetsComents);

module.exports = router;
