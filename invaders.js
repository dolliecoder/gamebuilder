/* ========================================
   APEXPLAY - Space Invaders
   ======================================== */

const InvadersGame = (() => {
  let canvas, ctx;
  let gameLoop;
  let isPlaying = false;
  let isGameOver = false;

  let score = 0;
  let wave = 1;

  // Ship
  let ship = {
    x: 0,
    y: 0,
    width: 30,
    height: 20,
    speed: 5,
    dx: 0
  };

  // Bullets
  let bullets = [];
  const bulletSpeed = 7;

  // Aliens
  let aliens = [];
  const alienRows = 4;
  const alienCols = 8;
  const alienWidth = 24;
  const alienHeight = 18;
  const alienPadding = 12;
  const alienOffsetTop = 40;
  const alienOffsetLeft = 30;
  
  let alienDx = 1;
  let alienDy = 0;

  // Stars (Background)
  let stars = [];

  const init = () => {
    canvas = document.getElementById('invaders-board');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.INVADERS_BEST) || 0;
    document.getElementById('invaders-best').textContent = bestScore;

    // Create stars
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    setupControls();
    resetGame();
    draw();

    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
      document.querySelector('.mobile-controls').style.display = 'flex';
    }
  };

  const setupControls = () => {
    document.addEventListener('keydown', (e) => {
      if (["ArrowRight", "d", "D"].includes(e.key)) ship.dx = ship.speed;
      else if (["ArrowLeft", "a", "A"].includes(e.key)) ship.dx = -ship.speed;
      
      if (["Space", " ", "ArrowUp", "w"].includes(e.key)) {
        e.preventDefault(); // Prevent scrolling
        if (isPlaying && !isGameOver) shoot();
        else if (!isPlaying || isGameOver) {
          if (isGameOver) resetGame();
          startGame();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (["ArrowRight", "d", "D", "ArrowLeft", "a", "A"].includes(e.key)) {
        ship.dx = 0;
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
    const leftBtn = document.querySelector('[data-dir="LEFT"]');
    const rightBtn = document.querySelector('[data-dir="RIGHT"]');
    const shootBtn = document.querySelector('[data-dir="SHOOT"]');

    if (leftBtn) {
      leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); ship.dx = -ship.speed; });
      leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); ship.dx = 0; });
    }
    if (rightBtn) {
      rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); ship.dx = ship.speed; });
      rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); ship.dx = 0; });
    }
    if (shootBtn) {
      shootBtn.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        if (isPlaying && !isGameOver) shoot();
      });
    }
  };

  const createAliens = () => {
    aliens = [];
    for (let r = 0; r < alienRows; r++) {
      for (let c = 0; c < alienCols; c++) {
        aliens.push({
          x: c * (alienWidth + alienPadding) + alienOffsetLeft,
          y: r * (alienHeight + alienPadding) + alienOffsetTop,
          status: 1,
          type: r % 3 // 0, 1, 2 for colors
        });
      }
    }
    // Speed increases with wave
    alienDx = (1 + wave * 0.2) * (Math.random() > 0.5 ? 1 : -1);
  };

  const resetGame = () => {
    ship.x = canvas.width / 2 - ship.width / 2;
    ship.y = canvas.height - 30;
    ship.dx = 0;
    bullets = [];
    score = 0;
    wave = 1;
    isGameOver = false;
    isPlaying = false;
    
    document.getElementById('invaders-score').textContent = score;
    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) statusDiv.innerHTML = '';
    
    createAliens();
  };

  const startGame = () => {
    if (gameLoop) cancelAnimationFrame(gameLoop);
    isPlaying = true;
    isGameOver = false;
    AudioManager.playTone(400, 'sine', 0.1, 0.1);
    
    const startBtn = document.querySelector('[data-action="start"]');
    if (startBtn) startBtn.textContent = '🔄 Restart';
    
    update();
  };

  const shoot = () => {
    // Limit bullets on screen
    if (bullets.length < 3) {
      bullets.push({
        x: ship.x + ship.width / 2 - 2,
        y: ship.y,
        width: 4,
        height: 10
      });
      AudioManager.playBeep(800); // Shoot sound
    }
  };

  const drawShip = () => {
    ctx.fillStyle = "#2ecc71"; // Green ship
    
    // Base
    ctx.fillRect(ship.x, ship.y + 10, ship.width, 10);
    // Middle
    ctx.fillRect(ship.x + 5, ship.y + 5, ship.width - 10, 5);
    // Tip
    ctx.fillRect(ship.x + 12, ship.y, 6, 5);
  };

  const drawBullets = () => {
    ctx.fillStyle = "#f1c40f"; // Yellow lasers
    bullets.forEach(b => {
      ctx.fillRect(b.x, b.y, b.width, b.height);
    });
  };

  const drawAliens = () => {
    const colors = ["#e74c3c", "#3498db", "#9b59b6"];
    
    aliens.forEach(a => {
      if (a.status === 1) {
        ctx.fillStyle = colors[a.type];
        
        // Simple alien shape
        ctx.fillRect(a.x, a.y + 5, alienWidth, alienHeight - 5);
        ctx.fillRect(a.x + 4, a.y, alienWidth - 8, 5);
        
        // Eyes
        ctx.fillStyle = "#000";
        ctx.fillRect(a.x + 4, a.y + 8, 4, 4);
        ctx.fillRect(a.x + 16, a.y + 8, 4, 4);
      }
    });
  };

  const drawBackground = () => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#fff";
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const draw = () => {
    drawBackground();
    drawShip();
    drawBullets();
    drawAliens();
    
    // Wave text
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "20px Arial";
    ctx.fillText(`Wave ${wave}`, 10, 25);
  };

  const update = () => {
    if (isGameOver) return;

    // Update Stars
    stars.forEach(s => {
      s.y += s.speed;
      if (s.y > canvas.height) {
        s.y = 0;
        s.x = Math.random() * canvas.width;
      }
    });

    // Update Ship
    ship.x += ship.dx;
    if (ship.x < 0) ship.x = 0;
    if (ship.x + ship.width > canvas.width) ship.x = canvas.width - ship.width;

    // Update Bullets
    for (let i = 0; i < bullets.length; i++) {
      bullets[i].y -= bulletSpeed;
      if (bullets[i].y < 0) {
        bullets.splice(i, 1);
        i--;
      }
    }

    // Update Aliens
    let hitWall = false;
    let bottomReached = false;
    let allDead = true;

    aliens.forEach(a => {
      if (a.status === 1) {
        allDead = false;
        a.x += alienDx;
        if (a.x + alienWidth > canvas.width || a.x < 0) {
          hitWall = true;
        }
        if (a.y + alienHeight >= ship.y) {
          bottomReached = true;
        }
        
        // Collision with ship
        if (a.x < ship.x + ship.width && a.x + alienWidth > ship.x &&
            a.y < ship.y + ship.height && a.y + alienHeight > ship.y) {
          gameOver();
        }
      }
    });

    if (hitWall) {
      alienDx = -alienDx;
      aliens.forEach(a => {
        if (a.status === 1) a.y += 20; // Move down
      });
    }

    if (bottomReached) {
      gameOver();
      return;
    }

    // Bullet-Alien Collision
    for (let i = 0; i < bullets.length; i++) {
      let b = bullets[i];
      let bulletHit = false;
      
      for (let j = 0; j < aliens.length; j++) {
        let a = aliens[j];
        if (a.status === 1) {
          if (b.x > a.x && b.x < a.x + alienWidth && b.y > a.y && b.y < a.y + alienHeight) {
            a.status = 0;
            bulletHit = true;
            score += (a.type + 1) * 10;
            document.getElementById('invaders-score').textContent = score;
            AudioManager.playPop(); // Kill sound
            break;
          }
        }
      }
      
      if (bulletHit) {
        bullets.splice(i, 1);
        i--;
      }
    }

    // Next Wave
    if (allDead) {
      wave++;
      createAliens();
      AudioManager.playGameWin(); // Wave clear sound
    }

    draw();
    gameLoop = requestAnimationFrame(update);
  };

  const gameOver = () => {
    isGameOver = true;
    isPlaying = false;
    AudioManager.playGameOver();
    
    canvas.style.animation = 'shake 0.5s ease';
    setTimeout(() => canvas.style.animation = '', 500);

    const isNewBest = StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.INVADERS_BEST, score, 'Space Invaders');
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.INVADERS_BEST);
    document.getElementById('invaders-best').textContent = bestScore;

    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) {
      if (isNewBest && score > 0) {
        statusDiv.innerHTML = `<span style="color: #2ed573;">Game Over!</span> 🏆 NEW BEST: ${score}!`;
      } else {
        statusDiv.innerHTML = `<span style="color: #ff4757;">Game Over!</span> Score: ${score}`;
      }
    }
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', InvadersGame.init);
} else {
  InvadersGame.init();
}
