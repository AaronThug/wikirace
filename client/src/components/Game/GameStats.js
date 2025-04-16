import React from 'react';

const GameStats = ({ game, isCompleted, onAbandon, onNewGame }) => {
  // Calculate elapsed time
  const calculateElapsedTime = () => {
    if (isCompleted) {
      return game.totalTime;
    }
    
    const startTime = new Date(game.startTime).getTime();
    const currentTime = new Date().getTime();
    return Math.floor((currentTime - startTime) / 1000); // in seconds
  };
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Get current position in path
  const currentPosition = game.path.length;

  return (
    <div className="game-header">
      <div className="game-info">
        <h3>WikiRace Challenge</h3>
        <p>
          Start: <strong>{game.startArticle.title}</strong> → 
          Target: <strong>{game.targetArticle.title}</strong>
        </p>
        <p>
          Clicks: <strong>{game.totalClicks}</strong> | 
          Time: <strong>{formatTime(calculateElapsedTime())}</strong>
        </p>
        <p>Current Path:</p>
        <div className="path-display">
          <ol>
            {game.path.map((article, index) => (
              <li key={index}>
                {article.title}
                {index === game.path.length - 1 && !isCompleted && ' (Current)'}
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      <div className="game-actions">
        {isCompleted ? (
          <button 
            className="btn btn-primary"
            onClick={onNewGame}
          >
            New Game
          </button>
        ) : (
          <button 
            className="btn btn-danger"
            onClick={onAbandon}
          >
            Abandon Game
          </button>
        )}
      </div>
    </div>
  );
};

export default GameStats;