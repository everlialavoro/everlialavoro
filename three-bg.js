import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('bg3d');
if (!canvas) throw new Error('Canvas #bg3d introuvable');

/* ============ RENDERER ============ */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/* ============ SCENE & CAMERA ============ */
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a0e17, 16, 34);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3.8, 10);
camera.lookAt(0, 0.9, 0);

/* ============ LIGHTS ============ */
scene.add(new THREE.AmbientLight(0x506080, 0.55));

const key = new THREE.DirectionalLight(0xffe4b5, 2.1);
key.position.set(6, 10, 5);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -12;
key.shadow.camera.right = 12;
key.shadow.camera.top = 12;
key.shadow.camera.bottom = -12;
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 30;
key.shadow.bias = -0.0006;
scene.add(key);

const fill = new THREE.PointLight(0x2ee6a8, 22, 18, 2);
fill.position.set(-5, 3, 3);
scene.add(fill);

const rim = new THREE.PointLight(0xff6b4a, 16, 16, 2);
rim.position.set(4, 4, -5);
scene.add(rim);

/* ============ GROUND ============ */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x0a0e17, roughness: 1, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2.2;
ground.receiveShadow = true;
scene.add(ground);

/* ============ DESK GROUP ============ */
const deskGroup = new THREE.Group();
scene.add(deskGroup);

// Wood surface
const deskMat = new THREE.MeshStandardMaterial({ color: 0x5c3a22, roughness: 0.65, metalness: 0.05 });
const deskTop = new THREE.Mesh(new THREE.BoxGeometry(9, 0.32, 4.5), deskMat);
deskTop.castShadow = true;
deskTop.receiveShadow = true;
deskGroup.add(deskTop);

// Legs
const legMat = new THREE.MeshStandardMaterial({ color: 0x3a2517, roughness: 0.8 });
[-4, 4].forEach(x => {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.05, 4.2), legMat);
  leg.position.set(x, -1.19, 0);
  leg.castShadow = true;
  leg.receiveShadow = true;
  deskGroup.add(leg);
});

// Back panel (subtle)
const backMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.9 });
const back = new THREE.Mesh(new THREE.BoxGeometry(8, 0.7, 0.08), backMat);
back.position.set(0, 0.1, -2.2);
deskGroup.add(back);

/* ============ MONITOR ============ */
const darkMat = new THREE.MeshStandardMaterial({ color: 0x171b26, roughness: 0.35, metalness: 0.65 });
const screenMat = new THREE.MeshStandardMaterial({
  color: 0x0d1a1a, emissive: 0x2ee6a8, emissiveIntensity: 0.7,
  roughness: 0.15, metalness: 0.2
});

const monitor = new THREE.Group();
monitor.position.set(0, 1.7, -0.9);
deskGroup.add(monitor);

const monitorFrame = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 0.16), darkMat);
monitorFrame.castShadow = true;
monitor.add(monitorFrame);

const monitorScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.72, 2.12), screenMat);
monitorScreen.position.z = 0.09;
monitor.add(monitorScreen);

// Stand
const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.06, 24), darkMat);
standBase.position.set(0, 0.2, -0.9);
deskGroup.add(standBase);
const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.1, 16), darkMat);
standPole.position.set(0, 0.78, -0.9);
standPole.castShadow = true;
deskGroup.add(standPole);

/* ============ KEYBOARD & MOUSE ============ */
const kbMat = new THREE.MeshStandardMaterial({ color: 0x141823, roughness: 0.55, metalness: 0.3 });
const keyboard = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.07, 0.95), kbMat);
keyboard.position.set(0, 0.21, 0.7);
keyboard.castShadow = true;
deskGroup.add(keyboard);

const mouseObj = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), kbMat);
mouseObj.scale.set(1, 0.55, 1.35);
mouseObj.position.set(2.05, 0.17, 0.85);
mouseObj.castShadow = true;
deskGroup.add(mouseObj);

/* ============ COFFEE CUP ============ */
const cupMat = new THREE.MeshStandardMaterial({ color: 0xf5efe4, roughness: 0.55 });
const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3a1f10, roughness: 0.85 });

const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.44, 24), cupMat);
cup.position.set(-2.6, 0.38, 0.9);
cup.castShadow = true;
deskGroup.add(cup);

const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24), coffeeMat);
coffee.position.set(-2.6, 0.6, 0.9);
deskGroup.add(coffee);

