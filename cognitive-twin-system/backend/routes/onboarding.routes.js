const router = require('express').Router()
const { getOnboarding, saveOnboarding } = require('../controllers/onboarding.controller')
const { protect } = require('../middleware/auth.middleware')
router.get('/',  protect, getOnboarding)
router.post('/', protect, saveOnboarding)
module.exports = router
