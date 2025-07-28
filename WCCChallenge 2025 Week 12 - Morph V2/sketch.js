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


function convertGeometryToVector3s(geometry){
  if (!geometry || !geometry.attributes.position) {
    throw new Error("positionGlowingSpheresOnVertices: Geometry must have a list of positions.");
  }

  const vertices = geometry.attributes.position.array;
  let verticesAsVectors = [];
  for(let i = 0; i < vertices.length; i+=3){
    verticesAsVectors.push(new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2])) 
  }
  return verticesAsVectors
}

function positionGlowingSpheresOnVertices(vertices){
  const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffff3d});
  const glowSphereInstances = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, vertices.length)
  const dummy = new THREE.Object3D();

  vertices.forEach((vert, index) => {
    dummy.position.copy(vert);
    dummy.updateMatrix();
    glowSphereInstances.setMatrixAt(index, dummy.matrix);
  });

  scene.add(glowSphereInstances);
  glowSphereInstances.instanceMatrix.needsUpdate = true;
  return glowSphereInstances;
}

// function positionGlowingSpheresOnVertices(geometry, scene) {
//   if (!geometry || !geometry.attributes.position) {
//     throw new Error("positionGlowingSpheresOnVertices: Geometry must have a list of positions.");
//   }
//   const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
//   const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

//   const pointLight = new THREE.PointLight(0xffff00, 1, 1);
//   pointLight.distance = 0.5;

//   const vertices = geometry.attributes.position.array;
  
//   for(let i = 0; i < vertices.length; i+=3){
//     const vertex = new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]);
//     const sphere = new THREE.InstancedMesh(sphereGeometry, sphereMaterial);
//     sphere.position.copy(vertex);
//     scene.add(sphere);

//     const lightClone = pointLight.clone();
//     lightClone.position.copy(vertex);
//     scene.add(lightClone);
//   }
// }


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let time = 0.0;
camera.position.z = 3;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Resize Handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

const ambientLight = new THREE.AmbientLight();

// testing
// const testGeometry = new THREE.BoxGeometry(1, 1, 1);
// const testMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00, wireframe: true});
// const cube = new THREE.Mesh(testGeometry, testMaterial);
// scene.add(cube);

const objLoader = new THREE.OBJLoader();

let glowOrbs;

function loadModelAndConvertToVertexOrbs(filename){
  geometry = objLoader.load(filename, (object) => {
    // Create a material using the loaded texture
    const geometry = object.children[0];
    if(!geometry) throw Error("No mesh found!");
    return geometry;
  });
  let geometryVertices = convertGeometryToVector3s(geometry);
  let geometryGlowOrbs = positionGlowingSpheresOnVertices(geometryVertices);
  return geometryGlowOrbs
}

glowOrbs = loadModelAndConvertToVertexOrbs("FireTree.obj");











// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);


function animate() {
  requestAnimationFrame(animate);
  time += 0.1;

  controls.update(); // Important!
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  if(glowOrbs){
    glowOrbs.rotation.x += 0.01;
    glowOrbs.rotation.y += 0.01;
  }
  
  

  renderer.render(scene, camera);
}

  animate();

  // Handle window resizing
  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
  });


