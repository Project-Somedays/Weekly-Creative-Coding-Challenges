/* 
Author: Project Somedays
Date: 2025-03-22
Title: WCCChallenge 2025 Week 12 - Morph

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Man, Big Hero 6 was a good movie... Replicating a little of his demo scene: https://www.youtube.com/watch?v=Iuum5--i2tE

RESOURCES:
  - Microbot model: modelled in Blender by yours truly
  - Physics Library: Cannon.js
  - Surfaces: https://www.craftsmanspace.com/free-3d-models/mathematical-3d-surfaces.html

  Moving microbots to the vertices of 3D surfaces
*/


// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Adjust camera position as needed

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls (Optional, but very useful)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Animate controls smoothly
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 500;

// Cube
// const boxGeometry = new THREE.BoxGeometry(1,1,1);
// const boxMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(boxMesh);

// Lights
// const mainLight = new THREE.AmbientLight(0xffffff, 0.25);
// scene.add(mainLight);
const edgeLight = new THREE.DirectionalLight(0xffffff, 5, {position: new THREE.Vector3(0.5, 0, 0.5)})
scene.add(edgeLight);
// front light
const frontLight = new THREE.DirectionalLight(0xffffff, 5, {position: new THREE.Vector3(0, 0, 1)});
scene.add(frontLight);

// const pointLight = new THREE.PointLight(0xffffff, 1);

// backdrop
// const backdropMesh = new THREE.Mesh(
//   new THREE.PlaneGeometry(100, 100),
//   new THREE.MeshStandardMaterial(0xffffff)
// );
// backdropMesh.rotation.x = Math.PI/2;
// scene.add(backdropMesh);

// instancing simplex noise
const simplex = new OpenSimplexNoise(Date.now());
let time = 0;

// getting the points on a dini surface
const diniPoints = [];
for(let u = 0; u < 4*Math.PI; u += 0.2){
  for(let v = 0; v < 2; v += 0.2){
    diniPoints.push(diniSurface(u, v, 2, 0.2, 0.7));
  }
}


// Loading in instance of the things
// instantiate a loader
const objLoader = new THREE.OBJLoader();
const textureLoader = new THREE.TextureLoader();

// load a the microbot resource
let microbotsInstancedMesh;

// load the texture
const microbotTexure = textureLoader.load('MicrobotTexture.png');

objLoader.load('microbot.obj', (object) => {
  // Create a material using the loaded texture
  const mesh = object.children[0];
  if(!mesh){
    console.log("No mesh found!");
    return;
  }

  const scl = new THREE.Vector3(0.015, 0.015, 0.015);

  const dummy = new THREE.Object3D();
  const geometry = mesh.geometry;
  const material = new THREE.MeshStandardMaterial({map: microbotTexure});
  microbotsInstancedMesh = new THREE.InstancedMesh(geometry, material, diniPoints.length);
  scene.add(microbotsInstancedMesh);

  for(let i = 0; i < diniPoints.length; i++){
    dummy.position.copy(diniPoints[i]);
    dummy.scale.copy(scl)
    dummy.updateMatrix();
    microbotsInstancedMesh.setMatrixAt(i, dummy.matrix);
  }

  // instancedMesh.instancedMesh.needsUpdate = true;
  // const material = new THREE.MeshStandardMaterial({ map: texture }); // Or MeshBasicMaterial, etc.
  // object.traverse((child) => {
  //   if (child instanceof THREE.Mesh) {
  //     // Apply the material to the object's meshes
  //     child.material = material;
  //   }
  // microbot = object;
  // // Add the object to your scene
  // scene.add(microbot);
});





// apply the texture to the microbot


// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  time += 0.1;

  controls.update(); // Update Orbit Controls


  if(microbotsInstancedMesh){
    const dummy = new THREE.Object3D();
    for(let i = 0; i < microbotsInstancedMesh.count; i++){
      
      microbotsInstancedMesh.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      // position.setFromMatrixPosition(dummy.matrix);
      const rotation = getRotation(dummy.position);
      
      dummy.rotation.copy(rotation);
      dummy.updateMatrix();
      microbotsInstancedMesh.setMatrixAt(i, dummy.matrix);
    }

    microbotsInstancedMesh.needsUpdate = true;
  }
 

  renderer.render(scene, camera);
}

// Start the animation loop
animate();


// Resize Handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

function getRotation(position){
  // uses opensimplex noise
  const noiseValue = simplex.noise4D(position.x, position.y, position.z, time);
  const rotation = new THREE.Euler(
    noiseValue * Math.PI,
    noiseValue * Math.PI * 2,
    noiseValue * Math.PI * 0.5
  )
  return rotation;
}


function updateDini(){

}