/* ========================================
   APEXPLAY - Simon Says
   ======================================== */

const SimonGame = (() => {
  let sequence = [];
  let playerSequence = [];
  let level = 0;
  let isPlayerTurn = false;
  let isGameOver = false;
  
  // Frequencies for buttons: Red, Green, Blue, Yellow
  const FREQS = [329.63, 261.63, 220.00, 164.81];

  const init = () => {
    // Show best score
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.SIMON_BEST) || 0;
    document.getElementById('simon-best').textContent = bestScore;

    setupControls();
  };

  const setupControls = () => {
    document.querySelector('[data-action="start"]')?.addEventListener('click', startGame);
    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    document.querySelectorAll('.simon-btn').forEach(btn => {
      btn.addEventListener('mousedown', (e) => handleButtonPress(e.target.dataset.index));
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // prevent mouse emulation
        handleButtonPress(e.target.dataset.index);
      });
    });
  };

  const startGame = () => {
    sequence = [];
    playerSequence = [];
    level = 0;
    isGameOver = false;
    isPlayerTurn = false;
    updateScore();
    
    document.querySelector('.game-status').innerHTML = '';
    document.querySelector('[data-action="start"]').textContent = '🔄 Restart';
    
    setTimeout(nextRound, 500);
  };

  const nextRound = () => {
    level++;
    updateScore();
    playerSequence = [];
    isPlayerTurn = false;
    
    // Add random color (0-3)
    sequence.push(Math.floor(Math.random() * 4));
    
    document.querySelector('.game-status').textContent = "Watch carefully...";
    document.querySelector('.game-status').style.color = "#667eea";
    
    playSequence();
  };

  const playSequence = () => {
    let i = 0;
    const interval = setInterval(() => {
      flashButton(sequence[i]);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          isPlayerTurn = true;
          document.querySelector('.game-status').textContent = "Your turn!";
          document.querySelector('.game-status').style.color = "#2ed573";
        }, 500);
      }
    }, 600); // Speed of sequence
  };

  const flashButton = (index) => {
    const btn = document.getElementById(`simon-${index}`);
    if (!btn) return;
    
    btn.classList.add('active');
    AudioManager.playBeep(FREQS[index]);
    
    setTimeout(() => {
      btn.classList.remove('active');
    }, 300);
  };

  const handleButtonPress = (index) => {
    if (!isPlayerTurn || isGameOver) return;
    
    const idx = parseInt(index);
    flashButton(idx);
    playerSequence.push(idx);
    
    checkSequence();
  };

  const checkSequence = () => {
    const currentIndex = playerSequence.length - 1;
    
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
      gameOver();
      return;
    }
    
    if (playerSequence.length === sequence.length) {
      isPlayerTurn = false;
      document.querySelector('.game-status').textContent = "Correct!";
      document.querySelector('.game-status').style.color = "#1e90ff";
      setTimeout(nextRound, 1000);
    }
  };

  const updateScore = () => {
    document.getElementById('simon-score').textContent = level;
  };

  const gameOver = () => {
    isGameOver = true;
    isPlayerTurn = false;
    AudioManager.playError();
    
    const isNewBest = StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.SIMON_BEST, level - 1, 'Simon Says'); // Level - 1 because they failed the current level
    const bestScore = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.SIMON_BEST);
    document.getElementById('simon-best').textContent = bestScore;

    const statusDiv = document.querySelector('.game-status');
    
    // flash background red
    document.body.style.backgroundColor = "#ff4757";
    setTimeout(() => {
      document.body.style.backgroundColor = "";
    }, 200);

    if (isNewBest) {
      statusDiv.innerHTML = `<span style="color: #ff4757;">Game Over!</span> 🏆 NEW BEST LEVEL: ${level - 1}!`;
      setTimeout(AudioManager.playGameWin, 500);
    } else {
      statusDiv.innerHTML = `<span style="color: #ff4757;">Game Over!</span> You reached level ${level - 1}.`;
    }
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', SimonGame.init);
} else {
  SimonGame.init();
}
