import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false 
});


const generateSudoku = async (difficulty) => {
  const response = await api.get(`/sudoku/generate/${difficulty}`);
  console.log(response.data);
  console.log("hOLA")
  return response.data;
  
};

const getDifficulties = async () => {
  try {
    const response = await api.get('/difficulties');
    return response.data;
  } catch (error) {
    console.error('Error fetching difficulties:', error);
    throw error; 
  }
};

const checkBackendConnection = async () => {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
};

const validationCache = new Map();

const validateCellWithServer = async (puzzleId, row, col, value) => {
  const cacheKey = `${puzzleId}-${row}-${col}-${value}`;
  
  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey);
  }

  try {
    const response = await api.post('/sudoku/validate-cell', {
      puzzle_id: puzzleId,
      row,
      col,
      value
    });
    const result = {
      ...response.data,
      validatedAt: Date.now()
    };
    
    validationCache.set(cacheKey, result);
    setTimeout(() => validationCache.delete(cacheKey), 30000);
    
    return result;
  } catch (error) {
    console.error('Validation error:', error);
    return { 
      valid: null, 
      error: true,
      status: error.response?.status,
      message: error.message
    };
  }
};

const validateBoard = async (puzzleId, board) => {
  const emptyCells = board.flat().filter(cell => cell === 0).length;
  if (emptyCells > 0) {
    return {
      valid: false,
      reason: 'empty_cells',
      message: `Hay ${emptyCells} celdas vacías`
    };
  }

  try {
    const { data } = await api.post('/sudoku/validate', {
      puzzle_id: puzzleId,
      solution: board
    });
    return data;
  } catch (error) {
    console.error('Board validation failed:', error);
    return {
      valid: false,
      error: error.message,
      details: error.response?.data
    };
  }
};

export {
  generateSudoku,
  validateCellWithServer,
  validateBoard,
  getDifficulties,
  checkBackendConnection
};

export default api;