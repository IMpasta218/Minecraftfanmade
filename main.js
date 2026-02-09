import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/PointerLockControls.js';

const blockTypes = [
  { id: 'grass', label: 'Grass', color: '#4caf50' },
  { id: 'dirt', label: 'Dirt', color: '#8b5a2b' },
  { id: 'stone', label: 'Stone', color: '#888888' },
  { id: 'wood', label: 'Wood', color: '#a97142' },
  { id: 'sand', label: 'Sand', color: '#d8c07c' },
];

const inventory = Object.fromEntries(blockTypes.map((block) => [block.id, 0]));
let selectedSlot = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 20, 95);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 8, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.object);

const overlay = document.getElementById('overlay');

function showOverlay() {
  overlay.style.display = 'grid';
}

function hideOverlay() {
  overlay.style.display = 'none';
}

overlay.addEventListener('click', () => {
  controls.lock();
  setTimeout(() => {
    if (!controls.isLocked && renderer.domElement.requestPointerLock) {
      renderer.domElement.requestPointerLock();
    }
  }, 50);
});

controls.addEventListener('lock', hideOverlay);
controls.addEventListener('unlock', showOverlay);

document.addEventListener('pointerlockchange', () => {
  const lockedElement = document.pointerLockElement;
  const isGameLocked = lockedElement === document.body || lockedElement === renderer.domElement;
  if (isGameLocked) {
    hideOverlay();
  } else {
    showOverlay();
  }
});

const hotbarElement = document.getElementById('hotbar');
const selectedElement = document.getElementById('selected-block');

function selectedType() {
  return blockTypes[selectedSlot] || blockTypes[0];
}

function renderHotbar() {
  hotbarElement.innerHTML = '';
  blockTypes.forEach((block, index) => {
    const slot = document.createElement('div');
    slot.className = `slot ${selectedSlot === index ? 'active' : ''}`;
    slot.innerHTML = `
      <div>${index + 1}</div>
      <div class="swatch" style="background:${block.color}"></div>
      <div>${inventory[block.id]}</div>
    `;
    hotbarElement.appendChild(slot);
  });

  const block = selectedType();
  selectedElement.textContent = `Selected: ${block.label} (${inventory[block.id]})`;
}

const hemi = new THREE.HemisphereLight(0xffffff, 0x445566, 0.8);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set(15, 30, 10);
scene.add(sun);

const materials = {
  grass: [
    new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
    new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
    new THREE.MeshLambertMaterial({ color: 0x4caf50 }),
    new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
    new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
    new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
  ],
  dirt: new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
  stone: new THREE.MeshLambertMaterial({ color: 0x888888 }),
  wood: new THREE.MeshLambertMaterial({ color: 0xa97142 }),
  sand: new THREE.MeshLambertMaterial({ color: 0xd8c07c }),
};

const blocks = new Map();
const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

function keyFor(x, y, z) {
  return `${x},${y},${z}`;
}

function addBlock(x, y, z, type = 'grass') {
  const key = keyFor(x, y, z);
  if (blocks.has(key)) return;
  const mesh = new THREE.Mesh(blockGeometry, materials[type] || materials.stone);
  mesh.position.set(x, y, z);
  mesh.userData.type = type;
  scene.add(mesh);
  blocks.set(key, mesh);
}

function removeBlock(x, y, z, collect = true) {
  const key = keyFor(x, y, z);
  const mesh = blocks.get(key);
  if (!mesh) return;
  scene.remove(mesh);
  blocks.delete(key);

  if (collect && inventory[mesh.userData.type] !== undefined) {
    inventory[mesh.userData.type] += 1;
    renderHotbar();
  }
}

for (let x = -30; x <= 30; x += 1) {
  for (let z = -30; z <= 30; z += 1) {
    const h = Math.floor(Math.sin(x * 0.22) * 1.3 + Math.cos(z * 0.2) * 1.3 + 2);
    for (let y = -2; y <= h; y += 1) {
      const type = y === h ? 'grass' : y >= h - 2 ? 'dirt' : 'stone';
      addBlock(x, y, z, type);
    }
  }
}

