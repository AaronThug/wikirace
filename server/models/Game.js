const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startArticle: {
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  targetArticle: {
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  isRandomMode: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  path: [{
    title: String,
    url: String,
    timestamp: Date
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  totalTime: {
    type: Number,
    default: null // in seconds
  },
  totalClicks: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Game', GameSchema);