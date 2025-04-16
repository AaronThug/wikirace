const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// @route   GET api/leaderboard/games-won
// @desc    Get top players by games won
// @access  Public
router.get('/games-won', leaderboardController.getTopPlayersByGamesWon);

// @route   GET api/leaderboard/best-time
// @desc    Get top players by best time
// @access  Public
router.get('/best-time', leaderboardController.getTopPlayersByBestTime);

// @route   GET api/leaderboard/fewest-clicks
// @desc    Get top players by fewest clicks
// @access  Public
router.get('/fewest-clicks', leaderboardController.getTopPlayersByFewestClicks);

// @route   GET api/leaderboard/combined
// @desc    Get combined leaderboard
// @access  Public
router.get('/combined', leaderboardController.getCombinedLeaderboard);

module.exports = router;