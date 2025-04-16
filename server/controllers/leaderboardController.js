const User = require('../models/User');

// Get top players by games won (random mode only)
exports.getTopPlayersByGamesWon = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topPlayers = await User.find({
      'stats.totalRandomGamesWon': { $gt: 0 }
    })
    .select('username stats.totalRandomGamesWon stats.totalRandomGamesPlayed')
    .sort({ 'stats.totalRandomGamesWon': -1 })
    .limit(limit);
    
    res.json(topPlayers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get top players by best time (random mode only)
exports.getTopPlayersByBestTime = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topPlayers = await User.find({
      'stats.bestRandomTime': { $ne: null }
    })
    .select('username stats.bestRandomTime')
    .sort({ 'stats.bestRandomTime': 1 })
    .limit(limit);
    
    res.json(topPlayers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get top players by fewest clicks (random mode only)
exports.getTopPlayersByFewestClicks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topPlayers = await User.find({
      'stats.fewestClicks': { $ne: null }
    })
    .select('username stats.fewestClicks')
    .sort({ 'stats.fewestClicks': 1 })
    .limit(limit);
    
    res.json(topPlayers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get combined leaderboard
exports.getCombinedLeaderboard = async (req, res) => {
  try {
    const gamesWonPlayers = await User.find({
      'stats.totalRandomGamesWon': { $gt: 0 }
    })
    .select('username stats.totalRandomGamesWon')
    .sort({ 'stats.totalRandomGamesWon': -1 })
    .limit(10);
    
    const bestTimePlayers = await User.find({
      'stats.bestRandomTime': { $ne: null }
    })
    .select('username stats.bestRandomTime')
    .sort({ 'stats.bestRandomTime': 1 })
    .limit(10);
    
    const fewestClicksPlayers = await User.find({
      'stats.fewestClicks': { $ne: null }
    })
    .select('username stats.fewestClicks')
    .sort({ 'stats.fewestClicks': 1 })
    .limit(10);
    
    res.json({
      mostGamesWon: gamesWonPlayers,
      bestTime: bestTimePlayers,
      fewestClicks: fewestClicksPlayers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};