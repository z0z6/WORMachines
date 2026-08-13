import * as THREE from 'three';
import { terrainHeight } from '../../world/terrain.js';

export class Entity {
  constructor(scene, x, z, type) {
    this.scene = scene;
    this.type = type;
    this.group = new THREE.Group();
    this.group.position.set(x, terrainHeight(x,z), z);
    this.velocity = new THREE.Vector3();
    this.state = 'idle';
    this.stateTimer = 0;
    this.hp = 30;
    this.alive = true;
    scene.add(this.group);
  }

  update(dt, playerPos, timeInfo) {
    this.stateTimer -= dt;
    this.group.position.y = terrainHeight(this.group.position.x, this.group.position.z) + 0.2;
  }

  distanceToPlayer(playerPos) {
    if(!playerPos) return 999;
    return this.group.position.distanceTo(playerPos);
  }

  destroy() {
    this.alive = false;
    this.scene.remove(this.group);
  }
}
