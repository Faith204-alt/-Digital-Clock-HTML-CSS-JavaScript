/* Digital Clock
   - 12/24 toggle
   - Show/hide seconds
   - Start / Stop
   - Leading zero option
   - Accessible status updates
*/

(() => {
  const $ = id => document.getElementById(id);

  // UI nodes
  const hoursEl = $('hours');
  const minutesEl = $('minutes');
  const secondsEl = $('seconds');
  const secWrapper = $('sec-wrapper');
  const ampmEl = $('ampm');
  const statusEl = $('status');
  const tzNameEl = $('tz-name');

  const toggle12Btn = $('toggle-12-24');
  const toggleSecBtn = $('toggle-seconds');
  const startStopBtn = $('start-stop');
  const leadingZeroCheckbox = $('leading-zero');

  // State
  let is12Hour = false;
  let showSeconds = true;
  let running = true;
  let timerId = null;

  // helper: pad number if needed
  function pad(num, enableLeadingZero) {
    return enableLeadingZero ? String(num).padStart(2,'0') : String(num);
  }

  // Render one tick
  function tick() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // manage 12/24 hour display
    let ampm = '';
    if (is12Hour) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12; // 12 AM/PM
      ampmEl.textContent = ampm;
      ampmEl.style.display = 'inline';
    } else {
      ampmEl.textContent = '';
      ampmEl.style.display = 'none';
    }

    const showLeadingZero = leadingZeroCheckbox.checked;

    hoursEl.textContent = pad(hours, showLeadingZero);
    minutesEl.textContent = pad(minutes, showLeadingZero);
    secondsEl.textContent = pad(seconds, showLeadingZero);

    // hide/show seconds span
    secWrapper.style.display = showSeconds ? 'inline' : 'none';
  }

  // Start & stop the clock
  function startClock() {
    if (timerId) clearInterval(timerId);
    tick(); // immediate render
    timerId = setInterval(tick, 1000);
    running = true;
    startStopBtn.textContent = 'Stop';
    announceStatus('Clock running');
  }

  function stopClock() {
    if (timerId) clearInterval(timerId);
    timerId = null;
    running = false;
    startStopBtn.textContent = 'Start';
    announceStatus('Clock stopped');
  }

  // small helper to announce to screen readers and status area
  function announceStatus(msg) {
    statusEl.textContent = msg;
    // Keep the message for a short time for visual users too
    clearTimeout(statusEl._timeout);
    statusEl._timeout = setTimeout(() => { if (running) statusEl.textContent = ''; }, 3000);
  }

  // toggle handlers
  toggle12Btn.addEventListener('click', () => {
    is12Hour = !is12Hour;
    toggle12Btn.textContent = is12Hour ? 'Switch to 24-hour' : 'Switch to 12-hour';
    tick();
    announceStatus(is12Hour ? '12-hour mode' : '24-hour mode');
  });

  toggleSecBtn.addEventListener('click', () => {
    showSeconds = !showSeconds;
    toggleSecBtn.textContent = showSeconds ? 'Hide seconds' : 'Show seconds';
    tick();
    announceStatus(showSeconds ? 'Showing seconds' : 'Hiding seconds');
  });

  startStopBtn.addEventListener('click', () => {
    if (running) stopClock(); else startClock();
  });

  leadingZeroCheckbox.addEventListener('change', () => {
    tick();
    announceStatus(leadingZeroCheckbox.checked ? 'Leading zero enabled' : 'Leading zero disabled');
  });

  // display timezone information
  try {
    tzNameEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch (e) {
    tzNameEl.textContent = '';
  }

  // Initialize
  tick();
  startClock();

  // Expose for debugging (optional)
  window.__digitalClock = { startClock, stopClock, tick };
})();
