import * as THREE from 'three';
import { initEngine, updatePollen } from './core/engine.js';
import { initInput, keys } from './core/input.js';
import { createPlayer, updatePlayer, playerGroup, isHidden } from './entities/player.js';
import { initSpawner, updateSpawner } from './entities/spawner.js';
import { spawnHideouts, getNearestHideout } from './entities/hideout.js';
import { initSurvival, updateSurvival, STATS, damage, feed } from './systems/survival.js';
import { initTime, updateTime, TIME } from './systems/time.js';
import { updateChunks } from './world/chunk.js';
import { initUI, updateHUD, showMessage, showGameOver } from './ui/screens.js';

let scene, camera, renderer, clock;
let gameRunning = false;
let selectedChar = null;
let damageFlash = 0;
let slowTimer = 0;
let sunLight, ambientLight, hemiLight;
let nearestHideout = null;

function boot() {
  const eng = initEngine();
  scene = eng.scene;
  camera = eng.camera;
  renderer = eng.renderer;
  clock = eng.clock;

  scene.traverse(c => {
    if(c.isDirectionalLight) sunLight = c;
    if(c.isAmbientLight) ambientLight = c;
    if(c.isHemisphereLight) hemiLight = c;
  });

  initInput();
  initUI();

  window.addEventListener('select-char', (e) => {
    selectedChar = e.detail;
    document.getElementById('char-select').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    startGame();
  });
}

function startGame() {
  gameRunning = true;
  createPlayer(selectedChar, scene);
  initSurvival(selectedChar);
  initTime({ sun: sunLight, ambient: ambientLight, hemi: hemiLight });
  initSpawner(scene);
  spawnHideouts(scene, 6);
  updateChunks(0,0);
  showMessage('Przetrwaj do późnej jesieni! [E] — schowaj się w kryjówce. Unikaj mrówek i pająków!');
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  if(!gameRunning) return;

  const dt = Math.min(clock.getDelta(), 0.1);
  const playerPos = playerGroup ? playerGroup.position : new THREE.Vector3();

  const timeInfo = updateTime(dt);
  updateChunks(playerPos.x, playerPos.z);
  updatePollen();

  // Hideout proximity check
  nearestHideout = getNearestHideout(playerPos.x, playerPos.z);
  updatePlayer(dt, camera);

  // Apply slow from web
  if(slowTimer > 0) {
    slowTimer -= dt;
    // Slow is applied by reducing effective speed in player.js via a global or we can just show message
  }

  // Handle hideout key
  if(keys.e && nearestHideout && !isHidden) {
    keys.e = false; // consume
    // Teleport slightly into hideout
    playerGroup.position.x = nearestHideout.x;
    playerGroup.position.z = nearestHideout.z;
    showMessage('Schowałeś się! Jesteś bezpieczny.', 2000);
  }

  const result = updateSpawner(dt, playerPos, timeInfo, scene);
  if(result) {
    if(result.action === 'attack') {
      if(!isHidden) {
        damage(result.damage);
        damageFlash = 0.3;
        showMessage('Zaatakowany! -' + result.damage + ' HP', 1500);
      }
    }
    if(result.action === 'web_attack') {
      if(!isHidden) {
        damage(result.damage);
        slowTimer = 2;
        damageFlash = 0.3;
        showMessage('W sieci! -' + result.damage + ' HP, spowolnienie!', 2000);
      }
    }
    if(result.action === 'food') {
      feed(result.amount);
      showMessage('Biopapka zjedzona! +' + result.amount, 1500);
    }
  }

  updateSurvival(dt, timeInfo);

  if(damageFlash > 0) {
    damageFlash -= dt;
    renderer.domElement.style.filter = `sepia(0.5) hue-rotate(-50deg) saturate(1.5)`;
  } else {
    renderer.domElement.style.filter = 'none';
  }

  if(timeInfo.season === 'winter') {
    gameRunning = false;
    showGameOver('Nadeszła zima. Nie udało się przetrwać do końca jesieni...');
    return;
  }
  if(!STATS.alive) {
    gameRunning = false;
    const reason = STATS.hunger <= 0 ? 'Zginąłeś z głodu...' : 'Zostałeś zabity przez drapieżnika...';
    showGameOver(reason);
    return;
  }
  if(timeInfo.season === 'autumn' && TIME.seasonProgress > 0.7) {
    gameRunning = false;
    showGameOver('Gratulacje! Przetrwałeś do późnej jesieni!');
    document.getElementById('go-title').textContent = 'Zwycięstwo!';
    document.getElementById('go-title').style.color = '#7dd87d';
    return;
  }

  updateHUD(timeInfo, isHidden, nearestHideout);
  renderer.render(scene, camera);
}

boot();
