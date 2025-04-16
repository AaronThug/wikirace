const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', auth, profileController.getUserProfile);

// @route   GET api/profile/games
// @desc    Get user's game history
// @access  Private
router.get('/games', auth, profileController.getUserGameHistory);

// @route   GET api/profile/user/:username
// @desc    Get profile by username
// @access  Public
router.get('/user/:username', profileController.getPublicProfile);

module.exports = router;