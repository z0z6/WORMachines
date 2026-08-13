import * as THREE from 'three';
import { terrainHeight } from '../../world/terrain.js';

export class BioFood {
  constructor(scene, x, z) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(x, terrainHeight(x,z)+0.15, z);
    this.alive = true;

    // Glowing organic blob
    const geo = new THREE.SphereGeometry(0.2, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color:0x88ff66, emissive:0x44aa22, emissiveIntensity:0.6,
      roughness:0.4, metalness:0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(1, 0.7, 1);
    mesh.castShadow = true;
    this.group.add(mesh);

    const light = new THREE.PointLight(0x88ff66, 0.8, 4);
    this.group.add(light);

    scene.add(this.group);
  }

  update(dt) {
    if(!this.alive) return;
    this.group.rotation.y += dt * 0.5;
    this.group.position.y += Math.sin(Date.now()*0.003)*0.002;
  }

  collect() {
    this.alive = false;
    this.scene.remove(this.group);
    return 25; // hunger restore
  }
}
