import { Ant } from './ai/ant.js';
import { PredatorBeetle } from './ai/predator.js';
import { Spider } from './ai/spider.js';
import { BioFood } from './ai/food.js';
import { AllyBeetle } from './ai/ally.js';
import { Cicada, Mayfly } from './ai/neutral.js';
import { terrainHeight } from '../world/terrain.js';

let entities = [];
let foods = [];
let allies = [];
let neutrals = [];
let nests = [];

export function initSpawner(scene) {
  entities = []; foods = []; allies = []; neutrals = []; nests = [];

  // Ant nests
  for(let i=0;i<4;i++) {
    const nx = (Math.random()-0.5)*60;
    const nz = (Math.random()-0.5)*60;
    nests.push({x:nx, z:nz});
    for(let j=0;j<5;j++) {
      const ax = nx + (Math.random()-0.5)*6;
      const az = nz + (Math.random()-0.5)*6;
      entities.push(new Ant(scene, ax, az, nx, nz));
    }
  }

  // Predators
  for(let i=0;i<3;i++) {
    const px = (Math.random()-0.5)*80;
    const pz = (Math.random()-0.5)*80;
    entities.push(new PredatorBeetle(scene, px, pz));
  }

  // Spiders
  for(let i=0;i<3;i++) {
    const sx = (Math.random()-0.5)*70;
    const sz = (Math.random()-0.5)*70;
    entities.push(new Spider(scene, sx, sz));
  }

  // Allies
  for(let i=0;i<2;i++) {
    const ax = (Math.random()-0.5)*20;
    const az = (Math.random()-0.5)*20;
    allies.push(new AllyBeetle(scene, ax, az));
  }

  // Neutrals
  for(let i=0;i<5;i++) {
    const cx = (Math.random()-0.5)*60;
    const cz = (Math.random()-0.5)*60;
    neutrals.push(new Cicada(scene, cx, cz));
  }
  for(let i=0;i<8;i++) {
    const mx = (Math.random()-0.5)*50;
    const mz = (Math.random()-0.5)*50;
    neutrals.push(new Mayfly(scene, mx, mz));
  }

  spawnFood(scene, 15);
}

function spawnFood(scene, count) {
  for(let i=0;i<count;i++) {
    const x = (Math.random()-0.5)*100;
    const z = (Math.random()-0.5)*100;
    foods.push(new BioFood(scene, x, z));
  }
}

export function updateSpawner(dt, playerPos, timeInfo, scene) {
  // Hostile entities
  for(let i=entities.length-1;i>=0;i--) {
    const ent = entities[i];
    if(!ent.alive) { entities.splice(i,1); continue; }
    const result = ent.update(dt, playerPos, timeInfo);
    if(result && result.action === 'attack') {
      return result;
    }
    if(result && result.action === 'web_attack') {
      return result;
    }
  }

  // Food
  for(let i=foods.length-1;i>=0;i--) {
    const f = foods[i];
    if(!f.alive) { foods.splice(i,1); continue; }
    f.update(dt);
    if(playerPos && f.group.position.distanceTo(playerPos) < 1.5) {
      return { action:'food', amount:f.collect() };
    }
  }

  // Allies
  allies.forEach(a => a.update(dt, playerPos, entities));

  // Neutrals
  neutrals.forEach(n => n.update(dt));

  // Respawn food
  if(foods.length < 8) spawnFood(scene, 3);

  // Respawn predators
  const preds = entities.filter(e => e.type === 'beetle_predator');
  if(preds.length < 2 && Math.random() < 0.02*dt) {
    const px = playerPos.x + (Math.random()-0.5)*40;
    const pz = playerPos.z + (Math.random()-0.5)*40;
    entities.push(new PredatorBeetle(scene, px, pz));
  }

  // Respawn mayflies occasionally
  if(neutrals.filter(n => n instanceof Mayfly && n.alive).length < 4 && Math.random() < 0.1*dt) {
    const mx = playerPos.x + (Math.random()-0.5)*30;
    const mz = playerPos.z + (Math.random()-0.5)*30;
    neutrals.push(new Mayfly(scene, mx, mz));
  }

  return null;
}

export function getEntities() { return entities; }
export function getFoods() { return foods; }
export function getAllies() { return allies; }
export function getNeutrals() { return neutrals; }
