/**
 * VIKRAM.DEV — Three.js WebGL Interactive Particle Constellation
 */
import * as THREE from 'three';

export function initHeroWebGL() {
  const container = document.getElementById('hero-canvas-container');
  if (!container) return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 40;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Particles Data
  const particleCount = window.innerWidth < 768 ? 400 : 900;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  // Molten Copper & Cyber Cyan Palette
  const colorCopper = new THREE.Color('#FF6B35');
  const colorAmber = new THREE.Color('#FF9E00');
  const colorCyan = new THREE.Color('#00F0FF');
  const colorDark = new THREE.Color('#3A4150');

  for (let i = 0; i < particleCount; i++) {
    // Distribute in a spherical cloud with depth
    const radius = 25 + Math.random() * 35;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Color distribution: mostly copper/amber, rare cyan accents
    let chosenColor;
    const rand = Math.random();
    if (rand > 0.88) {
      chosenColor = colorCyan;
    } else if (rand > 0.45) {
      chosenColor = colorCopper;
    } else if (rand > 0.2) {
      chosenColor = colorAmber;
    } else {
      chosenColor = colorDark;
    }

    colors[i * 3] = chosenColor.r;
    colors[i * 3 + 1] = chosenColor.g;
    colors[i * 3 + 2] = chosenColor.b;

    scales[i] = Math.random() * 2 + 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Custom circular blurred point texture
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
  grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.15)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    map: texture,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Geometric Wireframe Dual-Core Sphere (Copper Core + Cyan Ambient Lattice)
  const icoGeom = new THREE.IcosahedronGeometry(15, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0xFF6B35,
    wireframe: true,
    transparent: true,
    opacity: 0.26
  });
  const icoMesh = new THREE.Mesh(icoGeom, icoMat);
  scene.add(icoMesh);

  // Secondary Concentric Cyan Wireframe Sphere for Depth
  const outerGeom = new THREE.IcosahedronGeometry(18.5, 1);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x00F0FF,
    wireframe: true,
    transparent: true,
    opacity: 0.16
  });
  const outerMesh = new THREE.Mesh(outerGeom, outerMat);
  scene.add(outerMesh);

  // Mouse Interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
  });

  // Scroll Interaction
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY * 0.02;
  });

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Slow rotation
    particleSystem.rotation.y = elapsedTime * 0.04 + targetX;
    particleSystem.rotation.x = elapsedTime * 0.02 + targetY;
    particleSystem.position.y = -scrollY * 0.4;

    icoMesh.rotation.y = -elapsedTime * 0.08 - targetX;
    icoMesh.rotation.x = elapsedTime * 0.05 + targetY;
    icoMesh.position.y = -scrollY * 0.3;

    outerMesh.rotation.y = elapsedTime * 0.05 + targetX;
    outerMesh.rotation.z = -elapsedTime * 0.04 - targetY;
    outerMesh.position.y = -scrollY * 0.3;

    renderer.render(scene, camera);
  }

  animate();
}
