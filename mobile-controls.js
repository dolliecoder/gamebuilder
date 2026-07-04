/* ========================================
   APEXPLAY - Mobile Controls
   Injects an on-screen D-Pad for mobile devices
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Only inject if it's a game page (not index or dashboard)
  if (window.location.pathname.includes('index.html') || window.location.pathname.includes('dashboard.html') || window.location.pathname === '/') {
    return;
  }

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.className = 'mobile-controls-wrapper';
  
  overlay.innerHTML = `
    <div class="dpad">
      <button class="dpad-btn up" data-key="ArrowUp">▲</button>
      <button class="dpad-btn left" data-key="ArrowLeft">◀</button>
      <button class="dpad-btn right" data-key="ArrowRight">▶</button>
      <button class="dpad-btn down" data-key="ArrowDown">▼</button>
    </div>
    <div class="action-buttons">
      <button class="action-btn" data-key="Space">ACTION</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Helper to dispatch keyboard events
  const dispatchKey = (key, type) => {
    // Some games use " " for space
    const keyVal = key === 'Space' ? ' ' : key;
    const event = new KeyboardEvent(type, {
      key: keyVal,
      code: key,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  };

  // Bind touch and mouse events
  const buttons = overlay.querySelectorAll('button');
  buttons.forEach(btn => {
    const key = btn.getAttribute('data-key');
    
    const handlePress = (e) => {
      e.preventDefault(); // prevent zoom/scroll
      btn.style.opacity = '0.5';
      btn.style.transform = 'scale(0.9)';
      dispatchKey(key, 'keydown');
    };
    
    const handleRelease = (e) => {
      e.preventDefault();
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1)';
      dispatchKey(key, 'keyup');
    };

    btn.addEventListener('touchstart', handlePress, {passive: false});
    btn.addEventListener('touchend', handleRelease, {passive: false});
    btn.addEventListener('mousedown', handlePress);
    btn.addEventListener('mouseup', handleRelease);
    btn.addEventListener('mouseleave', handleRelease);
  });
});
