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
  deleteMember
} = require('../controllers/community.controller')

const router = require('express').Router()

router.get('/getAll', getAllCommunity)
router.get('/get/:communityId', getOneCommunity)
router.get('/getMembers/:communityId', getMembers)
router.post('/add', addCommunity)
router.patch('/update/:communityId', updateCommunity)
router.delete('/delete/:communityId', deleteCommunity)
router.post('/join/:communityId', joinCommunity)
router.post('/leave/:communityId', leaveCommunity)
router.post('/addModerator/:communityId', addModerator)
router.post('/deleteMember/:communityId', deleteMember)

module.exports = router
