  
  /*
  Resources:
  - "Type Writer 1900" (https://skfb.ly/osFqZ) by sasisadev is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
  TODO:
  - [ ] Work out how to lerp between exploded and non-exploded view
  */
  
  let rotateMode = true;
  let explodeMode = true;
  const explodeExtent = 4.0;
  const explodeCycleFrames = 10;
  const modelName = "FancyTypewriter.glb";

  // Setting up the biz
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  // const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const camera = new THREE.PerspectiveCamera( 75, 1.0, 0.1, 1000 );
  const renderer = new THREE.WebGLRenderer();
  // renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setSize(1080, 1080);
  document.body.appendChild( renderer.domElement );

  // OrbitControls
  const controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  camera.position.z = 5;

  // setting up the simplex noise
  let t = 0;
  const openSimplex = new OpenSimplexNoise(Date.now());
  // const getNoiseValue = (pos) => {
  //   let noiseVal = openSimplex.noise4D(pos.x, t);
  // }

  // const ambientLight = new THREE.AmbientLight(0xffffff);
  // scene.add(ambientLight);
  // 3-Point Lighting
  const keyLight = new THREE.DirectionalLight( 0xffffff, 2.0 ); // Key light (main light)
  keyLight.position.set( 1, 1, 1 );
  scene.add( keyLight );

  const fillLight = new THREE.DirectionalLight( 0xffffff, 0.5 ); // Fill light (softens shadows)
  fillLight.position.set( -1, 0, 1 );
  scene.add( fillLight );

  const backLight = new THREE.DirectionalLight( 0xffffff, 0.5 ); // Back light (separates object from background)
  backLight.position.set( 0, -1, -1 );
  scene.add( backLight );

  const modelManager = new GLTFModelManager()
// loading the model
modelManager.loadModel(modelName)
  .then(gltfScene => {
    // Add the model to your scene
    scene.add(gltfScene);
    // Now you can use modelManager.resetAllMeshes() whenever needed
  })
  .catch(error => {
    console.error('Error loading model:', error);
  });




// Animation loop
function animate() {
    t += 0.03;
    let prog = (t) => 0.5*(Math.sin(t) + 1);
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );

    if(modelManager.gltfModel){
      modelManager.gltfModel.rotation.x += 0.01;
      modelManager.gltfModel.rotation.y += 0.01;
      modelManager.gltfModel.rotation.z += 0.01;
      if(rotateMode) modelManager.rotateIndividualParts();
      if(explodeMode) modelManager.explode(bounce(cycle(t, 10)));
    }
    
    
}

animate();

// // Handle window resizing
// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize( window.innerWidth, window.innerHeight );
// }

// window.addEventListener( 'resize', onWindowResize, false );


function onMouseClick(event) {
  // Check if the left mouse button was clicked (button 0)
  if (event.button === 0) {
    rotateMode = !rotateMode;
    console.log("Rotate mode toggled:", rotateMode);
    if(!rotateMode) modelManager.resetAllMeshes();
    explodeMode = !explodeMode;
  }
}

// Add the event listener to the renderer's DOM element
renderer.domElement.addEventListener('click', onMouseClick, false);

function easeInOutSine(x){
  return 0.5*(-Math.cos(x * Math.PI) + 1);
}

function bounce(x){
    const c5 = (2 * Math.PI) / 4.5;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : x < 0.5
      ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
  }

  function cycle(t, cycleFrames) {
    // Normalize t to the range [0, cycleFrames)
    const normalizedT = t % cycleFrames;
  
    // Calculate the progress within the cycle (0 to 1 and back to 0)
    if (normalizedT < cycleFrames / 2) {
      return normalizedT / (cycleFrames / 2);
    } else {
      return 1 - (normalizedT - cycleFrames / 2) / (cycleFrames / 2);
    }
  }