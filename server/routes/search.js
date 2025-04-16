const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const searchController = require('../controllers/searchController');

// @route   GET api/search/users
// @desc    Search users by username
// @access  Public
router.get('/users', searchController.searchUsers);

// @route   GET api/search/wikipedia
// @desc    Search Wikipedia articles
// @access  Private
router.get('/wikipedia', auth, searchController.searchWikipediaArticles);

module.exports = router;