/* ============ NOTEBOOK ============ */
const nbMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
const notebook = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 1.1), nbMat);
notebook.position.set(2.6, 0.19, 0.3);
notebook.rotation.y = -0.28;
notebook.castShadow = true;
deskGroup.add(notebook);

/* ============ PLANT ============ */
const potMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.75 });

const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.44, 16), potMat);
pot.position.set(3.6, 0.38, -1.5);
pot.castShadow = true;
deskGroup.add(pot);

for (let i = 0; i < 5; i++) {
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9 + Math.random() * 0.4, 6), leafMat);
  const angle = (i / 5) * Math.PI * 2;
  leaf.position.set(
    3.6 + Math.cos(angle) * 0.12,
    1.05 + Math.random() * 0.15,
    -1.5 + Math.sin(angle) * 0.12
  );
  leaf.rotation.z = Math.cos(angle) * 0.25;
  leaf.rotation.x = Math.sin(angle) * 0.25;
  leaf.castShadow = true;
  deskGroup.add(leaf);
}

/* ============ FLOATING DOCUMENTS ============ */
const docMaterial = new THREE.MeshStandardMaterial({
  color: 0xf5efe4, roughness: 0.7, side: THREE.DoubleSide,
  transparent: true, opacity: 0.85
});
const docs = [];
for (let i = 0; i < 14; i++) {
  const doc = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.58), docMaterial.clone());
  const angle = Math.random() * Math.PI * 2;
  const radius = 3.5 + Math.random() * 4.5;
  doc.position.set(
    Math.cos(angle) * radius,
    1 + Math.random() * 4,
    Math.sin(angle) * radius - 1
  );
  doc.rotation.set(Math.random(), Math.random(), Math.random());
  doc.userData = {
    speed: 0.2 + Math.random() * 0.25,
    rotSpeed: (Math.random() - 0.5) * 0.6,
    opacity: docMaterial.opacity
  };
  docs.push(doc);
  scene.add(doc);
}

/* ============ FLOATING BRIEFCASE ============ */
const briefcase = new THREE.Group();
const caseMat = new THREE.MeshStandardMaterial({ color: 0x7a4a2c, roughness: 0.55, metalness: 0.1 });
const caseBody = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.68, 0.24), caseMat);
caseBody.castShadow = true;
briefcase.add(caseBody);
const handleMat = new THREE.MeshStandardMaterial({ color: 0x3a2517, roughness: 0.6 });
const handle = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.028, 8, 16, Math.PI), handleMat);
handle.position.y = 0.36;
briefcase.add(handle);
briefcase.position.set(-4.5, 1.4, -2.5);
briefcase.rotation.y = 0.6;
briefcase.rotation.z = -0.15;
scene.add(briefcase);

/* ============ MOUSE PARALLAX ============ */
const mousePos = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

/* ============ RESIZE ============ */
function handleResize() {
  const aspect = window.innerWidth / window.innerHeight;
  camera.aspect = aspect;
  camera.fov = aspect < 1 ? 55 : 42;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleResize);
handleResize();

/* ============ ANIMATE ============ */
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  // Écran qui pulse doucement
  screenMat.emissiveIntensity = 0.6 + Math.sin(t * 1.4) * 0.15;

  // Documents flottants qui montent en boucle
  docs.forEach(doc => {
    doc.position.y += doc.userData.speed * 0.012;
    if (doc.position.y > 6.5) doc.position.y = 0.4;
    doc.rotation.x += doc.userData.rotSpeed * 0.006;
    doc.rotation.z += doc.userData.rotSpeed * 0.004;
    const dist = Math.abs(doc.position.y - 3);
    doc.material.opacity = 0.35 + Math.min(dist / 3, 0.55);
  });

  // Mallette flottante
  briefcase.position.y = 1.4 + Math.sin(t * 0.9) * 0.18;
  briefcase.rotation.y = 0.6 + Math.sin(t * 0.35) * 0.22;
  briefcase.rotation.z = -0.15 + Math.sin(t * 0.6) * 0.06;

  // Léger mouvement de la caméra selon la souris
  camera.position.x += (mousePos.x * 1.1 - camera.position.x) * 0.03;
  camera.position.y += (3.8 + mousePos.y * 0.6 - camera.position.y) * 0.03;
  camera.lookAt(0, 0.9, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
