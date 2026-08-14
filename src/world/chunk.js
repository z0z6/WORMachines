import * as THREE from 'three';
import { scene } from '../core/engine.js';
import { createChunkMesh } from './terrain.js';
import { generateVegetation } from './vegetation.js';

const activeChunks = new Map();
const CHUNK_DIST = 2; // load radius in chunks

export function getChunkKey(cx, cz) { return `${cx},${cz}`; }

export function updateChunks(px, pz) {
  const pcx = Math.floor(px / 32);
  const pcz = Math.floor(pz / 32);

  const needed = new Set();
  for(let x=-CHUNK_DIST; x<=CHUNK_DIST; x++) {
    for(let z=-CHUNK_DIST; z<=CHUNK_DIST; z++) {
      needed.add(getChunkKey(pcx+x, pcz+z));
    }
  }

  // Unload distant
  for(const [key, obj] of activeChunks) {
    if(!needed.has(key)) {
      scene.remove(obj.terrain);
      scene.remove(obj.veg);

      // Geometria terenu jest unikalna dla chunku — bezpiecznie ją zwolnić
      obj.terrain.geometry.dispose();
      // NIE zwalniamy obj.terrain.material — to współdzielony obiekt z biomeMaterials,
      // używany też przez inne, wciąż aktywne chunki tego samego biomu!

      // veg is a group with instanced meshes
      obj.veg.traverse(c => {
        if(c.isInstancedMesh) {
          // grassGeo/bushGeo/mossGeo to współdzielone singletony (vegetation.js) — nie zwalniamy geometrii
          c.material.dispose(); // materiał roślinności JEST unikalny na chunk — to bezpieczne
        }
      });
      activeChunks.delete(key);
    }
  }

  // Load new
  for(const key of needed) {
    if(activeChunks.has(key)) continue;
    const [cx, cz] = key.split(',').map(Number);
    const terrain = createChunkMesh(cx, cz);
    const veg = generateVegetation(cx, cz);
    scene.add(terrain);
    scene.add(veg);
    activeChunks.set(key, { terrain, veg });
  }
}

export function getActiveChunks() { return activeChunks; }
