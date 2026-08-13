import * as THREE from 'three';
import { BIOMES, biomeAt } from './biome.js';
import { terrainHeight } from './terrain.js';

// Procedurally create grass blade geometry
function createGrassGeo() {
  const geo = new THREE.PlaneGeometry(0.15, 0.8, 1, 4);
  const pos = geo.attributes.position;
  for(let i=0;i<pos.count;i++) {
    const y = pos.getY(i);
    const x = pos.getX(i);
    // Curve grass
    pos.setX(i, x + y*y*0.3);
  }
  geo.computeVertexNormals();
  return geo;
}

// Create bush geometry (low poly sphere cluster)
function createBushGeo() {
  const geo = new THREE.SphereGeometry(0.4, 6, 5);
  return geo;
}

// Create moss patch (flattened sphere)
function createMossGeo() {
  const geo = new THREE.SphereGeometry(0.5, 7, 5);
  geo.scale(1, 0.25, 1);
  return geo;
}

let grassGeo, bushGeo, mossGeo;

export function generateVegetation(cx, cz) {
  const b = BIOMES[biomeAt(cx, cz)];
  const size = 32;
  const offsetX = cx*size;
  const offsetZ = cz*size;
  const group = new THREE.Group();

  if(!grassGeo) grassGeo = createGrassGeo();
  if(!bushGeo) bushGeo = createBushGeo();
  if(!mossGeo) mossGeo = createMossGeo();

  // Grass instancing
  const grassCount = Math.floor(300 * b.grassDensity);
  if(grassCount > 0) {
    const grassMat = new THREE.MeshStandardMaterial({
      color: b.accentColor, side: THREE.DoubleSide,
      roughness:0.8, metalness:0.0
    });
    const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
    const dummy = new THREE.Object3D();
    for(let i=0;i<grassCount;i++) {
      const x = offsetX + (Math.random()-0.5)*size;
      const z = offsetZ + (Math.random()-0.5)*size;
      const y = terrainHeight(x, z);
      dummy.position.set(x, y+0.3, z);
      dummy.rotation.y = Math.random()*Math.PI;
      dummy.rotation.z = (Math.random()-0.5)*0.3;
      dummy.scale.setScalar(0.8+Math.random()*0.6);
      dummy.updateMatrix();
      grassMesh.setMatrixAt(i, dummy.matrix);
    }
    grassMesh.receiveShadow = true;
    grassMesh.castShadow = true;
    group.add(grassMesh);
  }

  // Bushes
  const bushCount = Math.floor(15 * b.bushDensity);
  if(bushCount > 0) {
    const bushMat = new THREE.MeshStandardMaterial({
      color: 0x2d5a1e, flatShading:true, roughness:0.9
    });
    const bushMesh = new THREE.InstancedMesh(bushGeo, bushMat, bushCount);
    const dummy = new THREE.Object3D();
    for(let i=0;i<bushCount;i++) {
      const x = offsetX + (Math.random()-0.5)*size;
      const z = offsetZ + (Math.random()-0.5)*size;
      const y = terrainHeight(x, z);
      dummy.position.set(x, y+0.3, z);
      dummy.scale.setScalar(1.5+Math.random()*2);
      dummy.updateMatrix();
      bushMesh.setMatrixAt(i, dummy.matrix);
    }
    bushMesh.castShadow = true; bushMesh.receiveShadow = true;
    group.add(bushMesh);
  }

  // Moss patches
  const mossCount = Math.floor(40 * b.mossDensity);
  if(mossCount > 0) {
    const mossMat = new THREE.MeshStandardMaterial({
      color: 0x4a7a3a, flatShading:true, roughness:1.0
    });
    const mossMesh = new THREE.InstancedMesh(mossGeo, mossMat, mossCount);
    const dummy = new THREE.Object3D();
    for(let i=0;i<mossCount;i++) {
      const x = offsetX + (Math.random()-0.5)*size;
      const z = offsetZ + (Math.random()-0.5)*size;
      const y = terrainHeight(x, z);
      dummy.position.set(x, y+0.05, z);
      dummy.scale.setScalar(1+Math.random()*2.5);
      dummy.rotation.y = Math.random()*Math.PI;
      dummy.updateMatrix();
      mossMesh.setMatrixAt(i, dummy.matrix);
    }
    mossMesh.receiveShadow = true;
    group.add(mossMesh);
  }

  return group;
}