inventory.dirt = 30;
inventory.grass = 15;
inventory.stone = 20;
inventory.wood = 20;
inventory.sand = 20;
renderHotbar();

const mobGeometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);
const mobMaterial = new THREE.MeshLambertMaterial({ color: 0x7dd3fc });
const mobs = [];
const mobSpawnRadius = 18;

function groundHeightAt(x, z) {
  for (let y = 30; y >= -5; y -= 1) {
    if (blocks.has(keyFor(Math.round(x), y, Math.round(z)))) {
      return y + 0.5;
    }
  }
  return 1;
}

function spawnMob() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 8 + Math.random() * mobSpawnRadius;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = groundHeightAt(x, z);

  const mesh = new THREE.Mesh(mobGeometry, mobMaterial.clone());
  mesh.position.set(Math.round(x), y + 0.43, Math.round(z));
  mesh.userData.type = 'mob';
  scene.add(mesh);

  mobs.push({
    mesh,
    hp: 3,
    speed: 1 + Math.random() * 0.8,
    wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
    nextTurn: 0,
  });
}

for (let i = 0; i < 8; i += 1) spawnMob();

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const keys = { forward: false, backward: false, left: false, right: false };
let canJump = false;
const playerHeight = 1.7;
const playerRadius = 0.35;

const raycaster = new THREE.Raycaster();

function nearestGridPoint(vec) {
  return { x: Math.round(vec.x), y: Math.round(vec.y), z: Math.round(vec.z) };
}

function tryDamageMob() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(
    mobs.filter((mob) => mob.hp > 0).map((mob) => mob.mesh),
    false,
  );

  const hit = hits[0];
  if (!hit || hit.distance > 4.5) return false;

  const mob = mobs.find((item) => item.mesh === hit.object);
  if (!mob) return false;

  mob.hp -= 1;
  mob.mesh.material.color.setHex(mob.hp > 0 ? 0xfca5a5 : 0x374151);

  if (mob.hp <= 0) {
    scene.remove(mob.mesh);
    inventory.wood += 2;
    renderHotbar();
    setTimeout(spawnMob, 1500);
  }

  return true;
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyW') keys.forward = true;
  if (event.code === 'KeyS') keys.backward = true;
  if (event.code === 'KeyA') keys.left = true;
  if (event.code === 'KeyD') keys.right = true;

  if (event.code === 'Space' && canJump) {
    velocity.y = 8;
    canJump = false;
  }

  if (/^Digit[1-9]$/.test(event.code)) {
    const slot = Number(event.code.replace('Digit', '')) - 1;
    if (slot < blockTypes.length) {
      selectedSlot = slot;
      renderHotbar();
    }
  }
});

document.addEventListener('keyup', (event) => {
  if (event.code === 'KeyW') keys.forward = false;
  if (event.code === 'KeyS') keys.backward = false;
  if (event.code === 'KeyA') keys.left = false;
  if (event.code === 'KeyD') keys.right = false;
});

document.addEventListener('contextmenu', (event) => event.preventDefault());

document.addEventListener('mousedown', (event) => {
  if (!controls.isLocked) return;

  if (event.button === 0 && tryDamageMob()) {
    return;
  }

  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects([...blocks.values()], false);
  if (intersects.length === 0) return;

  const hit = intersects[0];
  const target = nearestGridPoint(hit.object.position);

  if (event.button === 0) {
    removeBlock(target.x, target.y, target.z, true);
  }

  if (event.button === 2) {
    const block = selectedType();
    if (inventory[block.id] <= 0) return;

    const normal = hit.face.normal;
    const place = {
      x: target.x + normal.x,
      y: target.y + normal.y,
      z: target.z + normal.z,
    };

    const playerPos = controls.object.position;
    const tooClose =
      Math.abs(place.x - playerPos.x) < playerRadius + 0.5 &&
      Math.abs(place.z - playerPos.z) < playerRadius + 0.5 &&
      Math.abs(place.y + 0.5 - playerPos.y) < playerHeight;

    if (!tooClose) {
      addBlock(place.x, place.y, place.z, block.id);
      inventory[block.id] -= 1;
      renderHotbar();
    }
  }
});

