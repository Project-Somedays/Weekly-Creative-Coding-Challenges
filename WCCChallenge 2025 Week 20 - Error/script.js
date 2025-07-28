/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 20 - Errors
| 📅 Started      | 2025-05-18        
| 📅 Completed    | 2025-05-18        
| 🕒 Taken        | ~4hrs                                  
| 🤯 Concept      | Opening Pandora's Box of Computer Errors        
| 🔎 Focus        | Importing and playing animations from Blender 🤯        


Made for Sableraph's weekly creative coding challenges, reviewed weekly on [https://www.twitch.tv/sableraph](https://www.twitch.tv/sableraph)

See other submissions here: [https://openprocessing.org/curation/78544](https://openprocessing.org/curation/78544)

Join The Birb's Nest Discord community! [https://discord.gg/g5J6Ajx9Am](https://discord.gg/g5J6Ajx9Am)

Massively run out of time for the challenge, but I think I'll make the effort to finish this one off:

1. Opening Pandora's Box will FLOOD out a massive spiral of spinning wheels of death
2. Loads more cultists - ran into a heap of troubles duplicating the cultists with their animations. More learning necesssary.
3. Make a cool environment
*/

let scene, camera, renderer, controls, canvas;
let clock;
let cube; // Will hold our cube object
let gltfLoader, textureLoader, soundLoader;// loaders
let boxes;
let chest;
let cultistModel;
let cultists = [];
let mixers = [];
let t = 0;
const cycleFrames = 250;
let currentFrame = 0;
let cycleFrame = 0;
let isOpening = true;
let mixer;
let wheel;
let wheels;
let wheelStart, wheelEnd;
let floorAlphaTexture;
let floor;
const soundFile = "cosmic-vibrational-harmony-om-chanting-234041.mp3" ;
let currentAngle = 0;

let params, gui;

gui = new lil.GUI();
params = {
  autoRotate: true,
  revolutionFrames: 900,
  orbitRadius: 20,
  camHeight: 10
}
gui.add(params, 'autoRotate');
gui.add(params, 'revolutionFrames', 300, 1500, 1);
gui.add(params, 'orbitRadius', 1.0, 30.0, 0.5);
gui.add(params, 'camHeight', 1.0, 20.0, 0.5)



function init() {

    // 1. Scene setup
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // 2. Camera setup
    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 1000);
    camera.position.z = 5;
    camera.position.x = 5;
    camera.position.y = 5;
    camera.lookAt(new THREE.Vector3(0,0,0));

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(1080, 1080);
    renderer.setClearColor(0x000000); // Black background
    renderer.domElement.style.cursor = 'none'; // can turn the cursor off

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;

    // 5. Loaders
    gltfLoader = new THREE.GLTFLoader();
    textureLoader = new THREE.TextureLoader();

    floorAlphaTexture = textureLoader.load("alpha.webp");
    

    // 6. Load Chest
    loadChest();

    // 6.1 Load Computer Cultist
    createCultistRings();

// 6.2 Wheel of death
   loadWheelOfDeath();

// 6.3 Floor
const floorTexture = textureLoader.load("modern-wall-tiles.jpg");
floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({map: floorTexture, alphaMap: floorAlphaTexture, transparent: true})
)


floor.rotation.x = -Math.PI/2;
scene.add(floor);

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
    audioLoader.load(soundFile, function(buffer) {
        // Audio loading is complete, you can now create and play sounds
        console.log('Audio file loaded:', soundFile);
      
        // Example: Create and play background music (non-positional)
        const backgroundSound = new THREE.Audio(listener);
        backgroundSound.setBuffer(buffer);
        backgroundSound.setLoop(true); // Optional: Loop the sound
        backgroundSound.setVolume(0.75); // Optional: Adjust the volume
        backgroundSound.play();
      }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function(error) {
        console.error('An error happened during the audio loading:', error);
      });

    animate(); // Start the animation loop
}

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
     // Update cultist animations
    if(mixers && mixers.length > 0) mixers.forEach(mixer => mixer.update(deltaTime));
   
    
    currentFrame++
    // t = currentFrame * Math.PI * 2 / cycleFrames;
    cycleFrame = (cycleFrame + 1)%cycleFrames;
    let prog = cycleFrame/cycleFrames; 
    if(cycleFrame === 0) isOpening = !isOpening;

    // Rotate the cube for demonstration
    if(chest){
      let t = Math.min(1, 6 * prog);
        chest.children[0].children[0].rotation.x = isOpening ? -Math.PI * EasingFunctions.easeOutBounce(t) : -Math.PI + Math.PI*EasingFunctions.easeOutBounce(t);
    }

    if (wheel && wheelStart && wheelEnd) {
      const start = isOpening ? wheelStart : wheelEnd;
      const end = isOpening ? wheelEnd : wheelStart;
      wheel.position.copy(new THREE.Vector3().lerpVectors(start, end, EasingFunctions.easeOutElastic(prog)));
      wheel.rotation.x += 0.03;
      wheel.rotation.y -= 0.03;
      wheel.rotation.z += 0.03;
      wheel.children[0].rotation.y -= 0.25;
    }

    if(params.autoRotate){
      currentAngle = currentFrame * Math.PI * 2 / params.revolutionFrames;
      camera.position.x = params.orbitRadius * Math.sin(currentAngle);
      camera.position.z = params.orbitRadius* Math.cos(currentAngle);
      camera.position.y = params.camHeight;
      camera.lookAt(0,0,0);
    } else {
      controls.update(); // Update controls (required for damping)
    }
    

    
    renderer.render(scene, camera);
}

function handleWindowResize() {
    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();
    // renderer.setSize(window.innerWidth, window.innerHeight);
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
    // scene.add(directionalLightHeleasper);
    // const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    // scene.add(pointLightHelper);
}

// Call the init function to set up the scene
init();



function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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




