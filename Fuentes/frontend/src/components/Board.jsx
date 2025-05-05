import React, { useState, useEffect, useCallback } from 'react';
import useSudokuValidation from '../hooks/useSudokuValidation';
import Cell from './Cell';
import { generateSudoku } from '../services/api';
import '../styles/SudokuBoard.css';

const Board = ({ difficulty, onPuzzleComplete }) => {
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [mask, setMask] = useState(Array(9).fill().map(() => Array(9).fill(false)));
  const [puzzleId, setPuzzleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCell, setActiveCell] = useState(null);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    empty: 81
  });

  const {
    validateCell,
    validateCellLocally,
    updatePuzzle,
    solution
  } = useSudokuValidation();

  // Cargar nuevo sudoku
  useEffect(() => {
    const loadNewSudoku = async () => {
      setLoading(true);
      try {
        console.log('pp:', difficulty);
        const data = await generateSudoku(difficulty);
        console.log('data:', data);
        setBoard(data.puzzle);
        setMask(data.mask);
        setPuzzleId(data.iddifficulty);
        updatePuzzle(data.iddifficulty, data.solution);
        setStats({
          correct: 0,
          incorrect: 0,
          empty: data.puzzle.flat().filter(cell => cell === 0).length
        });
      } catch (error) {
        console.error('Error loading sudoku:', error);
        setError('No se pudo cargar el Sudoku. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadNewSudoku();
  }, [difficulty, updatePuzzle]);

  // Manejador de cambios en celdas
  const handleCellChange = useCallback(async (row, col, value) => {
    const newBoard = [...board];
    newBoard[row][col] = value;
    setBoard(newBoard);

    // Validación local inmediata
    const localValidation = validateCellLocally(row, col, value);
    
    // Actualizar estadísticas
    setStats(prev => {
      const newStats = {...prev};
      
      if (value === 0) {
        newStats.empty++;
        if (localValidation.valid === true) newStats.correct--;
        if (localValidation.valid === false) newStats.incorrect--;
      } else {
        if (board[row][col] === 0) newStats.empty--;
        
        if (localValidation.valid === true) {
          if (board[row][col] !== value) newStats.correct++;
        } else if (localValidation.valid === false) {
          if (board[row][col] !== value) newStats.incorrect++;
        }
      }
      
      return newStats;
    });

    // Validación con el servidor después de un retraso
    if (value !== 0) {
      const timer = setTimeout(async () => {
        await validateCell(row, col, value);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [board, validateCellLocally, validateCell]);

  // Verificar si el tablero está completo y correcto
  useEffect(() => {
    if (stats.empty === 0 && stats.incorrect === 0 && onPuzzleComplete) {
      onPuzzleComplete();
    }
  }, [stats, onPuzzleComplete]);

  // Resaltar celdas relacionadas
  const isCellHighlighted = useCallback((row, col) => {
    if (!activeCell) return false;
    
    const [activeRow, activeCol] = activeCell;
    return (
      row === activeRow ||
      col === activeCol ||
      (Math.floor(row / 3) === Math.floor(activeRow / 3) &&
      (Math.floor(col / 3) === Math.floor(activeCol / 3)
    )));
  }, [activeCell]);

  if (loading) {
    return <div className="loading">Generando Sudoku...</div>;
  }

  return (
    <div className="sudoku-container">
      <div className="sudoku-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {row.map((cell, colIndex) => {
              const localValidation = validateCellLocally(rowIndex, colIndex, cell);
              return (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  value={cell}
                  row={rowIndex}
                  col={colIndex}
                  isInitial={mask[rowIndex][colIndex]}
                  isValid={localValidation.valid}
                  correctValue={localValidation.correctValue}
                  isHighlighted={isCellHighlighted(rowIndex, colIndex)}
                  onChange={handleCellChange}
                  onFocus={setActiveCell}
                  onBlur={() => setActiveCell(null)}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="sudoku-stats">
        <div className="stat correct">
          <span className="stat-label">Correctas:</span>
          <span className="stat-value">{stats.correct}</span>
        </div>
        <div className="stat incorrect">
          <span className="stat-label">Incorrectas:</span>
          <span className="stat-value">{stats.incorrect}</span>
        </div>
        <div className="stat empty">
          <span className="stat-label">Vacías:</span>
          <span className="stat-value">{stats.empty}</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Board);