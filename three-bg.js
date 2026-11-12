import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('bg3d');
if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070d, 0.028);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 15;

  const COUNT = 2600;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const gold = new THREE.Color('#e5c06a');
  const emerald = new THREE.Color('#2ee6a8');

  for (let i = 0; i < COUNT; i++) {
    const r = 6 + Math.random() * 16;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const c = gold.clone().lerp(emerald, Math.random());
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.07, vertexColors: true, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(3, 0.32, 200, 26),
    new THREE.MeshBasicMaterial({ color: 0xe5c06a, wireframe: true, transparent: true, opacity: 0.22 })
  );
  knot.position.set(7, 0, -8);
  scene.add(knot);

  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.4, 1),
    new THREE.MeshBasicMaterial({ color: 0x2ee6a8, wireframe: true, transparent: true, opacity: 0.18 })
  );
  ico.position.set(-8, 2, -5);
  scene.add(ico);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 22, 22),
    new THREE.MeshBasicMaterial({ color: 0x9aa6bb, wireframe: true, transparent: true, opacity: 0.06 })
  );
  sphere.position.set(0, 0, -4);
  scene.add(sphere);

  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();
    particles.rotation.y = t * 0.035;
    particles.rotation.x = Math.sin(t * 0.1) * 0.08;
    knot.rotation.x = t * 0.18;
    knot.rotation.y = t * 0.28;
    ico.rotation.x = -t * 0.14;
    ico.rotation.y = t * 0.22;
    sphere.rotation.y = t * 0.06;

    camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 1.1 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
