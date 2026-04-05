/* ========================================
   GAMEHUB - Storage Manager
   Handles all localStorage operations for game scores and statistics
   ======================================== */

const StorageManager = (() => {
  const STORAGE_KEYS = {
    MEMORY_SCORES: 'gamehub_memory_scores',
    MEMORY_BEST: 'gamehub_memory_best',
    TICTACTOE_RESULTS: 'gamehub_tictactoe_results',
    REACTION_TIMES: 'gamehub_reaction_times',
    REACTION_BEST: 'gamehub_reaction_best',
    LAST_GAME: 'gamehub_last_game',
    TOTAL_GAMES: 'gamehub_total_games',
    GAME_HISTORY: 'gamehub_game_history',
  };

  /**
   * Initialize storage if it doesn't exist
   */
  const initialize = () => {
    if (!localStorage.getItem(STORAGE_KEYS.MEMORY_SCORES)) {
      localStorage.setItem(STORAGE_KEYS.MEMORY_SCORES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMORY_BEST)) {
      localStorage.setItem(STORAGE_KEYS.MEMORY_BEST, JSON.stringify(null));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICTACTOE_RESULTS)) {
      localStorage.setItem(STORAGE_KEYS.TICTACTOE_RESULTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REACTION_TIMES)) {
      localStorage.setItem(STORAGE_KEYS.REACTION_TIMES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REACTION_BEST)) {
      localStorage.setItem(STORAGE_KEYS.REACTION_BEST, JSON.stringify(null));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOTAL_GAMES)) {
      localStorage.setItem(STORAGE_KEYS.TOTAL_GAMES, JSON.stringify(0));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GAME_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify([]));
    }
  };

  /**
   * Memory Game Functions
   */
  const saveMemoryScore = (moves) => {
    const scores = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMORY_SCORES)) || [];
    const newScore = {
      moves,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
    };
    scores.push(newScore);
    localStorage.setItem(STORAGE_KEYS.MEMORY_SCORES, JSON.stringify(scores));

    // Update best score
    const currentBest = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMORY_BEST));
    if (!currentBest || moves < currentBest.moves) {
      localStorage.setItem(STORAGE_KEYS.MEMORY_BEST, JSON.stringify(newScore));
    }

    // Update game history
    addToGameHistory('Memory Game', `${moves} moves`, 'completed');
    incrementTotalGames();
    setLastGame('Memory Game');

    return newScore;
  };

  const getMemoryScores = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMORY_SCORES)) || [];
  };

  const getMemoryBestScore = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMORY_BEST));
  };

  /**
   * Tic Tac Toe Functions
   */
  const saveTicTacToeResult = (result) => {
    // result should be: 'win', 'loss', or 'draw'
    const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICTACTOE_RESULTS)) || [];
    const newResult = {
      result,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
    };
    results.push(newResult);
    localStorage.setItem(STORAGE_KEYS.TICTACTOE_RESULTS, JSON.stringify(results));

    // Update game history
    addToGameHistory('Tic Tac Toe', result.charAt(0).toUpperCase() + result.slice(1), 'completed');
    incrementTotalGames();
    setLastGame('Tic Tac Toe');

    return newResult;
  };

  const getTicTacToeResults = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TICTACTOE_RESULTS)) || [];
  };

  const getTicTacToeStats = () => {
    const results = getTicTacToeResults();
    const stats = {
      total: results.length,
      draws: results.filter((r) => r.result === 'draw').length,
      player1Wins: results.filter((r) => r.result === 'player1').length,
      player2Wins: results.filter((r) => r.result === 'player2').length,
    };
    return stats;
  };

  /**
   * Reaction Timer Functions
   */
  const saveReactionTime = (milliseconds) => {
    const times = JSON.parse(localStorage.getItem(STORAGE_KEYS.REACTION_TIMES)) || [];
    const newTime = {
      milliseconds,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
    };
    times.push(newTime);
    localStorage.setItem(STORAGE_KEYS.REACTION_TIMES, JSON.stringify(times));

    // Update best time
    const currentBest = JSON.parse(localStorage.getItem(STORAGE_KEYS.REACTION_BEST));
    if (!currentBest || milliseconds < currentBest.milliseconds) {
      localStorage.setItem(STORAGE_KEYS.REACTION_BEST, JSON.stringify(newTime));
    }

    // Update game history
    addToGameHistory('Reaction Timer', `${milliseconds}ms`, 'completed');
    incrementTotalGames();
    setLastGame('Reaction Timer');

    return newTime;
  };

  const getReactionTimes = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REACTION_TIMES)) || [];
  };

  const getReactionBestTime = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REACTION_BEST));
  };

  const getReactionStats = () => {
    const times = getReactionTimes();
    if (times.length === 0) return { count: 0, best: null, average: null };

    const milliseconds = times.map((t) => t.milliseconds);
    const best = Math.min(...milliseconds);
    const average = Math.round(milliseconds.reduce((a, b) => a + b, 0) / milliseconds.length);

    return {
      count: times.length,
      best,
      average,
    };
  };

  /**
   * Game History and General Functions
   */
  const addToGameHistory = (gameName, result, status) => {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_HISTORY)) || [];
    history.push({
      gameName,
      result,
      status,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
    });
    localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
  };

  const getGameHistory = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_HISTORY)) || [];
  };

  const setLastGame = (gameName) => {
    localStorage.setItem(STORAGE_KEYS.LAST_GAME, JSON.stringify({
      name: gameName,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
    }));
  };

  const getLastGame = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_GAME));
  };

  const incrementTotalGames = () => {
    const total = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOTAL_GAMES)) || 0;
    localStorage.setItem(STORAGE_KEYS.TOTAL_GAMES, JSON.stringify(total + 1));
  };

  const getTotalGames = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TOTAL_GAMES)) || 0;
  };

  /**
   * Clear all data
   */
  const clearAll = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    initialize();
  };

  /**
   * Get comprehensive dashboard data
   */
  const getDashboardData = () => {
    return {
      lastGame: getLastGame(),
      totalGames: getTotalGames(),
      memory: {
        scores: getMemoryScores(),
        best: getMemoryBestScore(),
      },
      tictactoe: {
        results: getTicTacToeResults(),
        stats: getTicTacToeStats(),
      },
      reaction: {
        times: getReactionTimes(),
        best: getReactionBestTime(),
        stats: getReactionStats(),
      },
      history: getGameHistory(),
    };
  };

  // Public API
  return {
    initialize,
    saveMemoryScore,
    getMemoryScores,
    getMemoryBestScore,
    saveTicTacToeResult,
    getTicTacToeResults,
    getTicTacToeStats,
    saveReactionTime,
    getReactionTimes,
    getReactionBestTime,
    getReactionStats,
    addToGameHistory,
    getGameHistory,
    setLastGame,
    getLastGame,
    incrementTotalGames,
    getTotalGames,
    clearAll,
    getDashboardData,
  };
})();

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    StorageManager.initialize();
  });
} else {
  StorageManager.initialize();
}
