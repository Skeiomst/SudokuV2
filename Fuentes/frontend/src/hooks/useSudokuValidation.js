import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useSudokuValidation = (initialPuzzleId, initialSolution) => {
  const [puzzleId, setPuzzleId] = useState(initialPuzzleId);
  const [solution, setSolution] = useState(initialSolution);
  const [validationCache, setValidationCache] = useState({});
  const [serverValidations, setServerValidations] = useState({});

  // Validación local inmediata
  const validateCellLocally = useCallback((row, col, value) => {
    if (!solution) return { valid: null };
    
    const isValid = solution[row][col] === value;
    return { valid: isValid, correctValue: isValid ? null : solution[row][col] };
  }, [solution]);

  // Validación con el servidor (con cache)
  const validateCellWithServer = useCallback(async (row, col, value) => {
    if (!puzzleId) return { valid: null };
    
    const cellKey = `${row}-${col}`;
    const cachedValidation = serverValidations[cellKey];
    
    // Si ya tenemos una validación reciente (< 30 segundos), la reusamos
    if (cachedValidation && (Date.now() - cachedValidation.validatedAt < 30000)) {
      return cachedValidation;
    }
    
    // Si no, llamamos al servidor
    const serverValidation = await api.validateCellWithServer(puzzleId, row, col, value);
    
    if (!serverValidation.error) {
      setServerValidations(prev => ({
        ...prev,
        [cellKey]: serverValidation
      }));
    }
    
    return serverValidation;
  }, [puzzleId, serverValidations]);

  // Validación combinada
  const validateCell = useCallback(async (row, col, value, forceServer = false) => {
    if (value === 0) {
      return { valid: null, correctValue: null };
    }
    
    // Primero validación local
    const localValidation = validateCellLocally(row, col, value);
    
    // Si la validación local dice que es incorrecta, no necesitamos validar con el servidor
    if (localValidation.valid === false) {
      return localValidation;
    }
    
    // Si es correcta localmente, verificamos con el servidor si es necesario
    if (forceServer || localValidation.valid === true) {
      const serverValidation = await validateCellWithServer(row, col, value);
      
      // Si el servidor no responde, confiamos en la validación local
      if (serverValidation.error) {
        return localValidation;
      }
      
      return serverValidation;
    }
    
    return localValidation;
  }, [validateCellLocally, validateCellWithServer]);

  // Actualizar puzzle y solución
  const updatePuzzle = useCallback((newPuzzleId, newSolution) => {
    setPuzzleId(newPuzzleId);
    setSolution(newSolution);
    setValidationCache({});
    setServerValidations({});
  }, []);

  return {
    validateCell,
    validateCellLocally,
    validateCellWithServer,
    updatePuzzle,
    solution
  };
};

export default useSudokuValidation;