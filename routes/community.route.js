const {
  addCommunity,
  getAllCommunity,
  getOneCommunity,
  getMembers,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  addModerator,
  deleteMember,
  addPostGroup,
  getPostRecently,
  getAllCommunityUser,
  getKnowAdmin,
  deleteModerator
} = require('../controllers/community.controller')
const { jwtValidator } = require('../middlewares/jwt-validator')
const router = require('express').Router()
router.use(jwtValidator)
router.get('/getAll/:join', getAllCommunity)
router.get('/get/:communityId', getOneCommunity)
router.get('/getKnowAdmin/:communityId', getKnowAdmin)
router.get('/getMembers/:communityId', getMembers)
router.post('/add', addCommunity)
router.patch('/update/:communityId', updateCommunity)
router.delete('/delete/:communityId', deleteCommunity)
router.post('/join/:communityId', joinCommunity)
router.post('/leave/:communityId', leaveCommunity)
router.post('/addModerator/:communityId', addModerator)
router.post('/deleteModerator/:communityId', deleteModerator)
router.post('/deleteMember/:communityId', deleteMember)
router.post('/addPost/:communityId', addPostGroup)
router.get('/getPostRecently/:communityId', getPostRecently)
router.get('/getAllCommunityUser', getAllCommunityUser)

module.exports = router
