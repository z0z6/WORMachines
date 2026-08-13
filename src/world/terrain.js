import * as THREE from 'three';
import { BIOMES, biomeAt } from './biome.js';

// Simplex-ish noise function
function noise(x, z) {
  return Math.sin(x*0.15)*Math.cos(z*0.15)*0.5 +
         Math.sin(x*0.45 + z*0.35)*0.25 +
         Math.sin(x*0.08 - z*0.12)*0.35;
}

export function terrainHeight(x, z) {
  const cx = Math.floor(x / 32);
  const cz = Math.floor(z / 32);
  const b = BIOMES[biomeAt(cx, cz)];
  let h = noise(x, z);
  if(b.name === 'Żwirownia') h *= 0.3; // flatter
  if(b.name === 'Las mieszany') h *= 1.4; // more uneven
  return h * 2.5;
}

export function createChunkMesh(cx, cz) {
  const biomeKey = biomeAt(cx, cz);
  const b = BIOMES[biomeKey];
  const size = 32;
  const seg = 24;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI/2);

  const pos = geo.attributes.position;
  const cols = [];
  const baseC = new THREE.Color(b.baseColor);
  const accC = new THREE.Color(b.accentColor);

  for(let i=0;i<pos.count;i++) {
    const x = pos.getX(i) + cx*size;
    const z = pos.getZ(i) + cz*size;
    const y = terrainHeight(x, z);
    pos.setY(i, y);

    const t = THREE.MathUtils.clamp((y+2)/4, 0, 1);
    const c = new THREE.Color().lerpColors(baseC, accC, t);
    // Add subtle variation
    const varN = Math.sin(x*3.7+z*2.3)*0.08;
    c.r += varN; c.g += varN*0.5; c.b -= varN*0.3;
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors:true, flatShading:true,
    roughness:b.roughness, metalness:0.05
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(cx*size, 0, cz*size);
  mesh.receiveShadow = true;
  mesh.userData = { chunkX:cx, chunkZ:cz, biome:biomeKey };
  return mesh;
}
