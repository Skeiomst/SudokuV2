import React, { useState } from 'react';
import Board from './components/Board';
import DifficultySelector from './components/DifficultySelector';
import './App.css';

function App() {
  const [difficulty, setDifficulty] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [loadingDifficulties, setLoadingDifficulties] = useState(true);

  const handleStartGame = () => {
    if (difficulty) {
      setGameStarted(true);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sudoku Master</h1>
        <p>Select a difficulty level to start</p>
      </header>

      <main className="app-main">
        {!gameStarted ? (
          <div className="start-screen">
            <DifficultySelector 
              selectedDifficulty={difficulty}
              onChange={setDifficulty}
              onLoading={setLoadingDifficulties}
            />
            
            <button 
              className={`start-button ${!difficulty ? 'disabled' : ''}`}
              onClick={handleStartGame}
              disabled={!difficulty || loadingDifficulties}
            >
              {loadingDifficulties ? 'Loading...' : 'Start Game'}
            </button>
          </div>
        ) : (
          <div className="game-container">
            <Board 
              difficulty={difficulty} 
              onNewGame={() => setGameStarted(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;