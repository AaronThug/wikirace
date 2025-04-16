const User = require('../models/User');
const Game = require('../models/Game');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get recent games
    const recentGames = await Game.find({ user: req.user.id })
      .sort({ startTime: -1 })
      .limit(5);
    
    res.json({
      user,
      recentGames
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get public profile by username
exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username }).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get stats for completed games
    const completedGames = await Game.find({ 
      user: user._id,
      status: 'completed'
    }).sort({ startTime: -1 }).limit(5);
    
    // Get stats for random games
    const randomGamesStats = {
      gamesPlayed: user.stats.totalRandomGamesPlayed,
      gamesWon: user.stats.totalRandomGamesWon,
      bestTime: user.stats.bestRandomTime,
      fewestClicks: user.stats.fewestClicks
    };
    
    res.json({
      user,
      completedGames,
      randomGamesStats
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user game history
exports.getUserGameHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const games = await Game.find({ user: req.user.id })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Game.countDocuments({ user: req.user.id });
    
    res.json({
      games,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};