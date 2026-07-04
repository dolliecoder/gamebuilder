/* ========================================
   GAMEHUB - 2048 Puzzle
   ======================================== */

const Puzzle2048 = (() => {
  const SIZE = 4;
  let grid = [];
  let score = 0;
  let isGameOver = false;

  const init = () => {
    const board = document.getElementById('puzzle-board');
    if (!board) return;

    // Show best score
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.PUZZLE2048_BEST) || 0;
    document.getElementById('puzzle-best').textContent = bestScore;

    setupControls();
    resetGame();
    
    // Check if mobile to show on-screen controls
    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
      document.querySelector('.mobile-controls').style.display = 'flex';
    }
  };

  const setupControls = () => {
    document.addEventListener('keydown', handleKeyDown);
    
    document.querySelector('[data-action="reset"]')?.addEventListener('click', resetGame);
    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    // Mobile controls
    document.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dir = e.target.dataset.dir || e.target.closest('button').dataset.dir;
        handleDirectionStr(dir);
      });
    });
  };

  const resetGame = () => {
    grid = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
    score = 0;
    isGameOver = false;
    updateScore();
    addRandomTile();
    addRandomTile();
    drawBoard();
    
    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) statusDiv.innerHTML = '';
  };

  const addRandomTile = () => {
    let emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const drawBoard = () => {
    const board = document.getElementById('puzzle-board');
    board.innerHTML = '';
    
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const val = grid[r][c];
        const cell = document.createElement('div');
        cell.className = `puzzle-cell ${val > 0 ? 'cell-' + val : ''}`;
        cell.textContent = val > 0 ? val : '';
        board.appendChild(cell);
      }
    }
  };

  const updateScore = () => {
    document.getElementById('puzzle-score').textContent = score;
  };

  const handleKeyDown = (e) => {
    if (isGameOver) return;
    
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault(); 
    }

    let moved = false;
    switch(e.key) {
      case 'ArrowUp': case 'w': moved = moveUp(); break;
      case 'ArrowDown': case 's': moved = moveDown(); break;
      case 'ArrowLeft': case 'a': moved = moveLeft(); break;
      case 'ArrowRight': case 'd': moved = moveRight(); break;
    }

    if (moved) {
      postMove();
    }
  };

  const handleDirectionStr = (dir) => {
    if (isGameOver) return;
    let moved = false;
    switch(dir) {
      case 'UP': moved = moveUp(); break;
      case 'DOWN': moved = moveDown(); break;
      case 'LEFT': moved = moveLeft(); break;
      case 'RIGHT': moved = moveRight(); break;
    }
    if (moved) postMove();
  };

  const postMove = () => {
    AudioManager.playMove();
    addRandomTile();
    drawBoard();
    updateScore();

    if (checkGameOver()) {
      gameOver();
    }
  };

  // Matrix manipulation for 2048
  const moveLeft = () => {
    let moved = false;
    for (let r = 0; r < SIZE; r++) {
      let row = grid[r].filter(val => val !== 0);
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
          row[i] *= 2;
          score += row[i];
          row.splice(i + 1, 1);
          moved = true;
          if (score > 0) AudioManager.playPop();
        }
      }
      while (row.length < SIZE) row.push(0);
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] !== row[c]) moved = true;
        grid[r][c] = row[c];
      }
    }
    return moved;
  };

  const moveRight = () => {
    let moved = false;
    for (let r = 0; r < SIZE; r++) {
      let row = grid[r].filter(val => val !== 0);
      for (let i = row.length - 1; i > 0; i--) {
        if (row[i] === row[i - 1]) {
          row[i] *= 2;
          score += row[i];
          row.splice(i - 1, 1);
          moved = true;
          if (score > 0) AudioManager.playPop();
          i--;
        }
      }
      while (row.length < SIZE) row.unshift(0);
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] !== row[c]) moved = true;
        grid[r][c] = row[c];
      }
    }
    return moved;
  };

  const moveUp = () => {
    let moved = false;
    for (let c = 0; c < SIZE; c++) {
      let col = [];
      for (let r = 0; r < SIZE; r++) if (grid[r][c] !== 0) col.push(grid[r][c]);
      
      for (let i = 0; i < col.length - 1; i++) {
        if (col[i] === col[i + 1]) {
          col[i] *= 2;
          score += col[i];
          col.splice(i + 1, 1);
          moved = true;
          if (score > 0) AudioManager.playPop();
        }
      }
      while (col.length < SIZE) col.push(0);
      for (let r = 0; r < SIZE; r++) {
        if (grid[r][c] !== col[r]) moved = true;
        grid[r][c] = col[r];
      }
    }
    return moved;
  };

  const moveDown = () => {
    let moved = false;
    for (let c = 0; c < SIZE; c++) {
      let col = [];
      for (let r = 0; r < SIZE; r++) if (grid[r][c] !== 0) col.push(grid[r][c]);
      
      for (let i = col.length - 1; i > 0; i--) {
        if (col[i] === col[i - 1]) {
          col[i] *= 2;
          score += col[i];
          col.splice(i - 1, 1);
          moved = true;
          if (score > 0) AudioManager.playPop();
          i--;
        }
      }
      while (col.length < SIZE) col.unshift(0);
      for (let r = 0; r < SIZE; r++) {
        if (grid[r][c] !== col[r]) moved = true;
        grid[r][c] = col[r];
      }
    }
    return moved;
  };

  const checkGameOver = () => {
    // Check for empty cells
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) return false;
      }
    }
    // Check for possible merges
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
        if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
      }
    }
    return true;
  };

  const gameOver = () => {
    isGameOver = true;
    AudioManager.playGameOver();
    
    const isNewBest = StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.PUZZLE2048_BEST, score, '2048 Puzzle');
    
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.PUZZLE2048_BEST);
    document.getElementById('puzzle-best').textContent = bestScore;

    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) {
      if (isNewBest) {
        statusDiv.innerHTML = `<div class="status-message success">🏆 NEW HIGH SCORE: ${score}!</div>`;
        AudioManager.playGameWin();
      } else {
        statusDiv.innerHTML = `<div class="status-message warning">Game Over! Score: ${score}</div>`;
      }
    }
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Puzzle2048.init);
} else {
  Puzzle2048.init();
}
