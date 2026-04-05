/* ========================================
   GAMEHUB - Memory Game
   Card matching game with move tracking
   ======================================== */

const MemoryGame = (() => {
  const EMOJIS = ['🍎', '🍎', '🍊', '🍊', '🍋', '🍋', '🍌', '🍌'];
  const ANIMATIONS = {
    FLIP: 'flip',
    MATCH: 'match',
    MISMATCH: 'mismatch',
  };

  let gameState = {
    cards: [],
    flipped: [],
    matched: [],
    moves: 0,
    gameOver: false,
    canClick: true,
  };

  /**
   * Initialize the game
   */
  const init = () => {
    const gridContainer = document.querySelector('.memory-grid');
    if (!gridContainer) return;

    initializeCards();
    renderGrid(gridContainer);
    updateMoveCount();
  };

  /**
   * Initialize and shuffle cards
   */
  const initializeCards = () => {
    gameState.cards = [...EMOJIS].sort(() => Math.random() - 0.5);
    gameState.flipped = [];
    gameState.matched = [];
    gameState.moves = 0;
    gameState.gameOver = false;
    gameState.canClick = true;
  };

  /**
   * Render the game grid
   */
  const renderGrid = (container) => {
    container.innerHTML = gameState.cards
      .map((emoji, index) => createCard(emoji, index))
      .join('');

    // Add event listeners to cards
    gameState.cards.forEach((_, index) => {
      const card = container.querySelector(`[data-index="${index}"]`);
      if (card) {
        card.addEventListener('click', () => handleCardClick(index, container));
      }
    });
  };

  /**
   * Create a card element
   */
  const createCard = (emoji, index) => {
    const isFlipped = gameState.flipped.includes(index) || gameState.matched.includes(index);
    const isMatched = gameState.matched.includes(index);

    return `
      <button 
        class="memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}"
        data-index="${index}"
        ${gameState.gameOver ? 'disabled' : ''}
      >
        ${isFlipped ? emoji : '?'}
      </button>
    `;
  };

  /**
   * Handle card click
   */
  const handleCardClick = (index, container) => {
    // Prevent clicking if game is over, card is already flipped, or two cards are being compared
    if (
      gameState.gameOver ||
      gameState.flipped.includes(index) ||
      gameState.matched.includes(index) ||
      !gameState.canClick
    ) {
      return;
    }

    // Add to flipped
    gameState.flipped.push(index);
    renderGrid(container);

    // If two cards are flipped, check for match
    if (gameState.flipped.length === 2) {
      gameState.canClick = false;
      checkMatch(container);
    }
  };

  /**
   * Check if two flipped cards match
   */
  const checkMatch = (container) => {
    const [index1, index2] = gameState.flipped;
    const emoji1 = gameState.cards[index1];
    const emoji2 = gameState.cards[index2];

    gameState.moves++;
    updateMoveCount();

    if (emoji1 === emoji2) {
      // Match found
      gameState.matched.push(index1, index2);
      gameState.flipped = [];
      gameState.canClick = true;

      renderGrid(container);
      animateMatch(container, index1, index2);

      // Check if game is complete
      if (gameState.matched.length === gameState.cards.length) {
        endGame();
      }
    } else {
      // No match
      setTimeout(() => {
        gameState.flipped = [];
        gameState.canClick = true;
        renderGrid(container);
      }, 1000);
    }
  };

  /**
   * Animate matched cards
   */
  const animateMatch = (container, index1, index2) => {
    const card1 = container.querySelector(`[data-index="${index1}"]`);
    const card2 = container.querySelector(`[data-index="${index2}"]`);

    if (card1) card1.style.animation = 'pulse 0.4s ease-out';
    if (card2) card2.style.animation = 'pulse 0.4s ease-out';
  };

  /**
   * Update move counter display
   */
  const updateMoveCount = () => {
    const moveCounter = document.querySelector('.move-counter');
    if (moveCounter) {
      moveCounter.textContent = gameState.moves;
    }
  };

  /**
   * End the game and show results
   */
  const endGame = () => {
    gameState.gameOver = true;

    // Save score
    StorageManager.saveMemoryScore(gameState.moves);

    // Show completion message
    showCompletionMessage();

    // Redirect to dashboard after delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
  };

  /**
   * Show completion message
   */
  const showCompletionMessage = () => {
    const messageContainer = document.querySelector('.game-message');
    if (messageContainer) {
      messageContainer.innerHTML = `
        <div class="status-message success">
          🎉 Congratulations! You matched all pairs in ${gameState.moves} moves!
        </div>
      `;
      messageContainer.style.display = 'block';
    }
  };

  /**
   * Reset the game
   */
  const reset = () => {
    const gridContainer = document.querySelector('.memory-grid');
    if (!gridContainer) return;

    initializeCards();
    renderGrid(gridContainer);
    updateMoveCount();

    const messageContainer = document.querySelector('.game-message');
    if (messageContainer) {
      messageContainer.innerHTML = '';
      messageContainer.style.display = 'none';
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
    MemoryGame.init();

    // Set up button listeners
    const resetBtn = document.querySelector('[data-action="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => MemoryGame.reset());
    }

    const homeBtn = document.querySelector('[data-action="home"]');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => MemoryGame.goHome());
    }
  });
} else {
  MemoryGame.init();
}
