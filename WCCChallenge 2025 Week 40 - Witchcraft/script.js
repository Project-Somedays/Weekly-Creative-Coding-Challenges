/*

| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 40 - Witchcraft
| 📅 Started      | 2025-10-05      
| 📅 Completed    | 2025-10-05        
| 🕒 Taken        | 6hrs                     
| 🤯 Concept      | Murmurations of witches
| 🔎 Focus        | Post-Processing in Three.js and Wiggle Bones in Blender

Definitely check out the "Lock to Witch view". Flocking with witches and playing with post-processing Three.js

Trying to use wiggle bones to make some secondary motion: https://x.com/ProjectSomedays/status/1974715033558110389
Will try and get it working ASAP in the code.

Thought about getting some sort of portal to pop up to signify when they pass through. Is work in progress.

Also to try out: multiple scenes so I can have bloom on the orbs with trails and the witches on a different render layer...

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

RESOURCES
- Claude was my guide through the wilderness
- "Low poly stylised Broom/Witch Broom" (https://skfb.ly/prDKz) by ✞BloodTea✞ is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
- Low Poly Broom: https://sketchfab.com/3d-models/witchypoo-d5988e24e1e146d99b480781f29f1871
- Night EXR: https://polyhaven.com/a/rogland_clear_night
- Made, rigged and animated the low-poly witch myself

*/

let scene, camera, renderer, controls, canvas;
let cube; // Will hold our cube object
let objLoader, textureLoader, soundLoader;// loaders
let raycaster; 
let mouse;

// GLTFLoader instance (create once, reuse for all boids)
let gltfLoader = null;
let witchModelCache = null; // Cache the loaded model
let lastTime = 0;

const n = 1000;
const boundingSphereRadius = 40;
const boids = [];
let portalManager;
// const soundFile = ;
let composer, bloomPass, afterimagePass;

// Selective bloom variables
const materials = {};
const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
const bloomLayer = new THREE.Layers();
bloomLayer.set(1);

// Add bloom params to your GUI
const bloomParams = {
    strength: 2.5,
    radius: 0.8,
    threshold: 0.3,
    trailDamp: 0.92  // Controls trail length
};

// Camera control parameters
const cameraParams = {
  lockToWitch: false,
  currentWitchIndex: -1
};


const gui = new lil.GUI();
const flockingFolder = gui.addFolder("Flocking Controls");
flockingFolder.add(flockingParams, 'separationWeight',0,1,0.01);
flockingFolder.add(flockingParams, 'alignmentWeight',0,1,0.01);
flockingFolder.add(flockingParams, 'cohesionWeight',0,1,0.01);
flockingFolder.add(flockingParams, 'separationDist',0,3,0.1);
flockingFolder.add(flockingParams, 'neighborDist',0,10,0.1);
flockingFolder.add(flockingParams, 'maxSpeed',0, 1, 0.01);
flockingFolder.add(flockingParams, 'maxForce', 0, 0.1, 0.001);

const bloomFolder = gui.addFolder('Bloom');
bloomFolder.add(bloomParams, 'strength', 0, 3, 0.01).onChange(value => {
    if (bloomPass) bloomPass.strength = value;
});
bloomFolder.add(bloomParams, 'radius', 0, 1, 0.01).onChange(value => {
    if (bloomPass) bloomPass.radius = value;
});
bloomFolder.add(bloomParams, 'threshold', 0, 1, 0.01).onChange(value => {
    if (bloomPass) bloomPass.threshold = value;
});
bloomFolder.add(bloomParams, 'trailDamp', 0.5, 0.99, 0.01).onChange(value => {
    if (afterimagePass) afterimagePass.uniforms['damp'].value = value;
}).name('Trail Length');

gui.add(cameraParams, 'lockToWitch').name('Lock Camera to Witch').onChange(value => {
  if (value) {
    // Find a random witch
    const witches = boids.filter(b => b.isWitch);
    if (witches.length > 0) {
      cameraParams.currentWitchIndex = boids.indexOf(witches[Math.floor(Math.random() * witches.length)]);
      controls.enabled = false; // Disable orbit controls
      console.log('Locked to witch', cameraParams.currentWitchIndex);
    } else {
      console.log('No witches found!');
      cameraParams.lockToWitch = false;
    }
  } else {
    cameraParams.currentWitchIndex = -1;
    controls.enabled = true; // Re-enable orbit controls
  }
});

function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background
    setupBloom();

    // 3.5 HDRI
    // In your init() function, after scene setup:
    const exrLoader = new THREE.EXRLoader();
    exrLoader.load('rogland_clear_night_2k.exr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    // Apply as environment map (for reflections on materials)
    scene.environment = texture;
    
    // Optional: Use as background (skybox)
    // sceneWitches.background = texture;
    // sceneOrbs.background = texture;
    scene.background = texture;
    
    console.log('HDRI loaded');
    });

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector3();

    // 5. Loaders
    textureLoader = new THREE.TextureLoader();

    // 6. Add the boids
    loadWitchModel('Witch.glb', () => {
  // Create mix of witches and orbs
    for (let i = 0; i < 100; i++) {
        let x = boundingSphereRadius*(Math.random() - 0.5);
        let y = boundingSphereRadius*(Math.random() - 0.5);
        let z = boundingSphereRadius*(Math.random() - 0.5);
        const useWitch = Math.random() < 0.3; // 30% witches
        boids.push(new Boid(x, y, z, scene, 0.25, useWitch));
    }
    });
    
    // 6.1 Portal Manager


    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('mousedown', handleMouseDown, false); // Example of mouse event

    // 8. Lighting Setup
    setupLights();

    // 9. Sound
    audioLoader = new THREE.AudioLoader();
    const listener = new THREE.AudioListener();
    camera.add(listener);
    // audioLoader.load(soundFile, function(buffer) {
    //     // Audio loading is complete, you can now create and play sounds
    //     console.log('Audio file loaded:', soundFile);
      
    //     // Example: Create and play background music (non-positional)
    //     const backgroundSound = new THREE.Audio(listener);
    //     backgroundSound.setBuffer(buffer);
    //     backgroundSound.setLoop(true); // Optional: Loop the sound
    //     backgroundSound.setVolume(0.75); // Optional: Adjust the volume
    //     backgroundSound.play();
    //   }, function(xhr) {
    //     console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    //   }, function(error) {
    //     console.error('An error happened during the audio loading:', error);
    //   });

    animate(); // Start the animation loop
}

