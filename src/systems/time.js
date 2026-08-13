import { scene } from '../core/engine.js';
import * as THREE from 'three';

// Game time: 1 real second = 10 game minutes
// Full day = 144 real seconds (24h)
// Seasons: Spring(0-25%), Summer(25-50%), Autumn(50-75%), Winter(75-100%)

export const TIME = {
  dayDuration: 144, // seconds
  totalElapsed: 0,
  seasonProgress: 0, // 0..1 full year
};

let sunLight, ambientLight, hemiLight;

export function initTime(lights) {
  sunLight = lights.sun;
  ambientLight = lights.ambient;
  hemiLight = lights.hemi;
}

export function updateTime(dt) {
  TIME.totalElapsed += dt;
  TIME.seasonProgress = (TIME.totalElapsed / (TIME.dayDuration * 4 * 10)) % 1; // ~10 days per season for demo

  const dayT = (TIME.totalElapsed % TIME.dayDuration) / TIME.dayDuration;
  const season = getSeason(TIME.seasonProgress);

  // Sun orbit
  const angle = dayT * Math.PI * 2 - Math.PI/2;
  sunLight.position.set(Math.cos(angle)*60, Math.sin(angle)*50+10, 20);

  // Colors based on season + time
  let sky, fog, sunC, sunI, ambI;

  if(season === 'spring') {
    sky = new THREE.Color(0x87c4d6);
    fog = new THREE.Color(0x9ecfd8);
  } else if(season === 'summer') {
    sky = new THREE.Color(0x5aaad6);
    fog = new THREE.Color(0x7eb8d6);
  } else if(season === 'autumn') {
    sky = new THREE.Color(0xc4a06a);
    fog = new THREE.Color(0xd4b07a);
  } else {
    sky = new THREE.Color(0x8a9aaa);
    fog = new THREE.Color(0x9aaab8);
  }

  // Day/night blend
  const nightness = Math.max(0, Math.min(1, 1 - Math.sin(dayT*Math.PI)*1.8));
  if(nightness > 0.1) {
    const n = nightness;
    sky.lerp(new THREE.Color(0x0a1020), n*0.9);
    fog.lerp(new THREE.Color(0x1a2030), n*0.9);
    sunC = new THREE.Color(0xffaa66).lerp(new THREE.Color(0x4466aa), n);
    sunI = 1.3 * (1-n) + 0.1;
    ambI = 0.5 * (1-n) + 0.05;
  } else {
    sunC = new THREE.Color(0xfff5e1);
    sunI = 1.3;
    ambI = 0.5;
  }

  scene.background.copy(sky);
  scene.fog.color.copy(fog);
  sunLight.color.copy(sunC);
  sunLight.intensity = sunI;
  ambientLight.intensity = ambI;
  hemiLight.intensity = ambI + 0.1;

  return { dayT, season, nightness };
}

function getSeason(p) {
  if(p < 0.25) return 'spring';
  if(p < 0.50) return 'summer';
  if(p < 0.75) return 'autumn';
  return 'winter';
}

export function seasonName(s) {
  const map = { spring:'🌸 Wiosna', summer:'☀️ Lato', autumn:'🍂 Jesień', winter:'❄️ Zima' };
  return map[s] || s;
}

export function isNight(nightness) { return nightness > 0.5; }
