export const STATS = {
  hp: 100, maxHp: 100,
  hunger: 100, maxHunger: 100,
  temp: 20,
  alive: true,
};

let lastHungerTick = 0;

export function initSurvival(charType) {
  STATS.hp = 100;
  STATS.hunger = 100;
  STATS.temp = 20;
  STATS.alive = true;
  if(charType === 'beetle') { STATS.maxHp = 120; STATS.hp = 120; }
  if(charType === 'ladybug') { STATS.maxHp = 80; STATS.hp = 80; }
  if(charType === 'grasshopper') { STATS.maxHp = 90; STATS.hp = 90; }
}

export function updateSurvival(dt, timeInfo) {
  if(!STATS.alive) return;

  // Hunger drain
  lastHungerTick += dt;
  if(lastHungerTick > 3) {
    lastHungerTick = 0;
    STATS.hunger -= 1.5;
    if(STATS.hunger <= 0) {
      STATS.hunger = 0;
      STATS.hp -= 2;
    }
  }

  // Temperature based on season/time
  const baseTemp = { spring:18, summer:28, autumn:12, winter:-5 }[timeInfo.season] || 15;
  const nightDrop = timeInfo.nightness * 8;
  STATS.temp = baseTemp - nightDrop + (Math.random()-0.5)*0.5;

  // Cold damage in winter night
  if(STATS.temp < -5) STATS.hp -= 0.3 * dt;

  if(STATS.hp <= 0) {
    STATS.hp = 0;
    STATS.alive = false;
  }
}

export function heal(amount) { STATS.hp = Math.min(STATS.hp + amount, STATS.maxHp); }
export function feed(amount) { STATS.hunger = Math.min(STATS.hunger + amount, STATS.maxHunger); }
export function damage(amount) { STATS.hp -= amount; if(STATS.hp <= 0) { STATS.hp=0; STATS.alive=false; } }
