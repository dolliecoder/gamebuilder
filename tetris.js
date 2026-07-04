/* ========================================
   GAMEHUB - Tetris
   ======================================== */

const TetrisGame = (() => {
  let canvas, ctx;
  let gameLoop;
  let dropCounter = 0;
  let dropInterval = 1000;
  let lastTime = 0;
  
  let isPlaying = false;
  let isGameOver = false;
  let score = 0;

  const ROWS = 20;
  const COLS = 12;
  const BLOCK_SIZE = 20;

  // Colors for tetrominos (0 is empty)
  const COLORS = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // I
    '#0DFF72', // S
    '#F538FF', // Z
    '#FF8E0D', // L
    '#FFE138', // J
    '#3877FF', // O
  ];

  // Shapes
  const PIECES = [
    [],
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 2, 0, 0],
      [0, 2, 0, 0],
      [0, 2, 0, 0],
      [0, 2, 0, 0],
    ],
    [
      [0, 3, 3],
      [3, 3, 0],
      [0, 0, 0],
    ],
    [
      [4, 4, 0],
      [0, 4, 4],
      [0, 0, 0],
    ],
    [
      [0, 5, 0],
      [0, 5, 0],
      [5, 5, 0],
    ],
    [
      [0, 6, 0],
      [0, 6, 0],
      [0, 6, 6],
    ],
    [
      [7, 7],
      [7, 7],
    ]
  ];

  let board = [];
  let player = {
    pos: {x: 0, y: 0},
    matrix: null,
  };

  const init = () => {
    canvas = document.getElementById('tetris-board');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    // Scale context so everything is drawn in "blocks"
    ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.TETRIS_BEST) || 0;
    document.getElementById('tetris-best').textContent = bestScore;

    setupControls();
    resetGame();
    draw();

    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
      document.querySelector('.mobile-controls').style.display = 'flex';
    }
  };

  const createMatrix = (w, h) => {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  };

  const collide = (board, player) => {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 &&
           (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  };

  const merge = (board, player) => {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          board[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  };

  const drawMatrix = (matrix, offset) => {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          ctx.fillStyle = COLORS[value];
          ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
          
          // Slight inner border for blocks
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
          ctx.fillStyle = COLORS[value];
          ctx.fillRect(x + offset.x + 0.1, y + offset.y + 0.1, 0.8, 0.8);
        }
      });
    });
  };

  const draw = () => {
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, canvas.width / BLOCK_SIZE, canvas.height / BLOCK_SIZE);

    drawMatrix(board, {x: 0, y: 0});
    if (player.matrix) {
      drawMatrix(player.matrix, player.pos);
    }
  };

  const playerDrop = () => {
    player.pos.y++;
    if (collide(board, player)) {
      player.pos.y--;
      merge(board, player);
      playerReset();
      clearLines();
      AudioManager.playMove(); // drop sound
      
      // Speed up slightly as game progresses
      dropInterval = Math.max(100, 1000 - (score * 2));
    }
    dropCounter = 0;
  };

  const playerMove = (offset) => {
    player.pos.x += offset;
    if (collide(board, player)) {
      player.pos.x -= offset;
    }
  };

  const rotate = (matrix, dir) => {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) {
      matrix.forEach(row => row.reverse());
    } else {
      matrix.reverse();
    }
  };

  const playerRotate = (dir) => {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(board, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
      }
    }
    AudioManager.playClick();
  };

  const playerReset = () => {
    const pieces = 'ILJOTSZ';
    const typeId = Math.floor(Math.random() * pieces.length) + 1;
    
    // Copy the piece so we don't mutate the original when rotating
    player.matrix = JSON.parse(JSON.stringify(PIECES[typeId]));
    
    player.pos.y = 0;
    player.pos.x = (Math.floor(COLS / 2)) - (Math.floor(player.matrix[0].length / 2));

    if (collide(board, player)) {
      gameOver();
    }
  };

  const clearLines = () => {
    let rowCount = 1;
    outer: for (let y = board.length - 1; y >= 0; --y) {
      for (let x = 0; x < board[y].length; ++x) {
        if (board[y][x] === 0) {
          continue outer;
        }
      }

      const row = board.splice(y, 1)[0].fill(0);
      board.unshift(row);
      ++y;

      score += rowCount * 100;
      rowCount *= 2;
      document.getElementById('tetris-score').textContent = score;
      AudioManager.playPop(); // line clear
    }
  };

  const update = (time = 0) => {
    if (isGameOver) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      playerDrop();
    }

    draw();
    gameLoop = requestAnimationFrame(update);
  };

  const setupControls = () => {
    document.addEventListener('keydown', (e) => {
      if (!isPlaying || isGameOver) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
          if (isGameOver) resetGame();
          startGame();
        }
        return;
      }
      
      if (e.key === 'ArrowLeft') {
        playerMove(-1);
      } else if (e.key === 'ArrowRight') {
        playerMove(1);
      } else if (e.key === 'ArrowDown') {
        playerDrop();
      } else if (e.key === 'ArrowUp') {
        playerRotate(1);
      }
    });

    document.querySelector('[data-action="start"]')?.addEventListener('click', () => {
      if (!isPlaying || isGameOver) {
        if (isGameOver) resetGame();
        startGame();
      }
    });

    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    // Mobile
    const btnUp = document.querySelector('[data-dir="UP"]');
    const btnDown = document.querySelector('[data-dir="DOWN"]');
    const btnLeft = document.querySelector('[data-dir="LEFT"]');
    const btnRight = document.querySelector('[data-dir="RIGHT"]');
    
    let dropInt;
    if (btnUp) btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); if (isPlaying && !isGameOver) playerRotate(1); });
    if (btnLeft) btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); if (isPlaying && !isGameOver) playerMove(-1); });
    if (btnRight) btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); if (isPlaying && !isGameOver) playerMove(1); });
    
    if (btnDown) {
      btnDown.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        if (isPlaying && !isGameOver) {
          dropInt = setInterval(playerDrop, 50);
        }
      });
      btnDown.addEventListener('touchend', () => { clearInterval(dropInt); });
    }
  };

  const resetGame = () => {
    board = createMatrix(COLS, ROWS);
    score = 0;
    dropInterval = 1000;
    isGameOver = false;
    isPlaying = false;
    
    document.getElementById('tetris-score').textContent = score;
    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) statusDiv.innerHTML = '';
  };

  const startGame = () => {
    if (gameLoop) cancelAnimationFrame(gameLoop);
    isPlaying = true;
    isGameOver = false;
    AudioManager.playTone(400, 'sine', 0.1, 0.1);
    
    const startBtn = document.querySelector('[data-action="start"]');
    if (startBtn) startBtn.textContent = '🔄 Restart';
    
    playerReset();
    update();
  };

  const gameOver = () => {
    isGameOver = true;
    isPlaying = false;
    AudioManager.playGameOver();
    
    canvas.style.animation = 'shake 0.5s ease';
    setTimeout(() => canvas.style.animation = '', 500);

    const isNewBest = StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.TETRIS_BEST, score, 'Tetris');
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.TETRIS_BEST);
    document.getElementById('tetris-best').textContent = bestScore;

    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) {
      if (isNewBest && score > 0) {
        statusDiv.innerHTML = `<span style="color: #2ed573;">Game Over!</span> 🏆 NEW BEST: ${score}!`;
        setTimeout(AudioManager.playGameWin, 500);
      } else {
        statusDiv.innerHTML = `<span style="color: #ff4757;">Game Over!</span> Score: ${score}`;
      }
    }
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', TetrisGame.init);
} else {
  TetrisGame.init();
}
