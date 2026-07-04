/* ========================================
   APEXPLAY - Wordle Clone
   ======================================== */

const WordleGame = (() => {
  const WORDS = [
    "APPLE", "BRAVE", "CRANE", "DANCE", "EAGLE",
    "FROST", "GHOST", "HEART", "IGLOO", "JUMBO",
    "KNIFE", "LEMON", "MAGIC", "NIGHT", "OCEAN",
    "PIZZA", "QUEEN", "RIVER", "SNAKE", "TRAIN",
    "UNCLE", "VOICE", "WATER", "XENON", "YACHT",
    "ZEBRA", "BRICK", "CLOCK", "DREAM", "FLAME",
    "GRAPE", "HOUSE", "JUICE", "KITE", "LIGHT",
    "MOUSE", "PLANT", "SMILE", "TABLE", "WHEEL",
    "BREAD", "CHAIR", "EARTH", "FRUIT", "GLASS"
  ];

  let targetWord = "";
  let currentRow = 0;
  let currentTile = 0;
  let isGameOver = false;
  let currentStreak = 0;
  let bestStreak = 0;

  const init = () => {
    bestStreak = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.WORDLE_STREAK) || 0;
    
    // In Wordle, streak is a bit different. Let's just track current streak in memory,
    // and best streak in storage. If they refresh, current streak resets.
    document.getElementById('wordle-streak').textContent = currentStreak;
    document.getElementById('wordle-best').textContent = bestStreak;

    setupBoard();
    setupControls();
    startNewGame();
  };

  const setupBoard = () => {
    const board = document.getElementById('wordle-board');
    board.innerHTML = '';
    for (let r = 0; r < 6; r++) {
      const row = document.createElement('div');
      row.className = 'wordle-row';
      for (let c = 0; c < 5; c++) {
        const tile = document.createElement('div');
        tile.className = 'wordle-tile';
        tile.id = `tile-${r}-${c}`;
        row.appendChild(tile);
      }
      board.appendChild(row);
    }
  };

  const setupControls = () => {
    document.addEventListener('keydown', handleKeyPress);
    
    document.querySelectorAll('.wordle-key').forEach(key => {
      key.addEventListener('click', () => {
        handleInput(key.getAttribute('data-key'));
      });
    });

    document.querySelector('[data-action="restart"]')?.addEventListener('click', () => {
      startNewGame();
    });

    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  };

  const startNewGame = () => {
    targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    currentRow = 0;
    currentTile = 0;
    isGameOver = false;

    // Reset board
    document.querySelectorAll('.wordle-tile').forEach(tile => {
      tile.textContent = '';
      tile.className = 'wordle-tile';
    });

    // Reset keyboard
    document.querySelectorAll('.wordle-key').forEach(key => {
      key.className = 'wordle-key' + (key.classList.contains('wide') ? ' wide' : '');
    });

    // Reset UI
    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) statusDiv.innerHTML = '';
    document.querySelector('[data-action="restart"]').style.display = 'none';
    
    updateActiveTile();
  };

  const handleKeyPress = (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    
    if (e.key === 'Enter' || e.key === 'Backspace' || /^[a-zA-Z]$/.test(e.key)) {
      handleInput(e.key);
    }
  };

  const handleInput = (key) => {
    if (isGameOver) return;

    if (key === 'Backspace') {
      if (currentTile > 0) {
        currentTile--;
        const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
        tile.textContent = '';
        AudioManager.playClick();
        updateActiveTile();
      }
    } else if (key === 'Enter') {
      if (currentTile === 5) {
        checkRow();
      } else {
        showMessage('Not enough letters', 'warning');
      }
    } else if (/^[a-zA-Z]$/.test(key)) {
      if (currentTile < 5) {
        const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
        tile.textContent = key.toUpperCase();
        currentTile++;
        AudioManager.playMove(); // Use a subtle sound for typing
        updateActiveTile();
      }
    }
  };

  const updateActiveTile = () => {
    document.querySelectorAll('.wordle-tile').forEach(t => t.classList.remove('active'));
    if (!isGameOver && currentTile < 5) {
      const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
      if (tile) tile.classList.add('active');
    }
  };

  const checkRow = () => {
    let guess = '';
    for (let i = 0; i < 5; i++) {
      guess += document.getElementById(`tile-${currentRow}-${i}`).textContent;
    }

    // Animation delay helper
    const flipTile = (index, status) => {
      setTimeout(() => {
        const tile = document.getElementById(`tile-${currentRow}-${index}`);
        tile.classList.add(status);
        updateKeyboard(guess[index], status);
        AudioManager.playPop(); // Pop for each letter flipping
      }, index * 250);
    };

    let targetArray = targetWord.split('');
    let guessArray = guess.split('');
    let statuses = Array(5).fill('absent');

    // First pass: find correct letters (green)
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === targetArray[i]) {
        statuses[i] = 'correct';
        targetArray[i] = null; // consume letter
      }
    }

    // Second pass: find present letters (yellow)
    for (let i = 0; i < 5; i++) {
      if (statuses[i] === 'correct') continue;
      const index = targetArray.indexOf(guessArray[i]);
      if (index !== -1) {
        statuses[i] = 'present';
        targetArray[index] = null; // consume letter
      }
    }

    // Apply animations
    for (let i = 0; i < 5; i++) {
      flipTile(i, statuses[i]);
    }

    // Wait for animations to finish before checking win/loss
    setTimeout(() => {
      if (guess === targetWord) {
        winGame();
      } else {
        currentRow++;
        currentTile = 0;
        if (currentRow > 5) {
          loseGame();
        } else {
          updateActiveTile();
        }
      }
    }, 1500); // 5 tiles * 250ms + some padding
  };

  const updateKeyboard = (letter, status) => {
    const key = document.querySelector(`.wordle-key[data-key="${letter.toLowerCase()}"]`);
    if (!key) return;
    
    // Don't downgrade correct to present/absent
    if (key.classList.contains('correct')) return;
    if (key.classList.contains('present') && status === 'absent') return;
    
    key.classList.remove('present', 'absent');
    key.classList.add(status);
  };

  const showMessage = (msg, type = 'info') => {
    const statusDiv = document.querySelector('.game-status');
    if (statusDiv) {
      statusDiv.textContent = msg;
      statusDiv.style.color = type === 'warning' ? '#ff9f43' : type === 'success' ? '#1dd1a1' : '#ff6b6b';
      
      if (type === 'warning') {
        AudioManager.playError();
        setTimeout(() => {
          if (!isGameOver) statusDiv.textContent = '';
        }, 2000);
      }
    }
  };

  const winGame = () => {
    isGameOver = true;
    currentStreak++;
    
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
      StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.WORDLE_STREAK, bestStreak, 'Wordle');
    }
    
    document.getElementById('wordle-streak').textContent = currentStreak;
    document.getElementById('wordle-best').textContent = bestStreak;
    
    showMessage('Splendid! 🎉', 'success');
    AudioManager.playGameWin();
    document.querySelector('[data-action="restart"]').style.display = 'inline-block';
  };

  const loseGame = () => {
    isGameOver = true;
    currentStreak = 0;
    document.getElementById('wordle-streak').textContent = currentStreak;
    
    showMessage(targetWord, 'error');
    AudioManager.playGameOver();
    document.querySelector('[data-action="restart"]').style.display = 'inline-block';
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', WordleGame.init);
} else {
  WordleGame.init();
}
