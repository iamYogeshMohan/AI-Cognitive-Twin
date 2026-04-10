const router = require('express').Router()
const { getFeatures } = require('../controllers/features.controller')

// The features list is just static JSON metadata for the UI, no JWT protection needed!
router.get('/', getFeatures)

module.exports = router
