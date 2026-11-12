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
[-4
