import * as THREE from 'three';
import { terrainHeight } from '../world/terrain.js';
import { isInsideHideout } from '../entities/hideout.js';
import { keys, mouse } from '../core/input.js';

export let playerGroup;
export let playerType = 'beetle';

const CFG = {
  beetle: { speed:6, jump:0.3, hpMult:1.2, color:0x4a6fa5, accent:0x2a4a7a },
  ladybug: { speed:9, jump:0.35, hpMult:0.8, color:0xc0392b, accent:0x5a1510 },
  grasshopper: { speed:7, jump:0.8, hpMult:0.9, color:0x7cb342, accent:0x2e4a18 },
};

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let isGrounded = true;
export let isHidden = false;
let camYaw = 0;
let camPitch = 0.4;

export function createPlayer(type, scene) {
  playerType = type;
  const cfg = CFG[type];
  playerGroup = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color:cfg.color, roughness:0.4, metalness:0.3 });
  const accMat = new THREE.MeshStandardMaterial({ color:cfg.accent, roughness:0.5, metalness:0.5 });
  const darkMat = new THREE.MeshStandardMaterial({ color:0x1a1a1a, roughness:0.7 });
  const glowMat = new THREE.MeshBasicMaterial({ color:0x88ddff });

  if(type === 'beetle' || type === 'ladybug') {
    // Body (oval)
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), bodyMat);
    body.scale.set(1, 0.7, 1.3);
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), bodyMat);
    head.position.set(0, 0.1, 0.35);
    head.castShadow = true;
    playerGroup.add(head);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const eyeL = new THREE.Mesh(eyeGeo, glowMat);
    eyeL.position.set(-0.12, 0.14, 0.42);
    playerGroup.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, glowMat);
    eyeR.position.set(0.12, 0.14, 0.42);
    playerGroup.add(eyeR);

    // Antennae
    for(let s of [-1,1]) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.4,4), darkMat);
      ant.position.set(s*0.12, 0.35, 0.32);
      ant.rotation.z = s*0.4;
      ant.rotation.x = -0.3;
      playerGroup.add(ant);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.03,4,4), new THREE.MeshBasicMaterial({color:0xff4466}));
      tip.position.set(s*0.22, 0.55, 0.38);
      playerGroup.add(tip);
    }

    // Legs (6)
    const legGeo = new THREE.CylinderGeometry(0.02,0.015,0.35,4);
    for(let i=0;i<3;i++) {
      for(let s of [-1,1]) {
        const leg = new THREE.Mesh(legGeo, darkMat);
        leg.position.set(s*0.25, -0.1, 0.15 - i*0.18);
        leg.rotation.z = s*0.8;
        leg.rotation.x = -0.3;
        leg.userData = { side:s, idx:i, baseRot:[leg.rotation.x,leg.rotation.z] };
        playerGroup.add(leg);
      }
    }

    // Wing covers (elytra) for beetle
    if(type === 'beetle') {
      const elytra = new THREE.Mesh(new THREE.SphereGeometry(0.32,8,8), accMat);
      elytra.scale.set(0.85,0.6,1.1);
      elytra.position.set(0,0.12,-0.05);
      elytra.castShadow = true;
      playerGroup.add(elytra);
    }
    // Spots for ladybug
    if(type === 'ladybug') {
      for(let i=0;i<4;i++) {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.06,6,6), new THREE.MeshBasicMaterial({color:0x111111}));
        const a = (i/4)*Math.PI*2;
        spot.position.set(Math.cos(a)*0.18, 0.22, Math.sin(a)*0.15 - 0.05);
        playerGroup.add(spot);
      }
    }
  }

  if(type === 'grasshopper') {
    // Long body
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.12,0.5,4,8), bodyMat);
    body.rotation.x = Math.PI/2;
    body.position.y = 0.15;
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15,8,8), bodyMat);
    head.position.set(0, 0.25, 0.4);
    playerGroup.add(head);

    // Big eyes
    const eyeGeo = new THREE.SphereGeometry(0.08,6,6);
    const eyeL = new THREE.Mesh(eyeGeo, glowMat);
    eyeL.position.set(-0.14, 0.3, 0.42);
    playerGroup.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, glowMat);
    eyeR.position.set(0.14, 0.3, 0.42);
    playerGroup.add(eyeR);

    // Powerful hind legs
    for(let s of [-1,1]) {
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.04,0.25,4,6), accMat);
      thigh.position.set(s*0.18, 0.1, -0.15);
      thigh.rotation.z = s*0.6;
      thigh.rotation.x = 0.4;
      playerGroup.add(thigh);
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.03,0.3,4,6), darkMat);
      shin.position.set(s*0.28, -0.05, -0.05);
      shin.rotation.z = s*0.2;
      playerGroup.add(shin);
    }
    // Front legs
    for(let s of [-1,1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.01,0.3,4), darkMat);
      leg.position.set(s*0.1, 0, 0.2);
      leg.rotation.z = s*0.3;
      playerGroup.add(leg);
    }
  }

  // Shadow blob
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.4,12),
    new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2})
  );
  blob.rotation.x = -Math.PI/2;
  blob.position.y = 0.02;
  playerGroup.add(blob);

  playerGroup.position.set(0, terrainHeight(0,0), 0);
  scene.add(playerGroup);

  // Store anim refs
  playerGroup.userData = { legs: [], cfg };
  playerGroup.traverse(c => {
    if(c.userData && c.userData.side !== undefined) playerGroup.userData.legs.push(c);
  });

  return playerGroup;
}

