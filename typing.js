/* ========================================
   APEXPLAY - Typing Speed Test
   ======================================== */

const TypingGame = (() => {
  const WORDS = "the quick brown fox jumps over the lazy dog programming is fun and challenging build amazing things with code practice makes perfect speed and accuracy are key focus on the screen keep your fingers on the home row always learning new skills web development javascript html css design patterns algorithms data structures".split(" ");
  
  let currentText = "";
  let typedText = "";
  let startTime = null;
  let timerInterval = null;
  let isPlaying = false;
  let totalTyped = 0;
  let correctTyped = 0;
  const TIME_LIMIT = 30; // seconds

  const init = () => {
    // Show best score
    const bestData = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.TYPING_BEST) || { wpm: 0, accuracy: 0 };
    document.getElementById('typing-best').textContent = bestData.wpm;

    setupControls();
    generateText();
  };

  const setupControls = () => {
    document.querySelector('[data-action="start"]')?.addEventListener('click', startGame);
    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    const input = document.getElementById('typing-input');
    input.addEventListener('input', handleInput);
    
    // Focus input when clicking text area
    document.getElementById('typing-box').addEventListener('click', () => {
      if (isPlaying) input.focus();
    });
  };

  const generateText = () => {
    let textArray = [];
    for (let i = 0; i < 50; i++) {
      textArray.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }
    currentText = textArray.join(" ");
    
    const textContainer = document.getElementById('typing-text');
    textContainer.innerHTML = '';
    
    currentText.split('').forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      textContainer.appendChild(span);
    });
  };

  const startGame = () => {
    if (isPlaying) return;
    
    generateText();
    typedText = "";
    totalTyped = 0;
    correctTyped = 0;
    isPlaying = true;
    
    document.getElementById('typing-wpm').textContent = "0";
    document.getElementById('typing-accuracy').textContent = "100%";
    document.querySelector('.game-status').textContent = "Type as fast as you can!";
    document.querySelector('[data-action="start"]').textContent = '🔄 Restart';
    
    const box = document.getElementById('typing-box');
    box.style.filter = "none";
    box.style.pointerEvents = "auto";
    
    const input = document.getElementById('typing-input');
    input.value = "";
    input.focus();

    // Start Timer
    startTime = Date.now();
    clearInterval(timerInterval);
    
    const timerFill = document.getElementById('typing-timer');
    timerFill.style.transition = 'none';
    timerFill.style.width = '100%';
    
    setTimeout(() => {
      timerFill.style.transition = `width ${TIME_LIMIT}s linear`;
      timerFill.style.width = '0%';
    }, 50);

    timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      updateStats(elapsed);
      
      if (elapsed >= TIME_LIMIT) {
        endGame();
      }
    }, 1000);
    
    renderText();
  };

  const handleInput = (e) => {
    if (!isPlaying) return;
    
    AudioManager.playClick();
    
    const input = e.target.value;
    totalTyped++;
    
    if (input[input.length - 1] === currentText[input.length - 1]) {
      correctTyped++;
    }

    // If they typed too much, stop them
    if (input.length >= currentText.length) {
      endGame();
      return;
    }
    
    renderText(input);
  };

  const renderText = (input = "") => {
    const spans = document.getElementById('typing-text').querySelectorAll('span');
    
    spans.forEach((span, index) => {
      span.className = "";
      if (index < input.length) {
        if (span.textContent === input[index]) {
          span.classList.add('correct');
        } else {
          span.classList.add('incorrect');
        }
      } else if (index === input.length) {
        span.classList.add('current');
      }
    });
  };

  const updateStats = (elapsed) => {
    if (elapsed <= 0) return;
    const input = document.getElementById('typing-input').value;
    
    // WPM calculation: (Characters / 5) / (Time in minutes)
    const words = input.length / 5;
    const minutes = elapsed / 60;
    const wpm = Math.round(words / minutes);
    
    let accuracy = 100;
    if (totalTyped > 0) {
      accuracy = Math.round((correctTyped / totalTyped) * 100);
    }
    
    document.getElementById('typing-wpm').textContent = wpm;
    document.getElementById('typing-accuracy').textContent = `${accuracy}%`;
  };

  const endGame = () => {
    isPlaying = false;
    clearInterval(timerInterval);
    AudioManager.playGameOver();
    
    document.getElementById('typing-input').blur();
    document.getElementById('typing-box').style.pointerEvents = "none";
    
    const wpm = parseInt(document.getElementById('typing-wpm').textContent);
    const accuracy = parseInt(document.getElementById('typing-accuracy').textContent);
    
    const isNewBest = StorageManager.saveHighScore(
      StorageManager.STORAGE_KEYS.TYPING_BEST, 
      { wpm, accuracy }, 
      'Typing Speed Test'
    );
    
    const bestData = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.TYPING_BEST);
    document.getElementById('typing-best').textContent = bestData.wpm;

    const statusDiv = document.querySelector('.game-status');
    if (isNewBest) {
      statusDiv.innerHTML = `<span style="color: #2ed573;">Time's up!</span> 🏆 NEW BEST: ${wpm} WPM!`;
      setTimeout(AudioManager.playGameWin, 500);
    } else {
      statusDiv.innerHTML = `Time's up! You typed at ${wpm} WPM.`;
    }
    
    document.querySelector('[data-action="start"]').textContent = '▶️ Start Game';
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', TypingGame.init);
} else {
  TypingGame.init();
}
