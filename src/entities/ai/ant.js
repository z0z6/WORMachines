import * as THREE from 'three';
import { Entity } from './base.js';

export class Ant extends Entity {
  constructor(scene, x, z, nestX, nestZ) {
    super(scene, x, z, 'ant');
    this.nestX = nestX; this.nestZ = nestZ;
    this.guardRadius = 8;
    this.speed = 3.5;
    this.aggroRange = 5;
    this.damage = 8;
    this.attackCooldown = 0;

    // Visual
    const mat = new THREE.MeshStandardMaterial({ color:0x3a2a1a, roughness:0.8 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.15,6,6), mat);
    body.scale.set(0.8,0.6,1.2);
    body.castShadow = true;
    this.group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12,6,6), mat);
    head.position.z = 0.18;
    this.group.add(head);

    // Mandibles
    for(let s of [-1,1]) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.03,0.12,4), new THREE.MeshStandardMaterial({color:0x5a4a3a}));
      m.position.set(s*0.06, 0, 0.28);
      m.rotation.x = Math.PI/2;
      m.rotation.z = s*0.5;
      this.group.add(m);
    }

    // Antennae
    for(let s of [-1,1]) {
      const a = new THREE.Mesh(new THREE.CylinderGeometry(0.005,0.005,0.2,4), mat);
      a.position.set(s*0.08, 0.08, 0.15);
      a.rotation.z = s*0.6;
      this.group.add(a);
    }
  }

  update(dt, playerPos, timeInfo) {
    super.update(dt, playerPos, timeInfo);
    if(!this.alive) return;

    const dist = this.distanceToPlayer(playerPos);
    const distFromNest = Math.hypot(this.group.position.x - this.nestX, this.group.position.z - this.nestZ);

    // State machine
    if(dist < this.aggroRange && distFromNest < this.guardRadius * 1.5) {
      this.state = 'attack';
    } else if(distFromNest > this.guardRadius) {
      this.state = 'return';
    } else if(this.stateTimer <= 0) {
      this.state = Math.random() > 0.3 ? 'patrol' : 'idle';
      this.stateTimer = 2 + Math.random()*3;
      if(this.state === 'patrol') {
        const angle = Math.random()*Math.PI*2;
        this.targetX = this.nestX + Math.cos(angle)*(Math.random()*this.guardRadius);
        this.targetZ = this.nestZ + Math.sin(angle)*(Math.random()*this.guardRadius);
      }
    }

    if(this.state === 'attack') {
      const dir = new THREE.Vector3().subVectors(playerPos, this.group.position).normalize();
      this.group.position.addScaledVector(dir, this.speed * 1.8 * dt);
      this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
      this.attackCooldown -= dt;
      if(dist < 1.2 && this.attackCooldown <= 0) {
        this.attackCooldown = 1.5;
        return { action:'attack', damage:this.damage };
      }
    }
    else if(this.state === 'return') {
      const dir = new THREE.Vector3(this.nestX - this.group.position.x, 0, this.nestZ - this.group.position.z).normalize();
      this.group.position.addScaledVector(dir, this.speed * dt);
      this.group.lookAt(this.nestX, this.group.position.y, this.nestZ);
    }
    else if(this.state === 'patrol' && this.targetX !== undefined) {
      const dir = new THREE.Vector3(this.targetX - this.group.position.x, 0, this.targetZ - this.group.position.z);
      if(dir.length() < 0.5) { this.state = 'idle'; this.stateTimer = 1; }
      else {
        dir.normalize();
        this.group.position.addScaledVector(dir, this.speed * dt);
        this.group.lookAt(this.targetX, this.group.position.y, this.targetZ);
      }
    }

    // Bob animation
    this.group.position.y += Math.sin(Date.now()*0.02)*0.005;
    return null;
  }
}
