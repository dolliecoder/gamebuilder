/* ========================================
   APEXPLAY - Minesweeper
   ======================================== */

const MinesweeperGame = (() => {
  const ROWS = 10;
  const COLS = 10;
  const MINES = 10;

  let grid = [];
  let isGameOver = false;
  let isFirstClick = true;
  let timerInterval;
  let secondsElapsed = 0;
  let flagsLeft = MINES;
  let cellsRevealed = 0;

  const init = () => {
    setupBoard();
    setupControls();
  };

  const setupBoard = () => {
    const board = document.getElementById('minesweeper-board');
    board.innerHTML = '';
    
    grid = Array(ROWS).fill().map(() => Array(COLS).fill(null));

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = {
          r, c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
          element: document.createElement('div')
        };
        
        cell.element.className = 'mine-cell';
        cell.element.dataset.r = r;
        cell.element.dataset.c = c;
        
        cell.element.addEventListener('click', () => revealCell(r, c));
        cell.element.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          toggleFlag(r, c);
        });

        // Mobile long press support
        let pressTimer;
        cell.element.addEventListener('touchstart', (e) => {
          pressTimer = window.setTimeout(() => {
            toggleFlag(r, c);
          }, 500);
        });
        cell.element.addEventListener('touchend', () => {
          if (pressTimer) clearTimeout(pressTimer);
        });

        grid[r][c] = cell;
        board.appendChild(cell.element);
      }
    }
  };

  const setupControls = () => {
    document.querySelector('[data-action="restart"]')?.addEventListener('click', restartGame);
    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  };

  const placeMines = (firstR, firstC) => {
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      let r = Math.floor(Math.random() * ROWS);
      let c = Math.floor(Math.random() * COLS);
      
      // Prevent mine on first click
      if (Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1) continue;
      
      if (!grid[r][c].isMine) {
        grid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              let nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          grid[r][c].neighborMines = count;
        }
      }
    }
  };

  const revealCell = (r, c) => {
    if (isGameOver) return;
    
    let cell = grid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    if (isFirstClick) {
      isFirstClick = false;
      placeMines(r, c);
      startTimer();
    }

    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    cellsRevealed++;

    if (cell.isMine) {
      cell.element.classList.add('mine');
      cell.element.textContent = '💣';
      AudioManager.playPop(); // Use pop for explosion effect
      gameOver(false);
      return;
    }

    AudioManager.playMove(); // subtle sound

    if (cell.neighborMines > 0) {
      cell.element.textContent = cell.neighborMines;
      cell.element.classList.add(`color-${cell.neighborMines}`);
    } else {
      // Flood fill empty neighbors
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            revealCell(nr, nc);
          }
        }
      }
    }

    checkWin();
  };

  const toggleFlag = (r, c) => {
    if (isGameOver || isFirstClick) return;
    
    let cell = grid[r][c];
    if (cell.isRevealed) return;

    if (!cell.isFlagged && flagsLeft > 0) {
      cell.isFlagged = true;
      cell.element.classList.add('flagged');
      cell.element.textContent = '🚩';
      flagsLeft--;
      AudioManager.playClick();
    } else if (cell.isFlagged) {
      cell.isFlagged = false;
      cell.element.classList.remove('flagged');
      cell.element.textContent = '';
      flagsLeft++;
      AudioManager.playClick();
    }
    
    document.getElementById('mine-count').textContent = flagsLeft;
  };

  const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      secondsElapsed++;
      document.getElementById('mine-timer').textContent = `${secondsElapsed}s`;
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
  };

  const checkWin = () => {
    if (cellsRevealed === (ROWS * COLS) - MINES) {
      gameOver(true);
    }
  };

  const gameOver = (win) => {
    isGameOver = true;
    stopTimer();

    // Reveal all mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let cell = grid[r][c];
        if (cell.isMine && !cell.isFlagged) {
          cell.element.classList.add('mine');
          cell.element.textContent = '💣';
        } else if (!cell.isMine && cell.isFlagged) {
          cell.element.textContent = '❌'; // Wrong flag
        }
      }
    }

    const statusDiv = document.querySelector('.game-status');
    if (win) {
      AudioManager.playGameWin();
      
      const bestTime = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.MINESWEEPER_BEST);
      if (bestTime === null || secondsElapsed < bestTime) {
        StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.MINESWEEPER_BEST, secondsElapsed, 'Minesweeper');
        statusDiv.innerHTML = `<span style="color: #2ed573;">You Win!</span> 🏆 NEW BEST TIME: ${secondsElapsed}s!`;
      } else {
        statusDiv.innerHTML = `<span style="color: #2ed573;">You Win!</span> Time: ${secondsElapsed}s`;
      }
    } else {
      AudioManager.playGameOver();
      statusDiv.innerHTML = `<span style="color: #ff4757;">Game Over!</span> You hit a mine.`;
    }
  };

  const restartGame = () => {
    isGameOver = false;
    isFirstClick = true;
    secondsElapsed = 0;
    flagsLeft = MINES;
    cellsRevealed = 0;
    stopTimer();
    
    document.getElementById('mine-count').textContent = flagsLeft;
    document.getElementById('mine-timer').textContent = '0s';
    document.querySelector('.game-status').innerHTML = '';
    
    setupBoard();
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', MinesweeperGame.init);
} else {
  MinesweeperGame.init();
}
