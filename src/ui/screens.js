import { playerType } from '../entities/player.js';
import { STATS } from '../systems/survival.js';
import { TIME, seasonName, isNight } from '../systems/time.js';

export function initUI() {
  document.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.char;
      window.dispatchEvent(new CustomEvent('select-char', {detail:type}));
      document.getElementById('char-select').classList.add('hidden');
      document.getElementById('hud').classList.remove('hidden');
    });
  });

  document.getElementById('go-restart').addEventListener('click', () => {
    location.reload();
  });
}

export function updateHUD(timeInfo, inShelter = false, webSlow = 0) {
  const hpPct = (STATS.hp / STATS.maxHp) * 100;
  const hungerPct = (STATS.hunger / STATS.maxHunger) * 100;
  document.getElementById('hp-bar').style.width = hpPct + '%';
  document.getElementById('hunger-bar').style.width = hungerPct + '%';
  document.getElementById('temp-val').textContent = Math.round(STATS.temp) + '°C';

  const s = seasonName(timeInfo.season);
  document.getElementById('season-badge').textContent = s;
  document.getElementById('time-badge').textContent = isNight(timeInfo.nightness) ? '🌙 Noc' : '☀️ Dzień';

  // Color alerts
  document.getElementById('hp-bar').style.background = hpPct < 30 ? '#e74c3c' : (hpPct < 60 ? '#e67e22' : 'linear-gradient(90deg,#e74c3c,#c0392b)');
  document.getElementById('hunger-bar').style.background = hungerPct < 25 ? '#e74c3c' : 'linear-gradient(90deg,#7dd87d,#27ae60)';

  // Status indicators
  let statusHTML = '';
  if(inShelter) statusHTML += '<span class="status-tag safe">🏠 W kryjówce</span>';
  if(webSlow > 0) statusHTML += '<span class="status-tag danger">🕸️ Pajęczyna!</span>';
  const statusEl = document.getElementById('status-area');
  if(statusEl) statusEl.innerHTML = statusHTML;
}

export function showMessage(text, duration=3000) {
  const el = document.getElementById('msg-area');
  el.textContent = text;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, duration);
}

export function showGameOver(reason) {
  document.getElementById('game-over').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('go-reason').textContent = reason;
}
