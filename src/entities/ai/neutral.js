import * as THREE from 'three';
import { terrainHeight } from '../../world/terrain.js';

// Cicada / Piewik - sits on vegetation, emits sound waves
export class Cicada {
  constructor(scene, x, z) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(x, terrainHeight(x,z)+0.5, z);
    this.alive = true;
    this.singTimer = Math.random()*3;

    const mat = new THREE.MeshStandardMaterial({ color:0x6a5a3a, roughness:0.7 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.2,8,8), mat);
    body.scale.set(1,0.8,1.4);
    this.group.add(body);

    // Wings (transparent)
    const wingMat = new THREE.MeshStandardMaterial({ color:0xccddaa, transparent:true, opacity:0.4, side:THREE.DoubleSide });
    for(let s of [-1,1]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.5), wingMat);
      w.position.set(s*0.2, 0.15, 0);
      w.rotation.y = s*0.6;
      this.group.add(w);
    }

    // Sound wave rings (visual only)
    this.rings = [];
    scene.add(this.group);
  }

  update(dt) {
    if(!this.alive) return;
    this.singTimer -= dt;
    if(this.singTimer <= 0) {
      this.singTimer = 2+Math.random()*4;
      this.emitRing();
    }
    // Animate rings
    this.rings.forEach((r,i) => {
      r.scale.addScalar(dt*2);
      r.material.opacity -= dt*0.5;
      if(r.material.opacity <= 0) {
        this.scene.remove(r);
        this.rings.splice(i,1);
      }
    });
  }

  emitRing() {
    const geo = new THREE.RingGeometry(0.1, 0.15, 16);
    const mat = new THREE.MeshBasicMaterial({ color:0xaaff88, transparent:true, opacity:0.6, side:THREE.DoubleSide });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.copy(this.group.position);
    ring.position.y += 0.3;
    ring.rotation.x = -Math.PI/2;
    this.scene.add(ring);
    this.rings.push(ring);
  }

  destroy() {
    this.alive = false;
    this.scene.remove(this.group);
    this.rings.forEach(r => this.scene.remove(r));
  }
}

// Mayfly / Pratchawiec - swarms near water/ground, short life
export class Mayfly {
  constructor(scene, x, z) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.home = new THREE.Vector3(x, terrainHeight(x,z)+0.8, z);
    this.group.position.copy(this.home);
    this.alive = true;
    this.life = 15 + Math.random()*20; // seconds
    this.phase = Math.random()*Math.PI*2;

    const mat = new THREE.MeshStandardMaterial({ color:0xeeeecc, transparent:true, opacity:0.8, roughness:0.3 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.04,0.15,4,4), mat);
    body.rotation.x = Math.PI/2;
    this.group.add(body);

    // Delicate wings
    const wMat = new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.3, side:THREE.DoubleSide });
    for(let s of [-1,1]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.15,0.08), wMat);
      w.position.set(s*0.08, 0.02, 0);
      this.group.add(w);
    }

    scene.add(this.group);
  }

  update(dt) {
    if(!this.alive) return;
    this.life -= dt;
    if(this.life <= 0) { this.destroy(); return; }

    this.phase += dt * 3;
    this.group.position.x = this.home.x + Math.sin(this.phase)*1.5;
    this.group.position.z = this.home.z + Math.cos(this.phase*0.7)*1.5;
    this.group.position.y = this.home.y + Math.sin(this.phase*2)*0.3;
    this.group.rotation.y = this.phase;
  }

  destroy() {
    this.alive = false;
    this.scene.remove(this.group);
  }
}
