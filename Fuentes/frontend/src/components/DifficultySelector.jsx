import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getDifficulties } from '../services/api';
import './DifficultySelector.css';

const DifficultyOption = ({ difficulty, isSelected, onClick }) => (
  <div 
    className={`difficulty-option ${isSelected ? 'selected' : ''}`}
    onClick={onClick}
    aria-label={`Select ${difficulty.name} difficulty`}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    <div className="difficulty-name">{difficulty.name}</div>
    {difficulty.description && (
      <div className="difficulty-description">{difficulty.description}</div>
    )}
    <div className="difficulty-meta">
      {difficulty.clues && (
        <span className="meta-item">Clues: {difficulty.clues}</span>
      )}
      {difficulty.level && (
        <span className="meta-item">Level: {difficulty.level}/10</span>
      )}
    </div>
  </div>
);

DifficultyOption.propTypes = {
  difficulty: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    clues: PropTypes.number,
    level: PropTypes.number
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

const DifficultySelector = ({ selectedDifficulty, onChange, onLoading }) => {
  const [difficulties, setDifficulties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDifficulties = async () => {
      try {
        setLoading(true);
        if (onLoading) onLoading(true);
        
        const difficultiesData = await getDifficulties();
        
        if (isMounted) {
          // Ensure all difficulties have valid IDs before setting state
          const validDifficulties = difficultiesData.filter(diff => diff && diff.iddifficulty != null);
          setDifficulties(validDifficulties);
          if (!selectedDifficulty && validDifficulties.length > 0) {
            onChange(validDifficulties[0].iddifficulty);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching difficulties:', err);
          setError('Failed to load difficulty levels');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          if (onLoading) onLoading(false);
        }
      }
    };

    fetchDifficulties();

    return () => {
      isMounted = false;
    };
  }, [onChange, selectedDifficulty, onLoading]);

  if (loading) {
    return (
      <div className="loading-difficulties" aria-live="polite">
        Loading difficulty levels...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-difficulties" aria-live="assertive">
        {error}
      </div>
    );
  }

  if (difficulties.length === 0) {
    return (
      <div className="no-difficulties" aria-live="polite">
        No difficulty levels available        
      </div>
      
    );
  }

  return (
    <div className="difficulty-selector-container">
      <h2 className="selector-title">Select Difficulty</h2>
      
      <div className="difficulty-options" role="list">
        {difficulties.map((difficulty, index) => (
          <DifficultyOption 
            key={difficulty.iddifficulty ? `difficulty-${difficulty.iddifficulty}` : `difficulty-fallback-${index}`}
            difficulty={difficulty}
            isSelected={selectedDifficulty === difficulty.iddifficulty}
            onClick={() => onChange(difficulty.iddifficulty)}
          />
        ))}
      </div>
    </div>
  );
};

DifficultySelector.propTypes = {
  selectedDifficulty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onLoading: PropTypes.func
};

export default React.memo(DifficultySelector);