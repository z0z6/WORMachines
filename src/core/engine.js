import * as THREE from 'three';

export let scene, camera, renderer, clock;

export function initEngine() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87b5c9);
  scene.fog = new THREE.FogExp2(0x87b5c9, 0.025);

  camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 200);
  camera.position.set(0, 5, 10);

  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  // Lights
  const ambient = new THREE.AmbientLight(0x607080, 0.5);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x3a5a2a, 0.6);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff5e1, 1.4);
  sun.position.set(40, 60, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  const d = 60;
  sun.shadow.camera.left = -d; sun.shadow.camera.right = d;
  sun.shadow.camera.top = d; sun.shadow.camera.bottom = -d;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 200;
  scene.add(sun);

  // Pollen particles
  const pollenGeo = new THREE.BufferGeometry();
  const pollenCount = 800;
  const pos = new Float32Array(pollenCount*3);
  for(let i=0;i<pollenCount*3;i++) pos[i] = (Math.random()-0.5)*80;
  pollenGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const pollenMat = new THREE.PointsMaterial({
    color:0xfffee0, size:0.08, transparent:true, opacity:0.6, sizeAttenuation:true
  });
  const pollen = new THREE.Points(pollenGeo, pollenMat);
  scene.add(pollen);

  // Animate pollen in main loop via userData
  pollen.userData = { speeds: Array(pollenCount).fill(0).map(()=>0.02+Math.random()*0.04) };
  scene.userData.pollen = pollen;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, clock };
}

export function updatePollen() {
  const pollen = scene.userData.pollen;
  if(!pollen) return;
  const pos = pollen.geometry.attributes.position.array;
  const speeds = pollen.userData.speeds;
  for(let i=0;i<speeds.length;i++) {
    pos[i*3+1] -= speeds[i]*0.3; // fall down
    pos[i*3] += Math.sin(Date.now()*0.001+i)*0.002; // drift
    if(pos[i*3+1] < -2) pos[i*3+1] = 20; // reset
  }
  pollen.geometry.attributes.position.needsUpdate = true;
}
