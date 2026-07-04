/* ========================================
   APEXPLAY - Audio Manager
   Synthesizes sound effects using Web Audio API
   ======================================== */

const AudioManager = (() => {
  let audioCtx = null;
  const isAudioEnabled = true;

  const init = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playTone = (freq, type, duration, vol) => {
    if (!isAudioEnabled) return;
    init();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };

  let bgmInterval = null;
  
  const playBGM = () => {
    if (!isAudioEnabled) return;
    init();
    stopBGM();
    
    const notes = [220, 261.63, 329.63, 392, 440, 523.25]; // A minor pentatonic
    let noteIndex = 0;
    
    bgmInterval = setInterval(() => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[noteIndex], audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime); // Very quiet
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
      
      noteIndex = (noteIndex + 1) % notes.length;
    }, 200); // 16th notes at 75 BPM
  };
  
  const stopBGM = () => {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  };

  return {
    init,
    playTone,
    playBGM,
    stopBGM,
    playClick: () => playTone(600, 'sine', 0.1, 0.1),
    playSuccess: () => {
      playTone(400, 'sine', 0.1, 0.1);
      setTimeout(() => playTone(600, 'sine', 0.2, 0.1), 100);
    },
    playError: () => playTone(150, 'sawtooth', 0.3, 0.1),
    playMove: () => playTone(300, 'sine', 0.05, 0.05),
    playPop: () => playTone(800, 'sine', 0.05, 0.1),
    playBeep: (freq = 440) => playTone(freq, 'square', 0.2, 0.1),
    playGameWin: () => {
      playTone(400, 'sine', 0.1, 0.1);
      setTimeout(() => playTone(500, 'sine', 0.1, 0.1), 100);
      setTimeout(() => playTone(600, 'sine', 0.2, 0.1), 200);
    },
    playGameOver: () => {
      playTone(300, 'sawtooth', 0.2, 0.1);
      setTimeout(() => playTone(250, 'sawtooth', 0.2, 0.1), 200);
      setTimeout(() => playTone(200, 'sawtooth', 0.4, 0.1), 400);
    }
  };
})();
