/* ========================================
   GAMEHUB - Whack-a-Mole
   ======================================== */

const MoleGame = (() => {
  let score = 0;
  let timeLeft = 30;
  let isPlaying = false;
  let gameInterval;
  let moleInterval;
  let lastHole = -1;
  const GAME_DURATION = 30; // seconds

  const init = () => {
    // Show best score
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.WHACKAMOLE_BEST) || 0;
    document.getElementById('mole-best').textContent = bestScore;

    setupControls();
  };

  const setupControls = () => {
    document.querySelector('[data-action="start"]')?.addEventListener('click', startGame);
    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    const moles = document.querySelectorAll('.mole');
    moles.forEach(mole => {
      mole.addEventListener('mousedown', whack);
      mole.addEventListener('touchstart', (e) => {
        e.preventDefault();
        whack.call(mole, e);
      });
    });
  };

  const startGame = () => {
    if (isPlaying) return;
    isPlaying = true;
    score = 0;
    timeLeft = GAME_DURATION;
    
    document.getElementById('mole-score').textContent = score;
    document.getElementById('mole-time').textContent = timeLeft;
    document.querySelector('.game-status').textContent = 'Go!';
    document.querySelector('[data-action="start"]').textContent = '🔄 Restart';

    // Clear any existing intervals
    clearInterval(gameInterval);
    clearInterval(moleInterval);

    // Start timer
    gameInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('mole-time').textContent = timeLeft;
      
      if (timeLeft <= 10) {
        document.getElementById('mole-time').style.color = 'red';
      } else {
        document.getElementById('mole-time').style.color = '';
      }

      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);

    // Start popping moles
    popMole();
  };

  const randomTime = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
  };

  const randomHole = (holes) => {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (idx === lastHole) {
      return randomHole(holes); // avoid same hole twice in a row
    }
    lastHole = idx;
    return hole;
  };

  const popMole = () => {
    if (!isPlaying) return;
    
    const holes = document.querySelectorAll('.hole');
    const hole = randomHole(holes);
    const time = randomTime(400, 1000); // How long mole stays up
    
    const mole = hole.querySelector('.mole');
    mole.classList.remove('whacked');
    mole.classList.add('up');
    
    setTimeout(() => {
      mole.classList.remove('up');
      if (isPlaying) {
        setTimeout(popMole, randomTime(200, 500)); // Delay before next mole
      }
    }, time);
  };

  const whack = function(e) {
    if (!e.isTrusted && e.type !== 'touchstart') return; // Prevent fake clicks
    if (!isPlaying) return;
    if (!this.classList.contains('up')) return;
    if (this.classList.contains('whacked')) return; // Already whacked

    this.classList.add('whacked');
    this.classList.remove('up');
    
    score++;
    document.getElementById('mole-score').textContent = score;
    AudioManager.playPop(); // Use pop sound for whacking
  };

  const endGame = () => {
    isPlaying = false;
    clearInterval(gameInterval);
    AudioManager.playGameOver();
    
    // Hide any remaining moles
    document.querySelectorAll('.mole').forEach(mole => mole.classList.remove('up', 'whacked'));
    document.getElementById('mole-time').style.color = '';
    
    const isNewBest = StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.WHACKAMOLE_BEST, score, 'Whack-a-Mole');
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.WHACKAMOLE_BEST);
    document.getElementById('mole-best').textContent = bestScore;

    const statusDiv = document.querySelector('.game-status');
    if (isNewBest) {
      statusDiv.innerHTML = `<span style="color: #2ed573;">Time's up!</span> 🏆 NEW HIGH SCORE: ${score}!`;
      setTimeout(AudioManager.playGameWin, 500);
    } else {
      statusDiv.innerHTML = `Time's up! You whacked ${score} moles.`;
    }
    
    document.querySelector('[data-action="start"]').textContent = '▶️ Start Game';
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', MoleGame.init);
} else {
  MoleGame.init();
}