const playerFootRay = new THREE.Raycaster();
const clock = new THREE.Clock();

function collidesAt(position) {
  const feetY = Math.floor(position.y - playerHeight + 0.1);
  const bodyY = Math.floor(position.y - playerHeight / 2);
  const headY = Math.floor(position.y - 0.1);
  const x = Math.round(position.x);
  const z = Math.round(position.z);

  return blocks.has(keyFor(x, feetY, z)) || blocks.has(keyFor(x, bodyY, z)) || blocks.has(keyFor(x, headY, z));
}

function updatePlayer(delta) {
  velocity.x -= velocity.x * 9.5 * delta;
  velocity.z -= velocity.z * 9.5 * delta;
  velocity.y -= 20 * delta;

  direction.set(0, 0, 0);
  direction.z = Number(keys.forward) - Number(keys.backward);
  direction.x = Number(keys.right) - Number(keys.left);
  direction.normalize();

  if (keys.forward || keys.backward) velocity.z -= direction.z * 24 * delta;
  if (keys.left || keys.right) velocity.x -= direction.x * 24 * delta;

  const moveX = velocity.x * delta;
  const moveZ = velocity.z * delta;

  controls.moveRight(-moveX);
  controls.moveForward(-moveZ);

  const pos = controls.object.position;
  if (collidesAt(pos.clone())) {
    controls.moveRight(moveX);
    controls.moveForward(moveZ);
    velocity.x = 0;
    velocity.z = 0;
  }

  pos.y += velocity.y * delta;

  playerFootRay.set(new THREE.Vector3(pos.x, pos.y, pos.z), new THREE.Vector3(0, -1, 0));
  const nearBlocks = [...blocks.values()].filter(
    (b) => Math.abs(b.position.x - pos.x) < 1.5 && Math.abs(b.position.z - pos.z) < 1.5 && b.position.y <= pos.y,
  );

  const groundHit = playerFootRay.intersectObjects(nearBlocks, false)[0];
  if (groundHit) {
    const minY = groundHit.point.y + playerHeight;
    if (pos.y <= minY) {
      pos.y = minY;
      velocity.y = 0;
      canJump = true;
    }
  }

  if (pos.y < -20) {
    pos.set(0, 8, 0);
    velocity.set(0, 0, 0);
  }
}

function updateMobs(delta) {
  const now = performance.now();

  mobs.forEach((mob) => {
    if (mob.hp <= 0) return;

    if (now > mob.nextTurn) {
      mob.wanderDir
        .set(Math.random() - 0.5, 0, Math.random() - 0.5)
        .normalize();
      mob.nextTurn = now + 1200 + Math.random() * 1800;
    }

    const oldPos = mob.mesh.position.clone();
    mob.mesh.position.x += mob.wanderDir.x * mob.speed * delta;
    mob.mesh.position.z += mob.wanderDir.z * mob.speed * delta;

    const floorY = groundHeightAt(mob.mesh.position.x, mob.mesh.position.z);
    mob.mesh.position.y = floorY + 0.43;

    const distFromCenter = Math.hypot(mob.mesh.position.x, mob.mesh.position.z);
    if (distFromCenter > 34 || collidesAt(mob.mesh.position)) {
      mob.mesh.position.copy(oldPos);
      mob.wanderDir.multiplyScalar(-1);
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(0.05, clock.getDelta());
  if (controls.isLocked) updatePlayer(delta);
  updateMobs(delta);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});