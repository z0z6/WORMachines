import * as THREE from 'three';
import { terrainHeight } from '../world/terrain.js';

export class Shelter {
  constructor(scene, x, z, type='rock') {
    this.scene = scene;
    this.type = type;
    this.group = new THREE.Group();
    this.occupied = false;
    this.healRate = 3; // hp per sec
    this.hungerRate = 2; // hunger per sec
    this.safeRadius = 3;

    const y = terrainHeight(x, z);
    this.group.position.set(x, y, z);

    if(type === 'rock') {
      // Rock overhang
      const rockMat = new THREE.MeshStandardMaterial({ color:0x6a6a5a, flatShading:true, roughness:0.9 });
      const base = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2,0), rockMat);
      base.scale.set(1.4, 0.6, 1.1);
      base.position.y = 0.3;
      base.castShadow = true;
      base.receiveShadow = true;
      this.group.add(base);

      const overhang = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9,0), rockMat);
      overhang.scale.set(1.2, 0.4, 0.9);
      overhang.position.set(0, 0.7, 0.3);
      overhang.rotation.x = -0.3;
      this.group.add(overhang);

      // Entrance glow (safe indicator)
      this.glow = new THREE.PointLight(0x66ff88, 0.6, 4);
      this.glow.position.set(0, 0.3, 0.8);
      this.group.add(this.glow);
    }
    else if(type === 'hollow_log') {
      const woodMat = new THREE.MeshStandardMaterial({ color:0x5a4a2a, flatShading:true, roughness:0.95 });
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 7), woodMat);
      log.rotation.z = Math.PI/2;
      log.rotation.y = Math.random()*Math.PI;
      log.castShadow = true;
      this.group.add(log);

      // Hollow opening
      const opening = new THREE.Mesh(
        new THREE.CircleGeometry(0.35, 8),
        new THREE.MeshBasicMaterial({ color:0x1a150a })
      );
      opening.rotation.y = -log.rotation.y;
      opening.position.set(Math.cos(log.rotation.y)*0.98, 0, -Math.sin(log.rotation.y)*0.98);
      this.group.add(opening);

      this.glow = new THREE.PointLight(0x66ff88, 0.5, 3);
      this.glow.position.set(0, 0.2, 0);
      this.group.add(this.glow);
    }
    else if(type === 'burrow') {
      // Just a mound with hole
      const earthMat = new THREE.MeshStandardMaterial({ color:0x4a3a2a, flatShading:true });
      const mound = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 5), earthMat);
      mound.scale.set(1, 0.4, 1);
      mound.position.y = 0.1;
      this.group.add(mound);

      const hole = new THREE.Mesh(
        new THREE.CircleGeometry(0.25, 8),
        new THREE.MeshBasicMaterial({ color:0x0a0a0a })
      );
      hole.rotation.x = -Math.PI/2;
      hole.position.y = 0.25;
      this.group.add(hole);

      this.glow = new THREE.PointLight(0x66ff88, 0.4, 3);
      this.glow.position.y = 0.3;
      this.group.add(this.glow);
    }

    // Interaction zone indicator (invisible, for logic)
    this.entrancePos = new THREE.Vector3(x, y + 0.3, z + 0.5);

    scene.add(this.group);
  }

  isPlayerInside(playerPos) {
    return playerPos.distanceTo(this.group.position) < this.safeRadius;
  }

  update(dt, playerPos, isPlayerMoving) {
    const inside = this.isPlayerInside(playerPos);

    if(inside && !isPlayerMoving) {
      this.occupied = true;
      this.glow.intensity = 1.2;
      this.glow.color.setHex(0x44ff66);
      return {
        safe: true,
        heal: this.healRate * dt,
        hunger: this.hungerRate * dt,
        msg: 'Jesteś w kryjówce. Bezpiecznie! HP i głód się regenerują.'
      };
    } else {
      this.occupied = false;
      this.glow.intensity = 0.5;
      this.glow.color.setHex(0x66ff88);
      return { safe: false };
    }
  }

  destroy() {
    this.scene.remove(this.group);
  }
}

// Player can build small shelters from collected materials
export class PlayerShelter extends Shelter {
  constructor(scene, x, z) {
    super(scene, x, z, 'burrow');
    this.healRate = 1.5;
    this.hungerRate = 1;
    this.safeRadius = 2;
    this.glow.color.setHex(0x88ccff);
  }
}
