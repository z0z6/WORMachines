import * as THREE from 'three';
import { BIOMES, biomeAt } from './biome.js';
import { biomeMaterials } from './textureLoader.js';

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
  if(b.name === '\u017bwirownia') h *= 0.3;
  if(b.name === 'Las mieszany') h *= 1.4;
  return h * 2.5;
}

export function createChunkMesh(cx, cz) {
  const biomeKey = biomeAt(cx, cz);
  const size = 32;
  const seg = 24;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI/2);

  const pos = geo.attributes.position;
  const uvAttr = geo.attributes.uv;
  const uvScale = 0.025;

  for(let i = 0; i < pos.count; i++) {
    const wx = pos.getX(i) + cx * size;
    const wz = pos.getZ(i) + cz * size;
    const y = terrainHeight(wx, wz);
    pos.setY(i, y);
    uvAttr.setXY(i, wx * uvScale, wz * uvScale);
  }

  geo.computeVertexNormals();

  if (!geo.attributes.uv2) {
    geo.setAttribute('uv2', geo.attributes.uv.clone());
  }

  const mat = biomeMaterials[biomeKey] || biomeMaterials.garden;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.castShadow = true;

  // DIAGNOSTYKA: dodajemy nazwę żeby łatwo znaleźć w konsoli
  mesh.name = `chunk_${cx}_${cz}_${biomeKey}`;
  console.log('[Terrain] Chunk created:', mesh.name, 'material.map:', mat.map ? 'loaded' : 'null');

  return mesh;
}
