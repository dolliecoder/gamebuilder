/* ========================================
   APEXPLAY - Brick Breaker (Breakout)
   ======================================== */

const BreakoutGame = (() => {
  let canvas, ctx;
  let gameLoop;
  let isPlaying = false;
  let isGameOver = false;
  
  // Game Objects
  let ball = { x: 0, y: 0, dx: 3, dy: -3, radius: 8 };
  let paddle = { h: 10, w: 75, x: 0, speed: 6 };
  
  // Bricks
  let brickRowCount = 5;
  let brickColumnCount = 5;
  let brickWidth = 75;
  let brickHeight = 20;
  let brickPadding = 10;
  let brickOffsetTop = 30;
  let brickOffsetLeft = 30;
  let bricks = [];
  
  let score = 0;
  let rightPressed = false;
  let leftPressed = false;

  const init = () => {
    canvas = document.getElementById('breakout-board');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Init high score
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.BREAKOUT_BEST) || 0;
    document.getElementById('breakout-best').textContent = bestScore;

    setupControls();
    resetGame();
    draw();

    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
      document.querySelector('.mobile-controls').style.display = 'flex';
    }
  };

  const setupControls = () => {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    
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
    const leftBtn = document.querySelector('[data-dir="LEFT"]');
    const rightBtn = document.querySelector('[data-dir="RIGHT"]');
    
    if (leftBtn) {
      leftBtn.addEventListener('mousedown', () => leftPressed = true);
      leftBtn.addEventListener('mouseup', () => leftPressed = false);
      leftBtn.addEventListener('mouseleave', () => leftPressed = false);
      leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); leftPressed = true; });
      leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); leftPressed = false; });
    }
    if (rightBtn) {
      rightBtn.addEventListener('mousedown', () => rightPressed = true);
      rightBtn.addEventListener('mouseup', () => rightPressed = false);
      rightBtn.addEventListener('mouseleave', () => rightPressed = false);
      rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); rightPressed = true; });
      rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); rightPressed = false; });
    }
  };

  const keyDownHandler = (e) => {
    if (["ArrowRight", "d", "D"].includes(e.key)) {
      rightPressed = true;
    } else if (["ArrowLeft", "a", "A"].includes(e.key)) {
      leftPressed = true;
    }
    
    if (!isPlaying && !isGameOver && ["ArrowLeft", "ArrowRight", "a", "d"].includes(e.key)) {
      startGame();
    }
  };

  const keyUpHandler = (e) => {
    if (["ArrowRight", "d", "D"].includes(e.key)) {
      rightPressed = false;
    } else if (["ArrowLeft", "a", "A"].includes(e.key)) {
      leftPressed = false;
    }
  };

  const resetGame = () => {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = 3; // Reset ball speed
    ball.dy = -3; // Reset ball speed
    paddle.x = (canvas.width - paddle.w) / 2;
    score = 0;
    isGameOver = false;
    isPlaying = false;
    rightPressed = false;
    leftPressed = false;
    
    document.getElementById('breakout-score').textContent = score;
    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) statusDiv.innerHTML = '';

    // Initialize bricks
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  };

  const startGame = () => {
    if (gameLoop) cancelAnimationFrame(gameLoop);
    isPlaying = true;
    isGameOver = false;
    AudioManager.playTone(400, 'sine', 0.1, 0.1); // Start beep
    
    const startBtn = document.querySelector('[data-action="start"]');
    if (startBtn) startBtn.textContent = '🔄 Restart';
    
    update();
  };

  const collisionDetection = () => {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        let b = bricks[c][r];
        if (b.status == 1) {
          if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
            ball.dy = -ball.dy;
            b.status = 0;
            score++;
            document.getElementById('breakout-score').textContent = score;
            AudioManager.playPop(); // Pop sound for breaking a brick

            if (score === brickRowCount * brickColumnCount) {
              winGame();
            }
          }
        }
      }
    }
  };

  const drawBall = () => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#00f2fe";
    ctx.fill();
    ctx.closePath();
  };

  const drawPaddle = () => {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.h, paddle.w, paddle.h);
    ctx.fillStyle = "#667eea";
    ctx.fill();
    ctx.closePath();
  };

  const drawBricks = () => {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status == 1) {
          let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
          let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          // Color based on row
          const colors = ["#f5576c", "#f093fb", "#5ee7df", "#f6d365", "#b224ef"];
          ctx.fillStyle = colors[r % colors.length];
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
  };

  const update = () => {
    if (isGameOver) return;

    draw();
    collisionDetection();

    // Wall collision (left/right)
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
      ball.dx = -ball.dx;
      AudioManager.playMove(); // bounce sound
    }

    // Top wall collision
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
      AudioManager.playMove(); // bounce sound
    } 
    // Bottom wall / Paddle collision
    else if (ball.y + ball.dy > canvas.height - ball.radius) {
      if (ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
        // Hit the paddle - change angle based on where it hit the paddle
        const hitPoint = ball.x - (paddle.x + paddle.w/2);
        ball.dx = hitPoint * 0.15; // Max 0.15 * 37.5 = ~5.6
        ball.dy = -ball.dy;
        
        // Slightly increase speed
        if (Math.abs(ball.dy) < 8) {
          ball.dy = ball.dy * 1.05;
        }

        AudioManager.playClick();
      } else {
        // Missed paddle
        gameOver();
        return;
      }
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (rightPressed && paddle.x < canvas.width - paddle.w) {
      paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
      paddle.x -= paddle.speed;
    }

    gameLoop = requestAnimationFrame(update);
  };

  const gameOver = () => {
    isGameOver = true;
    isPlaying = false;
    AudioManager.playGameOver();
    
    // Canvas shake effect
    canvas.style.animation = 'bounce 0.5s ease';
    setTimeout(() => canvas.style.animation = '', 500);

    const isNewBest = StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.BREAKOUT_BEST, score, 'Brick Breaker');
    
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.BREAKOUT_BEST);
    document.getElementById('breakout-best').textContent = bestScore;

    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) {
      if (isNewBest && score > 0) {
        statusDiv.innerHTML = `<span style="color: #2ed573;">Game Over!</span> 🏆 NEW HIGH SCORE: ${score}!`;
        setTimeout(AudioManager.playGameWin, 500);
      } else {
        statusDiv.innerHTML = `<span style="color: #ff4757;">Game Over!</span> Score: ${score}`;
      }
    }
  };

  const winGame = () => {
    isGameOver = true;
    isPlaying = false;
    AudioManager.playGameWin();
    
    const isNewBest = StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.BREAKOUT_BEST, score, 'Brick Breaker');
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.BREAKOUT_BEST);
    document.getElementById('breakout-best').textContent = bestScore;

    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) {
      statusDiv.innerHTML = `<span style="color: #2ed573;">🎉 YOU WIN! 🎉</span>`;
    }
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', BreakoutGame.init);
} else {
  BreakoutGame.init();
}
