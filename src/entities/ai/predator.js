import * as THREE from 'three';
import { Entity } from './base.js';

export class PredatorBeetle extends Entity {
  constructor(scene, x, z) {
    super(scene, x, z, 'beetle_predator');
    this.speed = 4.5;
    this.aggroRange = 12;
    this.damage = 15;
    this.attackCooldown = 0;
    this.nightAggroMult = 2.5;

    // Big scary beetle
    const mat = new THREE.MeshStandardMaterial({ color:0x1a0a0a, roughness:0.5, metalness:0.4 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5,10,10), mat);
    body.scale.set(1,0.7,1.4);
    body.castShadow = true;
    this.group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3,8,8), mat);
    head.position.set(0,0.1,0.5);
    this.group.add(head);

    // Red eyes
    for(let s of [-1,1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08,6,6), new THREE.MeshBasicMaterial({color:0xff0000}));
      eye.position.set(s*0.18, 0.15, 0.62);
      this.group.add(eye);
    }

    // Horns
    for(let s of [-1,1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.04,0.35,4), new THREE.MeshStandardMaterial({color:0x3a2a1a, metalness:0.6}));
      horn.position.set(s*0.2, 0.3, 0.55);
      horn.rotation.x = -0.4;
      horn.rotation.z = s*0.3;
      this.group.add(horn);
    }
  }

  update(dt, playerPos, timeInfo) {
    super.update(dt, playerPos, timeInfo);
    if(!this.alive) return;

    const isNight = timeInfo.nightness > 0.5;
    const aggro = this.aggroRange * (isNight ? this.nightAggroMult : 0.6);
    const dist = this.distanceToPlayer(playerPos);

    if(dist < aggro) {
      this.state = 'hunt';
    } else if(this.stateTimer <= 0) {
      this.state = 'wander';
      this.stateTimer = 3 + Math.random()*4;
      const a = Math.random()*Math.PI*2;
      this.targetX = this.group.position.x + Math.cos(a)*10;
      this.targetZ = this.group.position.z + Math.sin(a)*10;
    }

    if(this.state === 'hunt') {
      const dir = new THREE.Vector3().subVectors(playerPos, this.group.position).normalize();
      const spd = isNight ? this.speed * 1.3 : this.speed;
      this.group.position.addScaledVector(dir, spd * dt);
      this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
      this.attackCooldown -= dt;
      if(dist < 1.5 && this.attackCooldown <= 0) {
        this.attackCooldown = 2;
        return { action:'attack', damage:this.damage };
      }
    }
    else if(this.state === 'wander' && this.targetX !== undefined) {
      const dir = new THREE.Vector3(this.targetX - this.group.position.x, 0, this.targetZ - this.group.position.z);
      if(dir.length() < 0.5) { this.state = 'idle'; this.stateTimer = 1; }
      else {
        dir.normalize();
        this.group.position.addScaledVector(dir, this.speed * 0.5 * dt);
        this.group.lookAt(this.targetX, this.group.position.y, this.targetZ);
      }
    }

    return null;
  }
}
