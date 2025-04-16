const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const gameController = require('../controllers/gameController');

// @route   POST api/game
// @desc    Create a new game
// @access  Private
router.post('/', auth, gameController.createGame);

// @route   PUT api/game/progress
// @desc    Update game progress
// @access  Private
router.put('/progress', auth, gameController.updateGameProgress);

// @route   GET api/game/active
// @desc    Get active game for a user
// @access  Private
router.get('/active', auth, gameController.getActiveGame);

// @route   GET api/game/:gameId
// @desc    Get game details
// @access  Private
router.get('/:gameId', auth, gameController.getGameById);

// @route   PUT api/game/:gameId/abandon
// @desc    Abandon game
// @access  Private
router.put('/:gameId/abandon', auth, gameController.abandonGame);

// @route   GET api/game/wikipedia/:title
// @desc    Get Wikipedia article content
// @access  Private
router.get('/wikipedia/:title', auth, gameController.getWikipediaArticle);

module.exports = router;