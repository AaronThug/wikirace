const Game = require('../models/Game');
const User = require('../models/User');
const axios = require('axios');

// Helper function to get random Wikipedia articles
async function getRandomWikipediaArticle() {
  try {
    const response = await axios.get(
      'https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*'
    );
    
    const title = response.data.query.random[0].title;
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    
    return { title, url };
  } catch (error) {
    console.error('Error fetching random article:', error);
    throw new Error('Failed to fetch random Wikipedia article');
  }
}

// Create a new game
exports.createGame = async (req, res) => {
  try {
    const { customStart, customTarget } = req.body;
    const isRandomMode = !customStart || !customTarget;
    
    let startArticle, targetArticle;
    
    // Get random or custom articles
    if (isRandomMode) {
      startArticle = await getRandomWikipediaArticle();
      
      // Make sure target is different from start
      do {
        targetArticle = await getRandomWikipediaArticle();
      } while (targetArticle.title === startArticle.title);
    } else {
      // Validate custom articles
      if (!customStart || !customTarget) {
        return res.status(400).json({ msg: 'Both start and target articles are required for custom mode' });
      }
      
      startArticle = {
        title: customStart.title,
        url: customStart.url
      };
      
      targetArticle = {
        title: customTarget.title,
        url: customTarget.url
      };
    }
    
    // Create new game
    const newGame = new Game({
      user: req.user.id,
      startArticle,
      targetArticle,
      isRandomMode,
      path: [{ 
        title: startArticle.title, 
        url: startArticle.url,
        timestamp: Date.now()
      }]
    });
    
    await newGame.save();
    
    res.json(newGame);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update game progress (add new article to path)
exports.updateGameProgress = async (req, res) => {
  try {
    const { gameId, article } = req.body;
    
    // Find game
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ msg: 'Game not found' });
    }
    
    // Check if user owns this game
    if (game.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Add article to path
    game.path.push({
      title: article.title,
      url: article.url,
      timestamp: Date.now()
    });
    
    // Update total clicks
    game.totalClicks += 1;
    
    // Check if target reached
    const isTargetReached = article.title === game.targetArticle.title;
    
    if (isTargetReached) {
      game.status = 'completed';
      game.completed = true;
      game.endTime = Date.now();
      game.totalTime = (game.endTime - game.startTime) / 1000; // in seconds
      
      // Update user stats
      const user = await User.findById(req.user.id);
      user.stats.gamesPlayed += 1;
      user.stats.gamesWon += 1;
      
      // Update average clicks
      const prevTotal = user.stats.averageClicks * (user.stats.gamesWon - 1);
      user.stats.averageClicks = (prevTotal + game.totalClicks) / user.stats.gamesWon;
      
      // Update fastest time if applicable
      if (!user.stats.fastestTime || game.totalTime < user.stats.fastestTime) {
        user.stats.fastestTime = game.totalTime;
      }
      
      // Update random game stats if applicable
      if (game.isRandomMode) {
        user.stats.totalRandomGamesPlayed += 1;
        user.stats.totalRandomGamesWon += 1;
        
        // Update best time for random games
        if (!user.stats.bestRandomTime || game.totalTime < user.stats.bestRandomTime) {
          user.stats.bestRandomTime = game.totalTime;
        }
        
        // Update fewest clicks
        if (!user.stats.fewestClicks || game.totalClicks < user.stats.fewestClicks) {
          user.stats.fewestClicks = game.totalClicks;
        }
      }
      
      await user.save();
    }
    
    await game.save();
    
    res.json({
      game,
      isTargetReached
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get active game for a user
exports.getActiveGame = async (req, res) => {
  try {
    const game = await Game.findOne({
      user: req.user.id,
      status: 'active'
    }).sort({ startTime: -1 });
    
    if (!game) {
      return res.status(404).json({ msg: 'No active game found' });
    }
    
    res.json(game);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get game details
exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ msg: 'Game not found' });
    }
    
    // Check if user owns this game
    if (game.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(game);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Abandon game
exports.abandonGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ msg: 'Game not found' });
    }
    
    // Check if user owns this game
    if (game.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    game.status = 'abandoned';
    game.endTime = Date.now();
    
    await game.save();
    
    // Update user stats
    const user = await User.findById(req.user.id);
    user.stats.gamesPlayed += 1;
    
    if (game.isRandomMode) {
      user.stats.totalRandomGamesPlayed += 1;
    }
    
    await user.save();
    
    res.json(game);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Wikipedia article content
exports.getWikipediaArticle = async (req, res) => {
  try {
    const { title } = req.params;
    
    const response = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&origin=*&prop=text`
    );
    
    if (response.data.error) {
      return res.status(404).json({ msg: 'Article not found' });
    }
    
    // Extract and send the HTML content
    const content = response.data.parse.text['*'];
    
    res.json({ content });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};