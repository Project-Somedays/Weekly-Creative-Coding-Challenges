/*
Author: Project Somedays
Date: 
Title: 

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

*/


let renderer, scene, camera, controls, lights, clock, aspectRatio;
let palette;
let spheres, sphereBodies;


function setup(){
  //######### RENDERER ##########//
renderer = new THREE.WebGLRenderer();
// renderer.setSize(1080, 1080);
// renderer.setSize( Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight));
renderer.setSize(window.innerWidth, window.innerHeight);
aspectRatio = window.innerWidth / window.innerHeight; // 1
renderer.setAnimationLoop( animate );

document.body.appendChild( renderer.domElement );
clock = new THREE.Clock();

// Add window resize listener
window.addEventListener('resize', onWindowResize, false);




//######### Scene ##########//
scene = new THREE.Scene();

// Add test cube
// scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshNormalMaterial()));

  //######### CAMERA ##########//
camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
camera.position.set(0,0,5);
camera.lookAt(new THREE.Vector3(0,0,0));

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//############ LIGHTS ##############//
lights = setupThreePointLighting(scene);

  gui = new lil.GUI();
  params = {
    maxForce : 0.01
  }

  gui.add(params, 'maxForce', 0.001, 0.1);

// ########### WORLD Biz ########## //
spheres = [];
sphereBodies = [];
palette = "#f72585, #b5179e, #7209b7, #560bad, #480ca8, #3a0ca3, #3f37c9, #4361ee, #4895ef, #4cc9f0".split(", ");

// Add initial spheres
for (let i = 0; i < 20; i++) {
  const x = (Math.random() - 0.5) * 20;
  const z = (Math.random() - 0.5) * 20;
  const radius = 0.2 + Math.random() * 0.3;
  createSphere(x, z, radius);
}





  describe("");
}



function draw(){
  const clock = new THREE.Clock();
  animate();
}



function animate() {
	const elapsedTime = clock.getElapsedTime();

  updateSphereMovement();

  // Update sphere positions
  spheres.forEach(sphere => sphere.update());

  // Check for collisions and growth
  handleCollisions();

  // Add new small spheres occasionally
  if (Math.random() < 0.02) {
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      createSphere(x, z, 0.2);
  }

  renderer.render(scene, camera);

	controls.update();
	renderer.render( scene, camera );
}



function onWindowResize() {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Optional: Update any custom render targets
  // if (yourRenderTarget) {
  //     yourRenderTarget.setSize(window.innerWidth, window.innerHeight);
  // }
  
  // Optional: Update any screen-space calculations
  // if (yourScreenSpaceEffect) {
  //     yourScreenSpaceEffect.resolution.set(window.innerWidth, window.innerHeight);
  // }
}

