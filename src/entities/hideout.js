import * as THREE from 'three';
import { terrainHeight } from '../world/terrain.js';

export let hideouts = [];

export function spawnHideouts(scene, count=6) {
  hideouts = [];
  for(let i=0;i<count;i++) {
    const x = (Math.random()-0.5)*80;
    const z = (Math.random()-0.5)*80;
    const y = terrainHeight(x,z);

    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Rock / hollow log cover
    const rockMat = new THREE.MeshStandardMaterial({ color:0x5a5a4a, flatShading:true, roughness:0.95 });
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0), rockMat);
    rock.scale.set(1.2, 0.6, 1);
    rock.position.y = 0.2;
    rock.castShadow = true;
    group.add(rock);

    // Dark entrance indicator
    const entrance = new THREE.Mesh(
      new THREE.CircleGeometry(0.4, 8),
      new THREE.MeshBasicMaterial({ color:0x0a0a0a })
    );
    entrance.rotation.x = -Math.PI/2;
    entrance.position.y = 0.05;
    group.add(entrance);

    // Glow marker (subtle)
    const marker = new THREE.PointLight(0x88aaff, 0.3, 3);
    marker.position.y = 0.5;
    group.add(marker);

    scene.add(group);
    hideouts.push({ group, x, z, radius: 2.5, active: true });
  }
}

export function getNearestHideout(px, pz) {
  let nearest = null; let dmin = 999;
  hideouts.forEach(h => {
    const d = Math.hypot(h.x-px, h.z-pz);
    if(d < dmin && d < h.radius + 2) { dmin = d; nearest = h; }
  });
  return nearest;
}

export function isInsideHideout(px, pz) {
  return hideouts.some(h => Math.hypot(h.x-px, h.z-pz) < h.radius);
}
