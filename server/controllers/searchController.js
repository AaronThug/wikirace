const User = require('../models/User');

// Search users by username
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    })
    .select('username stats.gamesWon stats.totalRandomGamesWon')
    .limit(10);
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Search Wikipedia articles
exports.searchWikipediaArticles = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    const axios = require('axios');
    const response = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    
    const results = response.data.query.search.map(item => ({
      title: item.title,
      snippet: item.snippet,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`
    }));
    
    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};