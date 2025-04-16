import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({
    mostGamesWon: [],
    bestTime: [],
    fewestClicks: []
  });
  const [activeTab, setActiveTab] = useState('mostGamesWon');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get('/api/leaderboard/combined');
        setLeaderboardData(res.data);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Format time from seconds to minutes:seconds
  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'mostGamesWon':
        return (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Games Won</th>
                <th>Games Played</th>
                <th>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.mostGamesWon.map((player, index) => (
                <tr key={player._id}>
                  <td>{index + 1}</td>
                  <td>
                    <Link to={`/profile/${player.username}`}>
                      {player.username}
                    </Link>
                  </td>
                  <td>{player.stats.totalRandomGamesWon || 0}</td>
                  <td>{player.stats.totalRandomGamesPlayed || 0}</td>
                  <td>
                    {player.stats.totalRandomGamesPlayed
                      ? `${Math.round((player.stats.totalRandomGamesWon / player.stats.totalRandomGamesPlayed) * 100)}%`
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      case 'bestTime':
        return (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Best Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.bestTime.map((player, index) => (
                <tr key={player._id}>
                  <td>{index + 1}</td>
                  <td>
                    <Link to={`/profile/${player.username}`}>
                      {player.username}
                    </Link>
                  </td>
                  <td>{formatTime(player.stats.bestRandomTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      case 'fewestClicks':
        return (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Fewest Clicks</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.fewestClicks.map((player, index) => (
                <tr key={player._id}>
                  <td>{index + 1}</td>
                  <td>
                    <Link to={`/profile/${player.username}`}>
                      {player.username}
                    </Link>
                  </td>
                  <td>{player.stats.fewestClicks || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      default:
        return <p>Select a tab to view leaderboard</p>;
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">WikiRace Leaderboard</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="leaderboard-tabs">
        <button
          className={`tab-button ${activeTab === 'mostGamesWon' ? 'active' : ''}`}
          onClick={() => setActiveTab('mostGamesWon')}
        >
          Most Games Won
        </button>
        <button
          className={`tab-button ${activeTab === 'bestTime' ? 'active' : ''}`}
          onClick={() => setActiveTab('bestTime')}
        >
          Best Time
        </button>
        <button
          className={`tab-button ${activeTab === 'fewestClicks' ? 'active' : ''}`}
          onClick={() => setActiveTab('fewestClicks')}
        >
          Fewest Clicks
        </button>
      </div>
      
      <div className="leaderboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Leaderboard;