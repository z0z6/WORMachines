import * as THREE from 'three';

const loader = new THREE.TextureLoader();

function loadTexture(path, colorSpace = THREE.LinearSRGBColorSpace) {
  const tex = loader.load(path);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = colorSpace;
  tex.anisotropy = 16; // ostra tekstura pod kątem
  return tex;
}

function createBiomeMaterial(folder, prefix) {
  const base = `textures/${folder}/${prefix}_2K-JPG`;
  return new THREE.MeshStandardMaterial({
    map:               loadTexture(`${base}_Color.jpg`, THREE.SRGBColorSpace),
    normalMap:         loadTexture(`${base}_NormalGL.jpg`),
    roughnessMap:      loadTexture(`${base}_Roughness.jpg`),
    displacementMap:   loadTexture(`${base}_Displacement.jpg`),
    aoMap:             loadTexture(`${base}_AmbientOcclusion.jpg`),
    
    displacementScale: 0.15,   // wysokość mikro-wypukłości (15 cm)
    displacementBias:  -0.05,
    roughness: 1.0,            // mapa roughness przejmuje kontrolę
    metalness: 0.0,
  });
}

export const biomeMaterials = {
  garden: createBiomeMaterial('grass',   'Grass001'),
  forest: createBiomeMaterial('forest',  'Ground037'),
  gravel: createBiomeMaterial('gravel',  'Gravel023'),
};
