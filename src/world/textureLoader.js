import * as THREE from 'three';

const loader = new THREE.TextureLoader();

function loadTexture(path, colorSpace = THREE.LinearSRGBColorSpace) {
  const tex = loader.load(path);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = colorSpace;
  tex.anisotropy = 16;
  return tex;
}

function createBiomeMaterial(folder, prefix) {
  const base = `textures/${folder}/${prefix}_2K-JPG`;
  return new THREE.MeshStandardMaterial({
    map:               loadTexture(`${base}_Color.jpg`, THREE.SRGBColorSpace),
    normalMap:         loadTexture(`${base}_NormalGL.jpg`),
    roughnessMap:      loadTexture(`${base}_Roughness.jpg`),
    aoMap:             loadTexture(`${base}_AmbientOcclusion.jpg`),

    // Displacement CAŁKOWICIE USUNIĘTY — przy chunkowanym terenie
    // powoduje nieodwracalne szczeliny na granicach chunków.
    // Normal mapa daje wystarczający efekt głębi bez deformowania geometrii.
    roughness: 1.0,
    metalness: 0.0,
  });
}

export const biomeMaterials = {
  garden: createBiomeMaterial('grass',   'Grass001'),
  forest: createBiomeMaterial('forest',  'Ground037'),
  gravel: createBiomeMaterial('gravel',  'Gravel023'),
};
