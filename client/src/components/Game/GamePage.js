import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ArticleDisplay from './ArticleDisplay';
import GameStats from './GameStats';
import { AuthContext } from '../../context/AuthContext';

const GamePage = () => {
  const [game, setGame] = useState(null);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [showCreateGameForm, setShowCreateGameForm] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customTarget, setCustomTarget] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('start'); // 'start' or 'target'
  
  const { user } = useContext(AuthContext);

  // Check for active game on component mount
  useEffect(() => {
    const checkActiveGame = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get('/api/game/active', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        setGame(res.data);
        
        // Set current article to the last article in the path
        const lastArticle = res.data.path[res.data.path.length - 1];
        setCurrentArticle({
          title: lastArticle.title,
          url: lastArticle.url
        });
        
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // No active game found, this is okay
          setShowCreateGameForm(true);
        } else {
          console.error('Error checking active game:', err);
          setError('Failed to load active game');
        }
      } finally {
        setLoading(false);
      }
    };

    checkActiveGame();
  }, []);

  // Handle article link clicks
  const handleLinkClick = async (article) => {
    try {
      if (!game) return;
      
      setLoading(true);
      
      const res = await axios.put('/api/game/progress', 
        {
          gameId: game._id,
          article
        },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      setGame(res.data.game);
      setCurrentArticle(article);
      
      if (res.data.isTargetReached) {
        setIsGameCompleted(true);
      }
      
    } catch (err) {
      console.error('Error updating game progress:', err);
      setError('Failed to update game progress');
    } finally {
      setLoading(false);
    }
  };

  // Create new game
  const createGame = async (isRandomMode = true) => {
    try {
      setLoading(true);
      setError(null);
      
      let gameData = { isRandomMode };
      
      if (!isRandomMode && customStart && customTarget) {
        // Parse selected articles
        const startArticle = JSON.parse(customStart);
        const targetArticle = JSON.parse(customTarget);
        
        gameData = {
          ...gameData,
          customStart: startArticle,
          customTarget: targetArticle
        };
      }
      
      const res = await axios.post('/api/game', gameData, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setGame(res.data);
      
      // Set current article to start article
      setCurrentArticle({
        title: res.data.startArticle.title,
        url: res.data.startArticle.url
      });
      
      setShowCreateGameForm(false);
      setIsGameCompleted(false);
      
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  // Abandon current game
  const abandonGame = async () => {
    try {
      if (!game) return;
      
      setLoading(true);
      
      await axios.put(`/api/game/${game._id}/abandon`, {}, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Reset state for new game
      setGame(null);
      setCurrentArticle(null);
      setShowCreateGameForm(true);
      setIsGameCompleted(false);
      
    } catch (err) {
      console.error('Error abandoning game:', err);
      setError('Failed to abandon game');
    } finally {
      setLoading(false);
    }
  };

  // Search Wikipedia articles for custom game
  const searchWikipedia = async (e) => {
    e.preventDefault();
    
    if (!searchTerm) return;
    
    try {
      setSearchLoading(true);
      
      const res = await axios.get(`/api/search/wikipedia?query=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setSearchResults(res.data);
    } catch (err) {
      console.error('Error searching Wikipedia:', err);
      setError('Failed to search Wikipedia');
    } finally {
      setSearchLoading(false);
    }
  };

  // Select article for start or target
  const selectArticle = (article) => {
    if (searchType === 'start') {
      setCustomStart(JSON.stringify(article));
    } else {
      setCustomTarget(JSON.stringify(article));
    }
    
    setSearchResults([]);
    setSearchTerm('');
  };

  // Render create game form
  const renderCreateGameForm = () => {
    return (
      <div className="auth-form">
        <h2>Start a New Game</h2>
        <div className="form-group">
          <button 
            className="btn btn-primary"
            onClick={() => createGame(true)}
            disabled={loading}
          >
            Start Random Game
          </button>
        </div>
        
        <h3>Or Create Custom Game</h3>
        <div className="form-group">
          <label>Start Article:</label>
          {customStart ? (
            <div className="selected-article">
              <p>{JSON.parse(customStart).title}</p>
              <button 
                className="btn btn-danger"
                onClick={() => setCustomStart('')}
              >
                Change
              </button>
            </div>
          ) : (
            <button
              className="btn"
              onClick={() => setSearchType('start')}
            >
              Search Start Article
            </button>
          )}
        </div>
        
        <div className="form-group">
          <label>Target Article:</label>
          {customTarget ? (
            <div className="selected-article">
              <p>{JSON.parse(customTarget).title}</p>
              <button 
                className="btn btn-danger"
                onClick={() => setCustomTarget('')}
              >
                Change
              </button>
            </div>
          ) : (
            <button
              className="btn"
              onClick={() => setSearchType('target')}
            >
              Search Target Article
            </button>
          )}
        </div>
        
        <button
          className="btn btn-success"
          onClick={() => createGame(false)}
          disabled={loading || !customStart || !customTarget}
        >
          Start Custom Game
        </button>
      </div>
    );
  };

  // Render search interface
  const renderSearchInterface = () => {
    return (
      <div className="search-container">
        <h3>Search {searchType === 'start' ? 'Start' : 'Target'} Article</h3>
        <form className="search-form" onSubmit={searchWikipedia}>
          <input
            type="text"
            className="search-input"
            placeholder="Search Wikipedia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={searchLoading}>
            Search
          </button>
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={() => {
              setSearchResults([]);
              setSearchTerm('');
              setSearchType('');
            }}
          >
            Cancel
          </button>
        </form>
        
        {searchLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
        
        <div className="search-results">
          {searchResults.map((result, index) => (
            <div key={index} className="search-result-item">
              <h4>{result.title}</h4>
              <div dangerouslySetInnerHTML={{ __html: result.snippet }} />
              <button 
                className="btn btn-primary"
                onClick={() => selectArticle(result)}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && !game && !showCreateGameForm) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  // Show search interface if searching
  if (searchType) {
    return renderSearchInterface();
  }

  // Show create game form if no active game
  if (showCreateGameForm) {
    return renderCreateGameForm();
  }

  return (
    <div className="game-container">
      {error && <div className="alert alert-danger">{error}</div>}
      
      {game && (
        <>
          <GameStats 
            game={game} 
            isCompleted={isGameCompleted}
            onAbandon={abandonGame}
            onNewGame={() => {
              setGame(null);
              setCurrentArticle(null);
              setShowCreateGameForm(true);
              setIsGameCompleted(false);
            }}
          />
          
          {!isGameCompleted && currentArticle && (
            <ArticleDisplay 
              article={currentArticle}
              onLinkClick={handleLinkClick}
              loading={loading}
              setLoading={setLoading}
            />
          )}
          
          {isGameCompleted && (
            <div className="game-complete">
              <h2>Congratulations!</h2>
              <p>You've successfully reached the target article: <strong>{game.targetArticle.title}</strong></p>
              <p>Clicks: {game.totalClicks}</p>
              <p>Time: {Math.floor(game.totalTime / 60)}m {Math.round(game.totalTime % 60)}s</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setGame(null);
                  setCurrentArticle(null);
                  setShowCreateGameForm(true);
                  setIsGameCompleted(false);
                }}
              >
                Start New Game
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GamePage;