export function updatePlayer(dt, camera, slowMult = 1) {
  if(!playerGroup) return;
  const cfg = CFG[playerType];
  const p = playerGroup.position;

  // Mouse look (camera orbit) — camYaw jest teraz JEDYNYM źródłem kierunku kamery
  camYaw -= mouse.dx * 0.002;
  camPitch = Math.max(0.1, Math.min(1.2, camPitch + mouse.dy*0.002));

  // Kierunek liczony z camYaw, NIE z camera.getWorldDirection() —
  // odczytywanie kierunku z samej kamery tworzyło pętlę sprzężenia zwrotnego z kodem
  // kamery poniżej (który wcześniej bazował na obrocie postaci) i powodowało kręcenie się.
  const camDir = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw));
  const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0,1,0)).normalize();

  // W/↑ do przodu, Z/↓ do tyłu, A/← w lewo, S/→ w prawo
  const forward = Number(keys.w || keys.arrowup) - Number(keys.z || keys.arrowdown);
  const right   = Number(keys.s || keys.arrowright) - Number(keys.a || keys.arrowleft);

  if(forward !== 0 || right !== 0) {
    const move = new THREE.Vector3()
      .addScaledVector(camDir, forward)
      .addScaledVector(camRight, right)
      .normalize();

    const speed = (keys.shift ? cfg.speed * 1.6 : cfg.speed) * slowMult;
    velocity.x = move.x * speed;
    velocity.z = move.z * speed;

    // Rotate player to face movement
    const targetYaw = Math.atan2(move.x, move.z);
    let diff = targetYaw - playerGroup.rotation.y;
    while(diff > Math.PI) diff -= Math.PI*2;
    while(diff < -Math.PI) diff += Math.PI*2;
    playerGroup.rotation.y += diff * Math.min(dt*10, 1);

    // Animate legs
    const phase = Date.now() * 0.015;
    playerGroup.userData.legs.forEach((leg, i) => {
      const offset = leg.userData.side * leg.userData.idx * 0.5;
      leg.rotation.x = leg.userData.baseRot[0] + Math.sin(phase + offset)*0.4;
    });
  } else {
    velocity.x *= 0.8;
    velocity.z *= 0.8;
    // Idle
    playerGroup.userData.legs.forEach(leg => {
      leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x, leg.userData.baseRot[0], dt*5);
    });
  }

  // Jump
  if(keys.space && isGrounded) {
    velocity.y = cfg.jump * 15;
    isGrounded = false;
  }
  velocity.y -= 30 * dt; // gravity

  p.x += velocity.x * dt;
  p.z += velocity.z * dt;
  p.y += velocity.y * dt;

  const ground = terrainHeight(p.x, p.z);
  if(p.y <= ground + 0.2) {
    p.y = ground + 0.2;
    velocity.y = 0;
    isGrounded = true;
  }

  // Hideout check
  isHidden = isInsideHideout(p.x, p.z);

  // Bounds
  const bound = 90;
  p.x = Math.max(-bound, Math.min(bound, p.x));
  p.z = Math.max(-bound, Math.min(bound, p.z));

  // Hidden visual
  playerGroup.traverse(c => {
    if(c.isMesh && c.material) {
      c.material.transparent = true;
      c.material.opacity = isHidden ? 0.35 : 1.0;
    }
  });

  // Camera follow — teraz oparta na camYaw (mysz), NIE na obrocie postaci
  const dist = keys.shift ? 7 : 5.5;
  const height = keys.shift ? 4 : 3;
  const cx = p.x - Math.sin(camYaw)*dist;
  const cz = p.z - Math.cos(camYaw)*dist;
  camera.position.lerp(new THREE.Vector3(cx, p.y+height, cz), dt*4);
  camera.lookAt(p.x, p.y+0.5, p.z);
}
