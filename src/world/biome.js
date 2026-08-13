// Biome definitions with colors, vegetation densities, enemy types
export const BIOMES = {
  garden: {
    name: 'Ogród',
    baseColor: 0x4a8a3a,
    accentColor: 0x6bb852,
    roughness: 0.9,
    grassDensity: 1.2,
    bushDensity: 0.4,
    mossDensity: 0.2,
    enemies: ['ant', 'spider'],
    foodRate: 0.8,
    description: 'Żyzne podłoże ogrodowe pełne życia'
  },
  forest: {
    name: 'Las mieszany',
    baseColor: 0x3d5c2d,
    accentColor: 0x5a7a42,
    roughness: 0.95,
    grassDensity: 0.7,
    bushDensity: 0.6,
    mossDensity: 0.9,
    enemies: ['ant', 'beetle_predator'],
    foodRate: 0.6,
    description: 'Wilgotne podłoże lasu z mchem i grzybami'
  },
  gravel: {
    name: 'Żwirownia',
    baseColor: 0x8a8a7a,
    accentColor: 0xa0a090,
    roughness: 1.0,
    grassDensity: 0.1,
    bushDensity: 0.05,
    mossDensity: 0.1,
    enemies: ['beetle_predator'],
    foodRate: 0.3,
    description: 'Opuszczone, kamieniste podłoże'
  }
};

// Simple pseudo-random based on coords
export function biomeAt(cx, cz) {
  const n = Math.sin(cx * 12.9898 + cz * 78.233) * 43758.5453;
  const v = (n - Math.floor(n));
  if(v < 0.33) return 'garden';
  if(v < 0.66) return 'forest';
  return 'gravel';
}
