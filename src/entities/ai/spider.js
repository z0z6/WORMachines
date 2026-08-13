import * as THREE from 'three';
import { Entity } from './base.js';
import { terrainHeight } from '../../world/terrain.js';

export class Spider extends Entity {
  constructor(scene, x, z) {
    super(scene, x, z, 'spider');
    this.speed = 5.5;
    this.damage = 12;
    this.attackCooldown = 0;
    this.webRadius = 7;
    this.state = 'idle'; // idle, hunt, return
    this.homeX = x; this.homeZ = z;

    // Body
    const mat = new THREE.MeshStandardMaterial({ color:0x2a1a0a, roughness:0.6, metalness:0.2 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.25,8,8), mat);
    body.scale.set(1,0.7,1.3);
    body.castShadow = true;
    this.group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15,6,6), mat);
    head.position.set(0,0.05,0.3);
    this.group.add(head);

    // Eyes (8!)
    for(let i=0;i<8;i++) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025,4,4), new THREE.MeshBasicMaterial({color:0xccff00}));
      const a = (i/8)*Math.PI*2;
      eye.position.set(Math.cos(a)*0.08, 0.1, 0.32+Math.sin(a)*0.04);
      this.group.add(eye);
    }

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color:0x1a0f05, roughness:0.8 });
    for(let i=0;i<8;i++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.008,0.5,4), legMat);
      const a = (i/8)*Math.PI*2;
      leg.position.set(Math.cos(a)*0.15, 0, Math.sin(a)*0.1);
      leg.rotation.z = Math.cos(a)*0.8;
      leg.rotation.x = Math.sin(a)*0.5;
      leg.userData = { baseRot: [leg.rotation.x, leg.rotation.z], idx:i };
      this.group.add(leg);
    }

    // Create web
    this.webLines = [];
    this.createWeb(scene);
  }

  createWeb(scene) {
    const r = this.webRadius;
    const segs = 8;
    const mat = new THREE.LineBasicMaterial({ color:0xccddff, transparent:true, opacity:0.25 });
    const centerY = terrainHeight(this.homeX, this.homeZ) + 0.3;

    // Radial lines
    for(let i=0;i<segs;i++) {
      const a = (i/segs)*Math.PI*2;
      const points = [];
      for(let d=0. d<=r; d+=0.8) {
        points.push(new THREE.Vector3(
          this.homeX + Math.cos(a)*d,
          centerY + Math.sin(d*2)*0.15,
          this.homeZ + Math.sin(a)*d
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      this.webLines.push(line);
    }
    // Spiral
    const spiralPts = [];
    for(let d=0.5; d<=r; d+=0.3) {
      const a = d*2.5;
      spiralPts.push(new THREE.Vector3(
        this.homeX + Math.cos(a)*d,
        centerY + Math.sin(d*2)*0.12,
        this.homeZ + Math.sin(a)*d
      ));
    }
    const spiralGeo = new THREE.BufferGeometry().setFromPoints(spiralPts);
    const spiral = new THREE.Line(spiralGeo, mat);
    scene.add(spiral);
    this.webLines.push(spiral);
  }

  destroy() {
    super.destroy();
    this.webLines.forEach(l => this.scene.remove(l));
  }

  update(dt, playerPos, timeInfo) {
    super.update(dt, playerPos, timeInfo);
    if(!this.alive) return;

    const dist = this.distanceToPlayer(playerPos);
    const distHome = Math.hypot(this.group.position.x-this.homeX, this.group.position.z-this.homeZ);

    // Check if player in web
    const inWeb = dist < this.webRadius && distHome < this.webRadius;

    if(inWeb && dist < 4) {
      this.state = 'hunt';
    } else if(distHome > this.webRadius + 2) {
      this.state = 'return';
    } else if(this.stateTimer <= 0) {
      this.state = Math.random()>0.4 ? 'patrol' : 'idle';
      this.stateTimer = 2+Math.random()*3;
      const a = Math.random()*Math.PI*2;
      this.targetX = this.homeX + Math.cos(a)*this.webRadius*0.7;
      this.targetZ = this.homeZ + Math.sin(a)*this.webRadius*0.7;
    }

    // Animate legs
    this.group.children.forEach(c => {
      if(c.userData && c.userData.idx !== undefined) {
        const wobble = Math.sin(Date.now()*0.01 + c.userData.idx)*0.15;
        c.rotation.x = c.userData.baseRot[0] + wobble;
      }
    });

    if(this.state === 'hunt') {
      const dir = new THREE.Vector3().subVectors(playerPos, this.group.position).normalize();
      this.group.position.addScaledVector(dir, this.speed*1.2*dt);
      this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
      this.attackCooldown -= dt;
      if(dist < 1.2 && this.attackCooldown <= 0) {
        this.attackCooldown = 1.2;
        return { action:'web_attack', damage:this.damage, slow:true };
      }
    }
    else if(this.state === 'return') {
      const dir = new THREE.Vector3(this.homeX-this.group.position.x, 0, this.homeZ-this.group.position.z).normalize();
      this.group.position.addScaledVector(dir, this.speed*dt);
      this.group.lookAt(this.homeX, this.group.position.y, this.homeZ);
    }
    else if(this.state === 'patrol' && this.targetX !== undefined) {
      const dir = new THREE.Vector3(this.targetX-this.group.position.x, 0, this.targetZ-this.group.position.z);
      if(dir.length()<0.5) { this.state='idle'; this.stateTimer=1; }
      else { dir.normalize(); this.group.position.addScaledVector(dir, this.speed*0.6*dt); this.group.lookAt(this.targetX, this.group.position.y, this.targetZ); }
    }

    return null;
  }
}
