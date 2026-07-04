/* ========================================
   GAMEHUB - Snake Game
   Canvas-based snake game with scores
   ======================================== */

const SnakeGame = (() => {
  const GRID_SIZE = 20;
  const TILE_COUNT = 20; // 400/20
  const INITIAL_SPEED = 120; // ms per frame

  let canvas, ctx;
  let snake = [];
  let food = { x: 15, y: 15 };
  let dx = 0;
  let dy = 0;
  let score = 0;
  let gameLoop;
  let isGameOver = false;
  let isPlaying = false;
  let nextMove = { dx: 0, dy: 0 }; // Prevent double turn bug

  const init = () => {
    canvas = document.getElementById('snake-board');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Show initial high score
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.SNAKE_BEST) || 0;
    document.getElementById('snake-best').textContent = bestScore;

    setupControls();
    resetGame();
    draw(); // Initial draw

    // Check if mobile to show on-screen controls
    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
      document.querySelector('.mobile-controls').style.display = 'flex';
    }
  };

  const setupControls = () => {
    document.addEventListener('keydown', handleKeyDown);
    
    document.querySelector('[data-action="start"]')?.addEventListener('click', () => {
      if (!isPlaying || isGameOver) {
        if (isGameOver) resetGame();
        startGame();
      }
    });
    
    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    // Mobile controls
    document.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!isPlaying) startGame();
        const dir = e.target.dataset.dir || e.target.closest('button').dataset.dir;
        changeDirectionStr(dir);
      });
    });
  };

  const handleKeyDown = (e) => {
    if (!isPlaying && !isGameOver && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
      startGame();
    }
    
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(e.code) > -1) {
        e.preventDefault(); // Prevent scrolling
    }

    switch(e.key.toLowerCase()) {
      case 'arrowup': case 'w': changeDirection(0, -1); break;
      case 'arrowdown': case 's': changeDirection(0, 1); break;
      case 'arrowleft': case 'a': changeDirection(-1, 0); break;
      case 'arrowright': case 'd': changeDirection(1, 0); break;
    }
  };

  const changeDirectionStr = (dir) => {
    switch(dir) {
      case 'UP': changeDirection(0, -1); break;
      case 'DOWN': changeDirection(0, 1); break;
      case 'LEFT': changeDirection(-1, 0); break;
      case 'RIGHT': changeDirection(1, 0); break;
    }
  };

  const changeDirection = (newDx, newDy) => {
    // Prevent 180 degree turns
    if ((dx === 0 && newDx === 0) || (dy === 0 && newDy === 0)) return;
    nextMove = { dx: newDx, dy: newDy };
    AudioManager.playMove();
  };

  const resetGame = () => {
    snake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ];
    dx = 0;
    dy = -1; // Start moving up
    nextMove = { dx: 0, dy: -1 };
    score = 0;
    isGameOver = false;
    isPlaying = false;
    updateScore();
    placeFood();
    
    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) statusDiv.innerHTML = '';
  };

  const startGame = () => {
    if (gameLoop) clearInterval(gameLoop);
    isPlaying = true;
    isGameOver = false;
    AudioManager.playTone(400, 'sine', 0.1, 0.1); // Start beep
    gameLoop = setInterval(update, INITIAL_SPEED);
    
    const startBtn = document.querySelector('[data-action="start"]');
    if (startBtn) startBtn.textContent = '🔄 Restart';
  };

  const update = () => {
    if (isGameOver) return;

    dx = nextMove.dx;
    dy = nextMove.dy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
      gameOver();
      return;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        gameOver();
        return;
      }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScore();
      AudioManager.playPop();
      placeFood();
      // Increase speed slightly? Could implement here if desired.
    } else {
      snake.pop(); // Remove tail if not eating
    }

    draw();
  };

  const placeFood = () => {
    let valid = false;
    while (!valid) {
      food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
      };
      // Check if food is on snake
      valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
  };

  const draw = () => {
    // Clear canvas
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#00f2fe' : '#4facfe'; // Head is lighter
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
    });

    // Draw food
    ctx.fillStyle = '#f5576c';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
  };

  const updateScore = () => {
    document.getElementById('snake-score').textContent = score;
  };

  const gameOver = () => {
    isGameOver = true;
    isPlaying = false;
    clearInterval(gameLoop);
    AudioManager.playGameOver();
    
    // Canvas shake effect
    canvas.style.animation = 'bounce 0.5s ease';
    setTimeout(() => canvas.style.animation = '', 500);

    const isNewBest = StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.SNAKE_BEST, score, 'Snake Game');
    
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.SNAKE_BEST);
    document.getElementById('snake-best').textContent = bestScore;

    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) {
      if (isNewBest) {
        statusDiv.innerHTML = `<div class="status-message success">🏆 NEW HIGH SCORE: ${score}!</div>`;
        AudioManager.playGameWin(); // Confetti sound
      } else {
        statusDiv.innerHTML = `<div class="status-message warning">Game Over! Score: ${score}</div>`;
      }
    }
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', SnakeGame.init);
} else {
  SnakeGame.init();
}
