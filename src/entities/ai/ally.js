import * as THREE from 'three';
import { terrainHeight } from '../../world/terrain.js';

export class AllyBeetle {
  constructor(scene, x, z) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(x, terrainHeight(x,z), z);
    this.alive = true;
    this.hp = 40;
    this.speed = 5;
    this.attackRange = 2;
    this.damage = 5;
    this.cooldown = 0;
    this.state = 'follow';

    // Small rove beetle look
    const mat = new THREE.MeshStandardMaterial({ color:0x3a3a4a, roughness:0.5, metalness:0.4 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.18,8,8), mat);
    body.scale.set(1,0.6,1.8);
    body.castShadow = true;
    this.group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1,6,6), mat);
    head.position.z = 0.22;
    this.group.add(head);

    // Short elytra
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.14,6,6), new THREE.MeshStandardMaterial({color:0x5a5a6a, metalness:0.5}));
    wing.scale.set(0.8,0.4,1);
    wing.position.set(0,0.08,-0.05);
    this.group.add(wing);

    // Glow antennae
    for(let s of [-1,1]) {
      const a = new THREE.Mesh(new THREE.CylinderGeometry(0.005,0.005,0.15,4), new THREE.MeshBasicMaterial({color:0x00ffaa}));
      a.position.set(s*0.08, 0.08, 0.2);
      a.rotation.z = s*0.5;
      this.group.add(a);
    }

    scene.add(this.group);
  }

  update(dt, playerPos, enemies) {
    if(!this.alive) return;
    this.cooldown -= dt;
    const dist = this.group.position.distanceTo(playerPos);

    // Find nearest enemy
    let nearest = null; let nearDist = 999;
    enemies.forEach(e => {
      if(!e.alive) return;
      const d = this.group.position.distanceTo(e.group.position);
      if(d < nearDist) { nearDist = d; nearest = e; }
    });

    if(nearest && nearDist < 6) {
      // Attack enemy
      const dir = new THREE.Vector3().subVectors(nearest.group.position, this.group.position).normalize();
      this.group.position.addScaledVector(dir, this.speed*dt);
      this.group.lookAt(nearest.group.position.x, this.group.position.y, nearest.group.position.z);
      if(nearDist < this.attackRange && this.cooldown <= 0) {
        this.cooldown = 1.5;
        nearest.hp -= this.damage;
        if(nearest.hp <= 0) nearest.destroy();
      }
    } else if(dist > 3) {
      // Follow player
      const dir = new THREE.Vector3().subVectors(playerPos, this.group.position).normalize();
      this.group.position.addScaledVector(dir, this.speed*0.8*dt);
      this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
    }

    this.group.position.y = terrainHeight(this.group.position.x, this.group.position.z) + 0.15;
  }

  destroy() {
    this.alive = false;
    this.scene.remove(this.group);
  }
}
