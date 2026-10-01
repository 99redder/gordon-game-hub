/* Camera feedback uses local synthesized audio, so it also works offline. */
(() => {
  let audioContext;
  let flashTimer;
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function shutterSound() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audioContext ||= new Audio();
      // Resume inside the original tap handler to unlock sound on iPad Safari.
      const ready = audioContext.resume();
      ready.then(() => {
        if (document.hidden) return;
        const ctx = audioContext;
        const time = ctx.currentTime;
        // Two short, filtered clicks: the shutter closing, then opening.
        for (const [delay, duration, volume] of [[0, .045, .22], [.075, .065, .15]]) {
          const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
          const samples = buffer.getChannelData(0);
          for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass'; filter.frequency.value = 1700; filter.Q.value = .7;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(volume, time + delay);
          gain.gain.exponentialRampToValueAtTime(.001, time + delay + duration);
          source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
          source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
          source.start(time + delay); source.stop(time + delay + duration);
        }
      }).catch(() => {});
    } catch { /* The visual feedback still works when audio is unavailable. */ }
  }

  function capture() {
    shutterSound();
    const frame = document.querySelector('.canvasWrap');
    frame.classList.remove('takingSnapshot');
    void frame.offsetWidth;
    frame.classList.add('takingSnapshot');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => frame.classList.remove('takingSnapshot'), 750);
  }

  async function saved(canvas) {
    const target = document.querySelector('#galleryLink');
    if (reducedMotion()) {
      target.classList.add('snapshotArrived');
      setTimeout(() => target.classList.remove('snapshotArrived'), 900);
      return;
    }
    const paper = document.createElement('div');
    paper.className = 'snapshotPrint';
    paper.setAttribute('aria-hidden', 'true');
    const preview = document.createElement('canvas');
    preview.width = 320; preview.height = 240;
    preview.getContext('2d').drawImage(canvas, 0, 0, 320, 240);
    const caption = document.createElement('span');
    caption.textContent = 'My masterpiece!';
    paper.append(preview, caption);
    document.body.append(paper);
    try {
      const from = paper.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const dx = to.left + to.width / 2 - from.left - from.width / 2;
      const dy = to.top + to.height / 2 - from.top - from.height / 2;
      const animation = paper.animate([
        { transform: 'rotate(-7deg) scale(.7)', opacity: 0, offset: 0 },
        { transform: 'rotate(-4deg) scale(1)', opacity: 1, offset: .22 },
        { transform: 'rotate(-4deg) scale(1)', opacity: 1, offset: .65 },
        { transform: `translate(${dx}px, ${dy}px) rotate(5deg) scale(.12)`, opacity: 0, offset: 1 },
      ], { duration: 1400, easing: 'ease-in-out', fill: 'forwards' });
      await animation.finished;
      target.classList.add('snapshotArrived');
      setTimeout(() => target.classList.remove('snapshotArrived'), 900);
    } catch { /* Navigation or animation cancellation must not affect the saved picture. */ }
    finally { paper.remove(); }
  }
  window.SnapshotFeedback = { capture, saved };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audioContext?.suspend().catch(() => {});
  });
})();
