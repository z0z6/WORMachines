import * as THREE from 'three';

const loader = new THREE.TextureLoader();

function loadTexture(path, type) {
  console.log('[Texture] Loading:', path);
  const tex = loader.load(
    path,
    (t) => { console.log('[Texture] OK:', path, t.image.width + 'x' + t.image.height); },
    undefined,
    (err) => { console.error('[Texture] FAILED:', path, err); }
  );
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  // Kompatybilność wsteczna — nie używamy colorSpace które może nie istnieć w starszej wersji Three.js
  tex.anisotropy = 16;
  return tex;
}

function createBiomeMaterial(folder, prefix) {
  const base = `textures/${folder}/${prefix}_2K-JPG`;
  const mat = new THREE.MeshStandardMaterial({
    map:          loadTexture(`${base}_Color.jpg`),
    normalMap:    loadTexture(`${base}_NormalGL.jpg`),
    roughnessMap: loadTexture(`${base}_Roughness.jpg`),
    aoMap:        loadTexture(`${base}_AmbientOcclusion.jpg`),
    roughness: 1.0,
    metalness: 0.0,
  });
  console.log('[Material] Created for', folder, '- map:', mat.map ? 'yes' : 'no');
  return mat;
}

export const biomeMaterials = {
  garden: createBiomeMaterial('grass',   'Grass001'),
  forest: createBiomeMaterial('forest',  'Ground037'),
  gravel: createBiomeMaterial('gravel',  'Gravel023'),
};

// TEST: prosty materiał z samą teksturą koloru (MeshBasicMaterial)
// Użyjemy go jeśli MeshStandardMaterial będzie problematyczny
export function createDebugMaterial(folder, prefix) {
  const base = `textures/${folder}/${prefix}_2K-JPG`;
  return new THREE.MeshBasicMaterial({
    map: loadTexture(`${base}_Color.jpg`),
  });
}
