import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to WikiRace</h1>
        <p className="lead">Navigate from one Wikipedia article to another in the fewest clicks!</p>
      </div>

      <div className="home-content">
        <div className="game-explanation">
          <h2>How to Play</h2>
          <ol>
            <li>Start at a random Wikipedia article</li>
            <li>Navigate to a target article using only Wikipedia links</li>
            <li>Try to reach the target in as few clicks as possible</li>
            <li>Compete with others on the leaderboard</li>
          </ol>
        </div>

        <div className="game-features">
          <h2>Features</h2>
          <ul>
            <li>Random or custom article challenges</li>
            <li>Track your stats and history</li>
            <li>Compare your performance on the leaderboard</li>
            <li>Race against time to improve your skills</li>
          </ul>
        </div>

        <div className="action-buttons">
          {isAuthenticated ? (
            <div>
              <Link to="/game" className="btn btn-primary">
                Start Playing
              </Link>
              <Link to="/profile" className="btn">
                View Profile
              </Link>
            </div>
          ) : (
            <div>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
              <Link to="/login" className="btn">
                Login
              </Link>
            </div>
          )}
          <Link to="/leaderboard" className="btn">
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;