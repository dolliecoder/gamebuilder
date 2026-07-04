/* ========================================
   APEXPLAY - Rock Paper Scissors
   ======================================== */

const RPSGame = (() => {
  const CHOICES = ['rock', 'paper', 'scissors'];
  const EMOJIS = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️',
    default: '👊'
  };

  let streak = 0;
  let isAnimating = false;

  const init = () => {
    // Show best score
    const bestStreak = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.RPS_STREAK) || 0;
    document.getElementById('rps-best').textContent = bestStreak;

    setupControls();
  };

  const setupControls = () => {
    document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    document.querySelectorAll('.rps-btn').forEach(btn => {
      btn.addEventListener('click', () => playRound(btn.dataset.choice));
    });
  };

  const playRound = (playerChoice) => {
    if (isAnimating) return;
    isAnimating = true;

    // Disable buttons
    document.querySelectorAll('.rps-btn').forEach(b => b.disabled = true);
    
    const statusDiv = document.querySelector('.game-status');
    statusDiv.textContent = 'Rock... Paper... Scissors...';
    statusDiv.style.color = '#333';

    const playerHand = document.getElementById('player-hand');
    const aiHand = document.getElementById('ai-hand');

    // Reset to fists and shake
    playerHand.textContent = EMOJIS.default;
    aiHand.textContent = EMOJIS.default;
    playerHand.classList.add('shake-left');
    aiHand.classList.add('shake-right');

    AudioManager.playMove(); // play a woosh/move sound

    setTimeout(() => {
      // Stop animation
      playerHand.classList.remove('shake-left');
      aiHand.classList.remove('shake-right');

      // AI makes a choice
      const aiChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
      
      // Update hands
      playerHand.textContent = EMOJIS[playerChoice];
      aiHand.textContent = EMOJIS[aiChoice];

      determineWinner(playerChoice, aiChoice);
    }, 1500);
  };

  const determineWinner = (player, ai) => {
    const statusDiv = document.querySelector('.game-status');
    
    if (player === ai) {
      statusDiv.innerHTML = `<span style="color: #f6b93b;">It's a Tie!</span> Streak saved.`;
      AudioManager.playTone(300, 'sine', 0.2, 0.1);
    } 
    else if (
      (player === 'rock' && ai === 'scissors') ||
      (player === 'paper' && ai === 'rock') ||
      (player === 'scissors' && ai === 'paper')
    ) {
      // Win
      streak++;
      statusDiv.innerHTML = `<span style="color: #2ed573;">You Win!</span> ${player} beats ${ai}.`;
      AudioManager.playSuccess();
      checkNewBest();
    } 
    else {
      // Lose
      streak = 0;
      statusDiv.innerHTML = `<span style="color: #ff4757;">You Lose!</span> ${ai} beats ${player}.`;
      AudioManager.playError();
      document.body.style.backgroundColor = "#ff4757";
      setTimeout(() => {
        document.body.style.backgroundColor = "";
      }, 200);
    }

    document.getElementById('rps-streak').textContent = streak;

    // Enable buttons
    setTimeout(() => {
      document.querySelectorAll('.rps-btn').forEach(b => b.disabled = false);
      isAnimating = false;
    }, 1000);
  };

  const checkNewBest = () => {
    const isNewBest = StorageManager.saveHighScore(StorageManager.STORAGE_KEYS.RPS_STREAK, streak, 'Rock Paper Scissors');
    const bestStreak = StorageManager.getHighScore(StorageManager.STORAGE_KEYS.RPS_STREAK);
    document.getElementById('rps-best').textContent = bestStreak;

    if (isNewBest && streak > 0) {
      setTimeout(AudioManager.playGameWin, 500);
    }
  };

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', RPSGame.init);
} else {
  RPSGame.init();
}
