/* ========================================
   APEXPLAY - Tic Tac Toe Game
   Two-player game with win/draw detection
   ======================================== */

const TicTacToe = (() => {
  const PLAYERS = {
    X: 'X',
    O: 'O',
  };

  const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let gameState = {
    board: Array(9).fill(null),
    currentPlayer: PLAYERS.X,
    gameOver: false,
    winner: null,
    moves: 0,
  };

  /**
   * Initialize the game
   */
  const init = () => {
    const gridContainer = document.querySelector('.tictactoe-grid');
    if (!gridContainer) return;

    renderBoard(gridContainer);
    updateStatus();
  };

  /**
   * Render the game board
   */
  const renderBoard = (container) => {
    container.innerHTML = gameState.board
      .map((value, index) => createCell(value, index))
      .join('');

    // Add event listeners to cells using delegation
    container.querySelectorAll('.tictactoe-cell').forEach((cell, index) => {
      cell.addEventListener('click', () => {
        if (!gameState.board[index] && !gameState.gameOver) {
          gameState.board[index] = gameState.currentPlayer;
          gameState.moves++;

          const result = checkGameStatus();

          if (result === 'win') {
            endGame('win');
          } else if (result === 'draw') {
            endGame('draw');
          } else {
            gameState.currentPlayer = gameState.currentPlayer === PLAYERS.X ? PLAYERS.O : PLAYERS.X;
          }

          renderBoard(container);
          updateStatus();
        }
      });
    });
  };

  /**
   * Create a cell element
   */
  const createCell = (value, index) => {
    const className = value ? `${value.toLowerCase()} cell-filled` : '';

    return `
      <button 
        class="tictactoe-cell ${className}"
        data-index="${index}"
        ${value || gameState.gameOver ? 'disabled' : ''}
      >
        ${value || ''}
      </button>
    `;
  };

  /**
   * Check game status (win, draw, or continue)
   */
  const checkGameStatus = () => {
    // Check for winner
    for (let combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (
        gameState.board[a] &&
        gameState.board[a] === gameState.board[b] &&
        gameState.board[a] === gameState.board[c]
      ) {
        gameState.winner = gameState.currentPlayer;
        return 'win';
      }
    }

    // Check for draw
    if (gameState.moves === 9) {
      return 'draw';
    }

    return 'continue';
  };

  /**
   * Update status display
   */
  const updateStatus = () => {
    const statusDiv = document.querySelector('.game-status');
    if (!statusDiv) return;

    if (gameState.gameOver) {
      if (gameState.winner) {
        statusDiv.innerHTML = `<div class="status-message success">🎉 Player ${gameState.winner} Wins!</div>`;
      } else {
        statusDiv.innerHTML = `<div class="status-message info">It's a Draw!</div>`;
      }
    } else {
      statusDiv.innerHTML = `<div class="status-message info">Current Player: <strong>${gameState.currentPlayer}</strong></div>`;
    }
  };

  /**
   * End the game
   */
  const endGame = (result) => {
    gameState.gameOver = true;

    let saveResult;
    if (result === 'draw') {
      saveResult = 'draw';
    } else {
      saveResult = gameState.currentPlayer === PLAYERS.X ? 'player1' : 'player2';
    }

    // Save result
    StorageManager.saveTicTacToeResult(saveResult);

    // Redirect to dashboard after delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
  };

  /**
   * Reset the game
   */
  const reset = () => {
    const gridContainer = document.querySelector('.tictactoe-grid');
    if (!gridContainer) return;

    gameState = {
      board: Array(9).fill(null),
      currentPlayer: PLAYERS.X,
      gameOver: false,
      winner: null,
      moves: 0,
    };

    renderBoard(gridContainer);
    updateStatus();

    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) {
      statusDiv.innerHTML = `<div class="status-message info">Current Player: <strong>X</strong></div>`;
    }
  };

  /**
   * Go back to home
   */
  const goHome = () => {
    window.location.href = 'index.html';
  };

  // Public API
  return {
    init,
    reset,
    goHome,
  };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    TicTacToe.init();

    // Set up button listeners
    const resetBtn = document.querySelector('[data-action="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => TicTacToe.reset());
    }

    const homeBtn = document.querySelector('[data-action="home"]');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => TicTacToe.goHome());
    }
  });
} else {
  TicTacToe.init();
}

