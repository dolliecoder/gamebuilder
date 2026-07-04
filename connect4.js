/* ========================================
   APEXPLAY - Connect Four
   ======================================== */

const Connect4Game = (() => {
  const ROWS = 6;
  const COLS = 7;
  let board = [];
  let isGameOver = false;
  let isPlayerTurn = true; // true = Player (Red), false = AI (Yellow)
  let totalWins = 0;

  const init = () => {
    totalWins = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.CONNECT4_WINS) || 0;
    document.getElementById('c4-wins').textContent = totalWins;
    
    setupBoard();
    setupControls();
  };

  const setupBoard = () => {
    const boardElement = document.getElementById('c4-board');
    boardElement.innerHTML = '';
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'c4-cell';
        cell.id = `c4-${r}-${c}`;
        cell.addEventListener('click', () => handleColumnClick(c));
        boardElement.appendChild(cell);
      }
    }
  };

  const setupControls = () => {
    document.querySelector('[data-action="restart"]')?.addEventListener('click', restartGame);
    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  };

  const handleColumnClick = (col) => {
    if (isGameOver || !isPlayerTurn) return;
    
    let row = getLowestEmptyRow(board, col);
    if (row !== -1) {
      dropDisc(row, col, 1); // 1 is Player
      
      if (checkWin(board, 1)) {
        winGame(1);
      } else if (checkTie(board)) {
        tieGame();
      } else {
        isPlayerTurn = false;
        updateTurnDisplay();
        setTimeout(makeAIMove, 600); // AI delay
      }
    }
  };

  const dropDisc = (row, col, player) => {
    board[row][col] = player;
    const cell = document.getElementById(`c4-${row}-${col}`);
    cell.classList.add(player === 1 ? 'p1' : 'p2');
    AudioManager.playMove(); // Drop sound effect
  };

  const getLowestEmptyRow = (boardState, col) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (boardState[r][col] === 0) return r;
    }
    return -1;
  };

  const checkWin = (boardState, player) => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (boardState[r][c] == player && boardState[r][c+1] == player && boardState[r][c+2] == player && boardState[r][c+3] == player) {
          return [[r,c], [r,c+1], [r,c+2], [r,c+3]];
        }
      }
    }
    // Vertical
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        if (boardState[r][c] == player && boardState[r+1][c] == player && boardState[r+2][c] == player && boardState[r+3][c] == player) {
          return [[r,c], [r+1,c], [r+2,c], [r+3,c]];
        }
      }
    }
    // Diagonal down-right
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (boardState[r][c] == player && boardState[r+1][c+1] == player && boardState[r+2][c+2] == player && boardState[r+3][c+3] == player) {
          return [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]];
        }
      }
    }
    // Diagonal up-right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (boardState[r][c] == player && boardState[r-1][c+1] == player && boardState[r-2][c+2] == player && boardState[r-3][c+3] == player) {
          return [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]];
        }
      }
    }
    return null;
  };

  const checkTie = (boardState) => {
    for (let c = 0; c < COLS; c++) {
      if (boardState[0][c] === 0) return false;
    }
    return true;
  };

  // Simple AI using heuristics
  const makeAIMove = () => {
    if (isGameOver) return;
    
    // 1. Can AI win?
    for (let c = 0; c < COLS; c++) {
      let r = getLowestEmptyRow(board, c);
      if (r !== -1) {
        board[r][c] = 2; // Simulate AI move
        if (checkWin(board, 2)) {
          board[r][c] = 0; // Revert
          executeAIMove(r, c);
          return;
        }
        board[r][c] = 0; // Revert
      }
    }

    // 2. Must AI block Player?
    for (let c = 0; c < COLS; c++) {
      let r = getLowestEmptyRow(board, c);
      if (r !== -1) {
        board[r][c] = 1; // Simulate Player move
        if (checkWin(board, 1)) {
          board[r][c] = 0; // Revert
          executeAIMove(r, c);
          return;
        }
        board[r][c] = 0; // Revert
      }
    }

    // 3. Play center if available, or random valid column
    const validCols = [];
    for (let c = 0; c < COLS; c++) {
      if (getLowestEmptyRow(board, c) !== -1) validCols.push(c);
    }
    
    // Prefer center column (index 3)
    let bestCol = 3;
    if (!validCols.includes(3)) {
      bestCol = validCols[Math.floor(Math.random() * validCols.length)];
    } else {
      // Small chance to not play center to make it less predictable
      if (Math.random() < 0.3) {
        bestCol = validCols[Math.floor(Math.random() * validCols.length)];
      }
    }

    let r = getLowestEmptyRow(board, bestCol);
    executeAIMove(r, bestCol);
  };

  const executeAIMove = (r, c) => {
    dropDisc(r, c, 2);
    let winCoords = checkWin(board, 2);
    if (winCoords) {
      winGame(2, winCoords);
    } else if (checkTie(board)) {
      tieGame();
    } else {
      isPlayerTurn = true;
      updateTurnDisplay();
    }
  };

  const updateTurnDisplay = () => {
    const turnDisplay = document.getElementById('c4-turn');
    if (isPlayerTurn) {
      turnDisplay.textContent = 'You (Red)';
      turnDisplay.style.color = '#e74c3c';
    } else {
      turnDisplay.textContent = 'AI (Yellow)';
      turnDisplay.style.color = '#f1c40f';
    }
  };

  const winGame = (player, winCoords) => {
    isGameOver = true;
    const statusDiv = document.querySelector('.game-status');
    const winCells = winCoords || checkWin(board, player);

    // Highlight winning cells
    if (winCells) {
      winCells.forEach(coord => {
        document.getElementById(`c4-${coord[0]}-${coord[1]}`).classList.add('win-highlight');
      });
    }

    if (player === 1) {
      statusDiv.innerHTML = `<span style="color: #2ed573;">🎉 You Win! 🎉</span>`;
      AudioManager.playGameWin();
      totalWins++;
      StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.CONNECT4_WINS, totalWins, 'Connect Four');
      document.getElementById('c4-wins').textContent = totalWins;
    } else {
      statusDiv.innerHTML = `<span style="color: #ff4757;">AI Wins! Better luck next time.</span>`;
      AudioManager.playGameOver();
    }
  };

  const tieGame = () => {
    isGameOver = true;
    const statusDiv = document.querySelector('.game-status');
    statusDiv.innerHTML = `<span style="color: #f1c40f;">It's a Tie!</span>`;
    AudioManager.playError(); // Use error sound for tie
  };

  const restartGame = () => {
    isGameOver = false;
    isPlayerTurn = true;
    document.querySelector('.game-status').innerHTML = '';
    updateTurnDisplay();
    setupBoard();
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Connect4Game.init);
} else {
  Connect4Game.init();
}
