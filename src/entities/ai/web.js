import * as THREE from 'three';
import { terrainHeight } from '../../world/terrain.js';

export class SpiderWeb {
  constructor(scene, x1, z1, x2, z2) {
    this.scene = scene;
    this.alive = true;
    this.sticky = true;

    const y1 = terrainHeight(x1,z1) + 0.5 + Math.random()*1.5;
    const y2 = terrainHeight(x2,z2) + 0.5 + Math.random()*1.5;

    // Create web as a grid of thin lines
    this.group = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color:0xdddddd, transparent:true, opacity:0.35 });

    // Main strands
    const segments = 6;
    for(let i=0;i<=segments;i++) {
      const t = i/segments;
      const px = x1 + (x2-x1)*t;
      const py = y1 + (y2-y1)*t;
      const pz = z1 + (z2-z1)*t;
      // Vertical droop
      const droop = Math.sin(t*Math.PI) * 0.3;

      if(i < segments) {
        const t2 = (i+1)/segments;
        const px2 = x1 + (x2-x1)*t2;
        const py2 = y1 + (y2-y1)*t2 - Math.sin(t2*Math.PI)*0.3;
        const pz2 = z1 + (z2-z1)*t2;

        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(px, py - droop, pz),
          new THREE.Vector3(px2, py2, pz2)
        ]);
        this.group.add(new THREE.Line(geo, mat));
      }

      // Cross strands
      if(i > 0 && i < segments) {
        const perp = new THREE.Vector3(-(z2-z1), 0, x2-x1).normalize().multiplyScalar(0.6 * Math.sin(t*Math.PI));
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(px-perp.x, py-droop, pz-perp.z),
          new THREE.Vector3(px+perp.x, py-droop, pz+perp.z)
        ]);
        this.group.add(new THREE.Line(geo, mat));
      }
    }

    // Center point (where spider waits)
    this.center = new THREE.Vector3((x1+x2)/2, (y1+y2)/2 - 0.15, (z1+z2)/2);

    scene.add(this.group);
  }

  checkCollision(playerPos) {
    if(!this.alive || !this.sticky) return null;
    // Simple line-distance check to web center
    const dist = playerPos.distanceTo(this.center);
    if(dist < 1.8) {
      return { type:'web', center: this.center };
    }
    return null;
  }

  destroy() {
    this.alive = false;
    this.scene.remove(this.group);
  }
}
