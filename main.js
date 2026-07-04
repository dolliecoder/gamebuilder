/* ========================================
   GAMEHUB - Main Application
   Home page navigation and game selection
   ======================================== */

const GameHub = (() => {
  const GAMES = {
    memory: {
      id: 'memory',
      title: 'Memory Game',
      description: 'Test your memory by matching pairs of cards. Click on cards to reveal them and find matching pairs.',
      emoji: '🧠',
      url: 'game1.html',
    },
    tictactoe: {
      id: 'tictactoe',
      title: 'Tic Tac Toe',
      description: 'Classic game for two players. Take turns marking spaces in a 3x3 grid. Get three in a row to win!',
      emoji: '⭕',
      url: 'game2.html',
    },
    reaction: {
      id: 'game3',
      title: 'Brick Breaker',
      description: 'Bounce the ball off the paddle to break all the colorful bricks.',
      emoji: '🧱',
      url: 'game3.html',
    },
    snake: {
      id: 'snake',
      title: 'Snake Game',
      description: 'The classic grid game. Eat apples to grow longer, but don\'t hit the walls or yourself!',
      emoji: '🐍',
      url: 'game4.html',
    },
    puzzle2048: {
      id: 'puzzle2048',
      title: '2048 Puzzle',
      description: 'Slide and merge matching numbers to reach the legendary 2048 tile!',
      emoji: '🧩',
      url: 'game5.html',
    },
    simon: {
      id: 'simon',
      title: 'Simon Says',
      description: 'Test your memory. Watch the color sequence and repeat it back correctly!',
      emoji: '🎨',
      url: 'game6.html',
    },
    whackamole: {
      id: 'whackamole',
      title: 'Whack-a-Mole',
      description: 'Whack the moles as they pop up before the time runs out!',
      emoji: '🔨',
      url: 'game7.html',
    },
    typing: {
      id: 'typing',
      title: 'Typing Speed',
      description: 'Test your typing speed and accuracy. Type the words as fast as you can!',
      emoji: '⌨️',
      url: 'game8.html',
    },
    rps: {
      id: 'rps',
      title: 'Rock Paper Scissors',
      description: 'Play against the AI. Can you get the highest winning streak?',
      emoji: '✊',
      url: 'game9.html',
    },
  };

  /**
   * Initialize the home page
   */
  const init = () => {
    renderGameGrid();
    displayLastGameInfo();
  };

  /**
   * Render the game selection grid
   */
  const renderGameGrid = () => {
    const gameGrid = document.querySelector('.game-grid');
    if (!gameGrid) return;

    gameGrid.innerHTML = Object.values(GAMES)
      .map((game) => createGameCard(game))
      .join('');

    // Add event listeners
    Object.values(GAMES).forEach((game) => {
      const button = document.querySelector(`[data-game="${game.id}"]`);
      if (button) {
        button.addEventListener('click', () => navigateToGame(game.url));
      }
    });
  };

  /**
   * Create a game card HTML
   */
  const createGameCard = (game) => {
    return `
      <div class="game-card">
        <div class="game-card-icon">${game.emoji}</div>
        <div class="game-card-content">
          <h3 class="game-card-title">${game.title}</h3>
          <p class="game-card-description">${game.description}</p>
        </div>
        <div class="game-card-footer">
          <button class="btn btn-primary btn-large" data-game="${game.id}">
            Play Now
          </button>
        </div>
      </div>
    `;
  };

  /**
   * Display information about the last played game
   */
  const displayLastGameInfo = () => {
    const lastGameDiv = document.querySelector('.last-game-info');
    if (!lastGameDiv) return;

    const lastGame = StorageManager.getLastGame();
    const totalGames = StorageManager.getTotalGames();

    if (lastGame && totalGames > 0) {
      lastGameDiv.innerHTML = `
        <div class="status-message info">
          <strong>Last Played:</strong> ${lastGame.name} on ${lastGame.date}
          <br>
          <small>Total games played: ${totalGames}</small>
        </div>
      `;
    } else {
      lastGameDiv.innerHTML = `
        <div class="status-message info">
          Welcome to GameHub! Select a game to get started.
        </div>
      `;
    }
  };

  /**
   * Navigate to a game
   */
  const navigateToGame = (url) => {
    window.location.href = url;
  };

  // Public API
  return {
    init,
    navigateToGame,
  };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    GameHub.init();
  });
} else {
  GameHub.init();
}