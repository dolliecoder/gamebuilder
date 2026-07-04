/* ========================================
   APEXPLAY - Flappy Bird
   ======================================== */

const FlappyGame = (() => {
  let canvas, ctx;
  let gameLoop;
  let isPlaying = false;
  let isGameOver = false;
  
  // Game state
  let frames = 0;
  let score = 0;
  
  // Bird
  const bird = {
    x: 50,
    y: 150,
    radius: 12,
    velocity: 0,
    gravity: 0.25,
    jump: -4.6,
    draw: function() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffcc00"; // Yellow bird
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#333";
      ctx.stroke();
      
      // Eye
      ctx.beginPath();
      ctx.arc(this.x + 4, this.y - 4, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();
      
      // Beak
      ctx.beginPath();
      ctx.moveTo(this.x + 8, this.y);
      ctx.lineTo(this.x + 18, this.y + 3);
      ctx.lineTo(this.x + 8, this.y + 6);
      ctx.fillStyle = "#ff6600";
      ctx.fill();
    },
    update: function() {
      this.velocity += this.gravity;
      this.y += this.velocity;
      
      // Floor collision
      if (this.y + this.radius >= canvas.height - fg.h) {
        this.y = canvas.height - fg.h - this.radius;
        gameOver();
      }
      
      // Ceiling collision
      if (this.y - this.radius <= 0) {
        this.y = this.radius;
        this.velocity = 0;
      }
    },
    flap: function() {
      this.velocity = this.jump;
      AudioManager.playMove(); // flap sound
    }
  };
  
  // Pipes
  const pipes = {
    items: [],
    width: 50,
    gap: 120,
    dx: 2,
    draw: function() {
      for (let i = 0; i < this.items.length; i++) {
        let p = this.items[i];
        
        ctx.fillStyle = "#2ecc71"; // Green pipe
        
        // Top pipe
        ctx.fillRect(p.x, 0, this.width, p.top);
        ctx.strokeRect(p.x, 0, this.width, p.top);
        
        // Bottom pipe
        ctx.fillRect(p.x, canvas.height - fg.h - p.bottom, this.width, p.bottom);
        ctx.strokeRect(p.x, canvas.height - fg.h - p.bottom, this.width, p.bottom);
      }
    },
    update: function() {
      // Add new pipe every 100 frames
      if (frames % 100 === 0) {
        let maxPos = canvas.height - fg.h - this.gap - 20;
        let minPos = 20;
        let topHeight = Math.floor(Math.random() * (maxPos - minPos + 1) + minPos);
        let bottomHeight = canvas.height - fg.h - topHeight - this.gap;
        
        this.items.push({
          x: canvas.width,
          top: topHeight,
          bottom: bottomHeight,
          passed: false
        });
      }
      
      for (let i = 0; i < this.items.length; i++) {
        let p = this.items[i];
        p.x -= this.dx;
        
        // Collision detection
        if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.width) {
          if (bird.y - bird.radius < p.top || bird.y + bird.radius > canvas.height - fg.h - p.bottom) {
            gameOver();
          }
        }
        
        // Score update
        if (p.x + this.width < bird.x && !p.passed) {
          score++;
          p.passed = true;
          document.getElementById('flappy-score').textContent = score;
          AudioManager.playPop(); // score sound
        }
        
        // Remove pipes that are off screen
        if (p.x + this.width < 0) {
          this.items.shift();
          i--;
        }
      }
    },
    reset: function() {
      this.items = [];
    }
  };
  
  // Foreground (Floor)
  const fg = {
    h: 50,
    draw: function() {
      ctx.fillStyle = "#ded895"; // Dirt/Sand
      ctx.fillRect(0, canvas.height - this.h, canvas.width, this.h);
      ctx.fillStyle = "#73bf2e"; // Grass
      ctx.fillRect(0, canvas.height - this.h, canvas.width, 10);
    }
  };

  const init = () => {
    canvas = document.getElementById('flappy-board');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.FLAPPY_BEST) || 0;
    document.getElementById('flappy-best').textContent = bestScore;

    setupControls();
    resetGame();
    draw(); // Initial draw
  };

  const setupControls = () => {
    // Keyboard jump
    document.addEventListener('keydown', (e) => {
      if (["Space", "ArrowUp", " "].includes(e.key)) {
        e.preventDefault(); // Prevent page scrolling
        if (isPlaying && !isGameOver) {
          bird.flap();
        } else if (!isPlaying || isGameOver) {
          if (isGameOver) resetGame();
          startGame();
          bird.flap();
        }
      }
    });

    // Mouse/Touch jump
    const container = document.getElementById('flappy-container');
    container.addEventListener('mousedown', (e) => {
      if (isPlaying && !isGameOver) {
        bird.flap();
      } else if (!isPlaying || isGameOver) {
        if (isGameOver) resetGame();
        startGame();
        bird.flap();
      }
    });
    container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (isPlaying && !isGameOver) {
        bird.flap();
      } else if (!isPlaying || isGameOver) {
        if (isGameOver) resetGame();
        startGame();
        bird.flap();
      }
    });
    
    // UI Buttons
    document.querySelector('[data-action="start"]')?.addEventListener('click', () => {
      if (!isPlaying || isGameOver) {
        if (isGameOver) resetGame();
        startGame();
      }
    });

    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  };

  const resetGame = () => {
    bird.y = 150;
    bird.velocity = 0;
    pipes.reset();
    score = 0;
    frames = 0;
    isGameOver = false;
    isPlaying = false;
    
    document.getElementById('flappy-score').textContent = score;
    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) statusDiv.innerHTML = '';
  };

  const startGame = () => {
    if (gameLoop) cancelAnimationFrame(gameLoop);
    isPlaying = true;
    isGameOver = false;
    
    const startBtn = document.querySelector('[data-action="start"]');
    if (startBtn) startBtn.textContent = '🔄 Restart';
    
    update();
  };

  const draw = () => {
    ctx.fillStyle = "#70c5ce"; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    pipes.draw();
    fg.draw();
    bird.draw();
  };

  const update = () => {
    if (isGameOver) return;
    
    frames++;
    bird.update();
    pipes.update();
    draw();

    gameLoop = requestAnimationFrame(update);
  };

  const gameOver = () => {
    isGameOver = true;
    isPlaying = false;
    AudioManager.playGameOver();
    
    // Canvas shake
    canvas.style.animation = 'bounce 0.5s ease';
    setTimeout(() => canvas.style.animation = '', 500);

    const isNewBest = StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.FLAPPY_BEST, score, 'Flappy Bird');
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.FLAPPY_BEST);
    document.getElementById('flappy-best').textContent = bestScore;

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
  document.addEventListener('DOMContentLoaded', FlappyGame.init);
} else {
  FlappyGame.init();
}
