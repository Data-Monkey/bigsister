import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Find the container in the HTML
const container = document.getElementById('model-container');

// 1. Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0f7fb);

// 2. Camera
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.z = 3.5;
camera.position.y = 1;
camera.lookAt(0, 0, 0);

// 3. Renderer — read size after aspect-ratio has been applied by the browser
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Fix size once fonts/layout have fully rendered
requestAnimationFrame(() => {
  renderer.setSize(container.clientWidth, container.clientHeight);
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
});

// 4. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// 5. Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;

// 6. Load the 3D model
const loader = new OBJLoader();
let loadedModel;

loader.load(
  '/3d_model.obj',
  (object) => {
    loadedModel = object;
    object.scale.set(1, 1, 1);
    scene.add(object);

    // Center the model in view
    const box = new THREE.Box3().setFromObject(object);
	const center = box.getCenter(new THREE.Vector3());
	object.position.sub(center);
	object.position.y += 0.6;

    if (textMesh) {
      const updatedBox = new THREE.Box3().setFromObject(object);
      textMesh.position.y = updatedBox.min.y - 0.5;
    }
  },
  undefined,
  (error) => { console.error('Error loading model:', error); }
);

// 7. 3D Text
let textMesh;
let currentFont;
const fontLoader = new FontLoader();

function createText(textString, colorHex) {
  if (!currentFont) return;

  if (textMesh) {
    scene.remove(textMesh);
    textMesh.geometry.dispose();
    textMesh.material.dispose();
  }

  const textGeometry = new TextGeometry(textString, {
    font: currentFont,
    size: 0.5,
    depth: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.01,
    bevelSegments: 5
  });

  textGeometry.center();

  const textMaterial = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.4
  });

  textMesh = new THREE.Mesh(textGeometry, textMaterial);

  if (loadedModel) {
    const modelBox = new THREE.Box3().setFromObject(loadedModel);
    textMesh.position.y = modelBox.min.y - 0.5;
  } else {
    textMesh.position.y = -2;
  }

  textMesh.rotation.x = -0.2;
  scene.add(textMesh);
}

// Load initial font
const initialFontUrl = document.getElementById('fontSelect').value;
fontLoader.load(initialFontUrl, (font) => {
  currentFont = font;
  const startingColor = document.getElementById('colorPicker').value;
  const startingText = document.getElementById('textInput').value;
  createText(startingText, startingColor);
});

// 8. UI Controls

document.getElementById('colorPicker').addEventListener('input', (event) => {
  const newColor = new THREE.Color(event.target.value);
  if (loadedModel) {
    loadedModel.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color = newColor;
      }
    });
  }
  if (textMesh) {
    textMesh.material.color = newColor;
  }
});

document.getElementById('textInput').addEventListener('input', (event) => {
  const currentColor = document.getElementById('colorPicker').value;
  createText(event.target.value, currentColor);
});

document.getElementById('fontSelect').addEventListener('change', (event) => {
  fontLoader.load(event.target.value, (font) => {
    currentFont = font;
    const currentColor = document.getElementById('colorPicker').value;
    const currentText = document.getElementById('textInput').value;
    createText(currentText, currentColor);
  });
});

// 9. Music (commented out until you have an audio file)
// To enable: add your music file to public/ folder and uncomment these lines

 const bgMusic = new Audio('/music.mp3');
 bgMusic.loop = true;
 bgMusic.volume = 0.5;
 let isMusicPlaying = false;
 const musicToggleBtn = document.getElementById('musicToggle');
 musicToggleBtn.addEventListener('click', () => {
   if (isMusicPlaying) {
     bgMusic.pause();
     musicToggleBtn.innerText = 'Play Music';
   } else {
     bgMusic.play();
     musicToggleBtn.innerText = 'Pause Music';
   }
   isMusicPlaying = !isMusicPlaying;
 });

// 10. Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// 11. Resize handler
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