function animate(currentTime) {
    requestAnimationFrame(animate);
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Rotate the cube for demonstration
    for(let boid of boids){
        boid.flock(boids);
        boid.update(deltaTime);
        boid.borders(boundingSphereRadius, boundingSphereRadius, boundingSphereRadius);
    }

        // In your animate() function, add this before rendering:
    if (cameraParams.lockToWitch && cameraParams.currentWitchIndex >= 0) {
    const witch = boids[cameraParams.currentWitchIndex];
    
    // Position camera behind and above the witch
    const offset = new THREE.Vector3(0, 2, -5); // Adjust these values for camera position
    offset.applyQuaternion(witch.mesh.quaternion); // Rotate offset to match witch orientation
    camera.position.copy(witch.position).add(offset);
    
    // Look in the direction the witch is facing
    const lookAtPos = witch.position.clone().add(witch.velocity.clone().normalize().multiplyScalar(5));
    camera.lookAt(lookAtPos);
    }

    // portalManager.update(boids, sceneCubeSize, sceneCubeSize, sceneCubeSize);

    controls.update(); // Update controls (required for damping)
    
    // Render scene with selective bloom
    scene.traverse(darkenNonBloomed);
    bloomPass.strength = bloomParams.strength;
    bloomPass.radius = bloomParams.radius;
    bloomPass.threshold = bloomParams.threshold;
    composer.render();
    scene.traverse(restoreMaterial);
}

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function handleKeyDown(event) {
    // console.log('Key Down:', event.key);
    // // Example: Change camera position on key press
    // if (event.key === 'ArrowUp') {
    //     camera.position.z -= 0.5;
    // } else if (event.key === 'ArrowDown') {
    //     camera.position.z += 0.5;
    // }
}

function handleMouseDown(event) {
    // console.log('Mouse Down:', event.button);
    // // Example: Log which mouse button was pressed
    // switch (event.button) {
    //     case 0: console.log('Left mouse button'); break;
    //     case 1: console.log('Middle mouse button'); break;
    //     case 2: console.log('Right mouse button'); break;
    // }
}

function setupLights() {
    // 1. Ambient Light - Provides a base level of illumination
    ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    // 2. Directional Light - Simulates sunlight, has direction
    directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light, intensity 1
    directionalLight.position.set(5, 5, 5); // Position the light
    directionalLight.castShadow = true; // Enable shadows for this light
    directionalLight.shadow.mapSize.width = 1024; // Shadow map size
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5; // Shadow camera near plane
    directionalLight.shadow.camera.far = 20; // Shadow camera far plane
    scene.add(directionalLight);

    // 3. Point Light - Emits light from a single point in all directions
    pointLight = new THREE.PointLight(0xff0000, 2, 10); // Red light, intensity 2, distance 10
    pointLight.position.set(-2, 2, -2); // Position the light
    pointLight.castShadow = true;  // Point lights can cast shadows, but it's expensive.
    pointLight.shadow.mapSize.width = 512;
    pointLight.shadow.mapSize.height = 512;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 10;
    scene.add(pointLight);

    // Helper for directional light (optional, for visualization)
    // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
    // scene.add(directionalLightHelper);
    // const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    // scene.add(pointLightHelper);
}

// Call the init function to set up the scene
init();

// Helper functions for selective bloom
function darkenNonBloomed(obj) {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
    }
}

function restoreMaterial(obj) {
    if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
    }
}

function getMousePositionOnXYPlane(event, camera, renderer) {
    // Get the canvas bounds
    const rect = renderer.domElement.getBoundingClientRect();
    
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    mouse.z = 0;
    
    // Set up the raycaster from camera through mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Create a plane at Z=0 facing the camera
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    
    // Find intersection point with the plane
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);
    
    return intersectionPoint;
}

function getMousePositionOnXYPlaneAtZ(event, camera, renderer, zDepth = 0) {
    const rect = renderer.domElement.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Create plane at specified Z depth
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -zDepth);
    
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);
    
    return intersectionPoint;
}



function setupBloom() {
    // Create composer
    composer = new THREE.EffectComposer(renderer);
    
    // Add render pass (renders the scene normally first)
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Add bloom pass
    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        2.5,    // strength
        0.8,    // radius
        0.3     // threshold
    );
    composer.addPass(bloomPass);
}

// Load witch model (call this once before creating boids)
function loadWitchModel(path, callback) {
  if (!gltfLoader) {
    gltfLoader = new THREE.GLTFLoader();
  }
  
  gltfLoader.load(
    path,
    (gltf) => {
      witchModelCache = gltf;
      console.log('Witch model loaded successfully');
      if (callback) callback(gltf);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
      console.error('Error loading witch model:', error);
    }
  );
}
