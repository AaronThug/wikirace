const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0
    },
    gamesWon: {
      type: Number,
      default: 0
    },
    fastestTime: {
      type: Number,
      default: null // in seconds
    },
    averageClicks: {
      type: Number,
      default: 0
    },
    totalRandomGamesPlayed: {
      type: Number,
      default: 0
    },
    totalRandomGamesWon: {
      type: Number,
      default: 0
    },
    bestRandomTime: {
      type: Number,
      default: null
    },
    fewestClicks: {
      type: Number,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password hash middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);