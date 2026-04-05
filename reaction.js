/* ========================================
   GAMEHUB - Reaction Timer Game
   Measure user reaction time in milliseconds
   ======================================== */

const ReactionGame = (() => {
  const STATES = {
    IDLE: 'idle',
    WAITING: 'waiting',
    READY: 'ready',
    COMPLETED: 'completed',
  };

  let gameState = {
    state: STATES.IDLE,
    startTime: null,
    reactionTime: null,
    clicked: false,
    randomDelay: null,
  };

  /**
   * Initialize the game
   */
  const init = () => {
    setupEventListeners();
    renderInitialState();
  };

  /**
   * Setup event listeners
   */
  const setupEventListeners = () => {
    const startBtn = document.querySelector('[data-action="start"]');
    const clickArea = document.querySelector('.reaction-click-area');
    const homeBtn = document.querySelector('[data-action="home"]');

    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
      });
    }

    if (clickArea) {
      clickArea.addEventListener('click', (e) => {
        e.stopPropagation();
        handleClick();
      });
    }

    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        goHome();
      });
    }
  };

  /**
   * Render initial state
   */
  const renderInitialState = () => {
    updateDisplay();
  };

  /**
   * Start the game
   */
  const startGame = () => {
    if (gameState.state !== STATES.IDLE && gameState.state !== STATES.COMPLETED) {
      return;
    }

    // Reset for new game
    gameState.state = STATES.WAITING;
    gameState.clicked = false;
    gameState.reactionTime = null;
    gameState.randomDelay = Math.random() * 3000 + 1000; // 1-4 seconds

    updateDisplay();

    // Wait for random delay then show "CLICK!"
    setTimeout(() => {
      if (gameState.state === STATES.WAITING && !gameState.clicked) {
        gameState.state = STATES.READY;
        gameState.startTime = Date.now();
        updateDisplay();
      }
    }, gameState.randomDelay);
  };

  /**
   * Handle click on the game area
   */
  const handleClick = () => {
    if (gameState.state === STATES.WAITING) {
      // Clicked too early
      gameState.state = STATES.COMPLETED;
      gameState.clicked = true;
      gameState.reactionTime = null;
      showError('⚠️ Too early! Click when you see "CLICK!"');
      updateDisplay();
    } else if (gameState.state === STATES.READY) {
      // Valid click
      gameState.reactionTime = Date.now() - gameState.startTime;
      gameState.state = STATES.COMPLETED;
      gameState.clicked = true;
      saveReactionTime();
      updateDisplay();

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 3000);
    }
  };

  /**
   * Save reaction time and update stats
   */
  const saveReactionTime = () => {
    StorageManager.saveReactionTime(gameState.reactionTime);
  };

  /**
   * Update display based on game state
   */
  const updateDisplay = () => {
    const displayArea = document.querySelector('.reaction-display');
    const clickArea = document.querySelector('.reaction-click-area');
    const startBtn = document.querySelector('[data-action="start"]');
    const statsDiv = document.querySelector('.reaction-stats');

    if (!displayArea) return;

    let displayText = '';
    let displayClass = '';

    switch (gameState.state) {
      case STATES.IDLE:
        displayText = 'Click "Start" to begin!';
        displayClass = 'info';
        if (clickArea) clickArea.style.pointerEvents = 'none';
        break;

      case STATES.WAITING:
        displayText = '⏳ Wait...';
        displayClass = 'warning';
        if (clickArea) clickArea.style.pointerEvents = 'none';
        break;

      case STATES.READY:
        displayText = '⚡ CLICK!';
        displayClass = 'success';
        if (clickArea) clickArea.style.pointerEvents = 'auto';
        break;

      case STATES.COMPLETED:
        if (gameState.reactionTime !== null && gameState.reactionTime > 0) {
          displayText = `${gameState.reactionTime}ms`;
          displayClass = 'success';

          // Display stats
          const stats = StorageManager.getReactionStats();
          if (statsDiv) {
            let statsHTML = `
              <div class="stats-container">
                <div class="stat-box">
                  <div class="stat-label">This Attempt</div>
                  <div class="stat-value">${gameState.reactionTime}ms</div>
                </div>
            `;

            if (stats.best) {
              statsHTML += `
                <div class="stat-box">
                  <div class="stat-label">Best Time</div>
                  <div class="stat-value">${stats.best}ms</div>
                </div>
              `;
            }

            if (stats.average) {
              statsHTML += `
                <div class="stat-box">
                  <div class="stat-label">Average Time</div>
                  <div class="stat-value">${stats.average}ms</div>
                </div>
              `;
            }

            statsHTML += `
                <div class="stat-box">
                  <div class="stat-label">Total Attempts</div>
                  <div class="stat-value">${stats.count + 1}</div>
                </div>
              </div>
            `;

            statsDiv.innerHTML = statsHTML;
          }
        } else {
          displayText = '❌ Too early!';
          displayClass = 'warning';
        }
        if (clickArea) clickArea.style.pointerEvents = 'none';
        break;
    }

    // Update display directly and immediately
    displayArea.innerHTML = displayText;
    displayArea.className = `timer-display timer-${displayClass}`;

    // Update button
    if (startBtn) {
      startBtn.textContent = gameState.state === STATES.COMPLETED ? 'Try Again' : 'Start';
    }
  };

  /**
   * Show error message
   */
  const showError = (message) => {
    const messageDiv = document.querySelector('.game-message');
    if (messageDiv) {
      messageDiv.innerHTML = `<div class="status-message warning">${message}</div>`;
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
    goHome,
  };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ReactionGame.init();
  });
} else {
  ReactionGame.init();
}
