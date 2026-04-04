/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 43 - Campfire
| 📅 Started      | 2025-10-20    
| 📅 Completed    | 2025-10-26        
| 🕒 Taken        | 3hrs of getting annoyed before I remembered to look up my old Errors project code 🤣                   
| 🤯 Concept      | Marshmallow people sitting cozily by a campfire... too close? 
| 🔎 Focus        | Working with animations again in Three.js

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Going for a cozy feel, but I ran myself out of time a little
Modelled and animated things in Blender
Found a nice poem that definitely captures my every camping holiday.
Spoken audio is me. How's my Sam Elliott accent coming along? 😅

Campfire by Sophia White

campfire: burning
thoughts: forming
visions: clearing

every eye is focusing
on the swaying rhythms
the wild sinuations
of the angry flames

hopes: lifting
eyes: drifting
worlds: shifting

every mind is wand'ring
to cloudy dreams unveiling
daringly they wonder
at the not-too-distant future

RESOURCES
- Claude to help me with speeding up the turnaround on the particle effects
- Ground mask: https://www.freepik.com/pikaso/image-editor?image=https%3A%2F%2Fimg.freepik.com%2Ffree-vector%2Fmodern-dark-black-watercolor-brush-stroke-white-background_1035-29339.jpg%3Ft%3Dst%3D1761473572%7Eexp%3D1761477172%7Ehmac%3D666a4bbf15d4771abd7347888359c71cd775717bc2d0f1292b9c965401eec4d0%26w%3D2000%26h%3D2000&title=modern+dark+black+watercolor+brush+stroke+on+white+background&from_element=resource_detail_post_download&item_type=vector&item_author=Harryarts&is_premium_item=false&is_ai_generated=false&tool=adjust
- Ground PBR textures: https://polyhaven.com/a/forest_leaves_02
- Royalty-free music from Pixabay🎵:
  - "Peaceful Serenade Guitar Instrumental" by Jesse Quinn: https://pixabay.com/music/solo-guitar-peaceful-serenade-guitar-instrumental-by-jesse-quinn-163655/
  - Subtle Campfire, CaganCelik (Freesound): https://pixabay.com/sound-effects/subtle-campfire-29540/
*/


let scene, camera, renderer, controls, canvas;
let cube; // Will hold our cube object
let gltfLoader, textureLoader, soundLoader;// loaders
let raycaster; 
let mouse;
const soundFile = "Campfire Poem.mp3";
let audioLoader, audioListener;
let marshmallowMan, tent, fire, campfire, log;
let marshmallowMen = [];
let animationMixers = [];
let animationMixer;
let emberSystem;

const audioSources = {
  ambience: null,
  poetry: null,
  music: null
};


// Store mixers for each clone
const mixers = [];

// Audio controls object for GUI
const audioControls = {
  ambienceEnabled: false,
  ambienceVolume: 0.75,
  poetryEnabled: false,
  poetryVolume: 0.8,
  musicEnabled: false,
  musicVolume: 0.25
};

let gui;

// Ember particle system
const particleCount = 200;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = [];
const lifetimes = [];
const maxLifetime = 8; // seconds






function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 5;
    camera.lookAt(0,0,0);

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(1080, 1080);
    renderer.setClearColor(0x000000); // Black background

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector3();

    // 5. Loaders
    gltfLoader = new THREE.GLTFLoader();
    textureLoader = new THREE.TextureLoader();


    // 6. Load the models
 
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load("forest_leaves_02_diffuse_1k.jpg"),
        roughnessMap: textureLoader.load("forest_leaves_02_rough_1k.jpg"),
        displacementMap: textureLoader.load("forest_leaves_02_disp_1k.png"),
        displacementScale: 0.1,  
        alphaMap: textureLoader.load("freepik__upload__77538_inverted.png"),
        transparent: true
    })

    const groundPlane = new THREE.PlaneGeometry(30, 30, 1000, 1000);
    const ground = new THREE.Mesh(groundPlane, groundMaterial);
    ground.rotation.x = -Math.PI/2
    scene.add(ground);
    loadModels();
    

    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('mousedown', handleMouseDown, false); // Example of mouse event

    // 8. Lighting Setup
    setupLights();

    // 9. Sound
    audioLoader = new THREE.AudioLoader();
    audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    
    loadAudio();
    gui = initGUI();

    initParticleSystem();

    animate(); // Start the animation loop
}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    animationMixers.forEach(mixer => {
        mixer.update(delta);
    });
    // animationMixer.update(delta);

   updateEmbers(delta);

    controls.update(); // Update controls (required for damping)
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
    // ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    // scene.add(ambientLight);

    // 2. Directional Light - Simulates sunlight, has direction
    // directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light, intensity 1
    // directionalLight.position.set(5, 5, 5); // Position the light
    // directionalLight.castShadow = true; // Enable shadows for this light
    // directionalLight.shadow.mapSize.width = 1024; // Shadow map size
    // directionalLight.shadow.mapSize.height = 1024;
    // directionalLight.shadow.camera.near = 0.5; // Shadow camera near plane
    // directionalLight.shadow.camera.far = 20; // Shadow camera far plane
    // scene.add(directionalLight);

    // 3. Point Light - Emits light from a single point in all directions
    pointLight = new THREE.PointLight(0xff0000, 2, 10); // Red light, intensity 2, distance 10
    pointLight.position.set(0,0.5,0); // Position the light
    pointLight.castShadow = true;  // Point lights can cast shadows, but it's expensive.
    pointLight.shadow.mapSize.width = 512;
    pointLight.shadow.mapSize.height = 512;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 10;
    scene.add(pointLight);

    pointLight = new THREE.PointLight(0xff0000, 2, 20); // Red light, intensity 2, distance 10
    pointLight.position.set(0,5,0); // Position the light
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

// Initialize GUI
function initGUI() {
  const gui = new lil.GUI();

  // Campfire Ambience controls
  const ambienceFolder = gui.addFolder('Campfire Ambience');
  ambienceFolder.add(audioControls, 'ambienceEnabled')
    .name('Enable')
    .onChange((value) => {
      if (audioSources.ambience) {
        value ? audioSources.ambience.play() : audioSources.ambience.pause();
      }
    });
  ambienceFolder.add(audioControls, 'ambienceVolume', 0, 1, 0.01)
    .name('Volume')
    .onChange((value) => {
      if (audioSources.ambience) {
        audioSources.ambience.setVolume(value);
      }
    });

  // Campfire Poetry controls
  const poetryFolder = gui.addFolder('Campfire Poetry');
  poetryFolder.add(audioControls, 'poetryEnabled')
    .name('Enable')
    .onChange((value) => {
      if (audioSources.poetry) {
        value ? audioSources.poetry.play() : audioSources.poetry.pause();
      }
    });
  poetryFolder.add(audioControls, 'poetryVolume', 0, 1, 0.01)
    .name('Volume')
    .onChange((value) => {
      if (audioSources.poetry) {
        audioSources.poetry.setVolume(value);
      }
    });

  // Campfire Music controls
  const musicFolder = gui.addFolder('Campfire Music');
  musicFolder.add(audioControls, 'musicEnabled')
    .name('Enable')
    .onChange((value) => {
      if (audioSources.music) {
        value ? audioSources.music.play() : audioSources.music.pause();
      }
    });
  musicFolder.add(audioControls, 'musicVolume', 0, 1, 0.01)
    .name('Volume')
    .onChange((value) => {
      if (audioSources.music) {
        audioSources.music.setVolume(value);
      }
    });

  return gui;
}


// Load audio files
function loadAudio() {
  // Campfire Ambience
  audioSources.ambience = new THREE.Audio(audioListener);
  audioLoader.load('subtle-campfire-29540.mp3', (buffer) => {
    audioSources.ambience.setBuffer(buffer);
    audioSources.ambience.setLoop(true);
    audioSources.ambience.setVolume(audioControls.ambienceVolume);
  });

  // Campfire Poetry
  audioSources.poetry = new THREE.Audio(audioListener);
  audioLoader.load('Campfire Poem.mp3', (buffer) => {
    audioSources.poetry.setBuffer(buffer);
    audioSources.poetry.setLoop(true);
    audioSources.poetry.setVolume(audioControls.poetryVolume);
  });

  // Campfire Music
  audioSources.music = new THREE.Audio(audioListener);
  audioLoader.load('peaceful-serenade-guitar-instrumental-by-jesse-quinn-163655.mp3', (buffer) => {
    audioSources.music.setBuffer(buffer);
    audioSources.music.setLoop(true);
    audioSources.music.setVolume(audioControls.musicVolume);
  });
}

function loadModels(){
    // campfire
    gltfLoader.load(
        'CampFire.glb',
        function(gltf) {
        campfire = gltf.scene;
        scene.add(campfire);
        // load once, clone thereafter
        
      }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function(error) {
        console.error('An error happened during loading the model', error);
      });


      // tents

      gltfLoader.load(
        'tent.glb',
        function(gltf) {
        tent = gltf.scene;
        for(let i = 0; i < 3; i++){
            let a = i*Math.PI*2 / 3 + Math.PI/6;
            let x = 15 * Math.cos(a);
            let z = 15 * Math.sin(a);
            let clone = tent.clone();
            clone.position.set(x,0,z);
            clone.lookAt(0,0,0);
            scene.add(clone);
        }
        // load once, clone thereafter
        
      }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function(error) {
        console.error('An error happened during loading the model', error);
      });

      // logs
      gltfLoader.load(
        'marshmallowLog.glb',
        function(gltf) {
        log = gltf.scene;
        for(let i = 0; i < 3; i++){
            let a = i*Math.PI*2 / 3 + Math.PI/6;
            let x = 6 * Math.cos(a);
            let z = 6 * Math.sin(a);
            let clone = log.clone();
            clone.position.set(x,0,z);
            clone.lookAt(0,0,0);
            scene.add(clone);
        }
        // load once, clone thereafter
        
      }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function(error) {
        console.error('An error happened during loading the model', error);
      });


    //   marcshmallow man with establishing mixers
      for(let i = 0; i < 3; i++){
        gltfLoader.load(
        'marshmallow.glb',
        function(gltf) {
            marshmallowMan = gltf.scene;
            let a = i * Math.PI * 2 / 3 + Math.PI/6;
            marshmallowMan.position.set(6*Math.cos(a),0,6*Math.sin(a));
            marshmallowMan.lookAt(0,0,0);
            
            // Find and reposition the marshmallow man
            // campfire.traverse((child) => {
            // if (child.isSkinnedMesh || child.name.includes('marshmallow')) {
            //     // Adjust position relative to parent
            //     child.position.y += 2; // or whatever offset you need
            // }
            // });
            
       
          const animMixer = new THREE.AnimationMixer(marshmallowMan);
          const animation = gltf.animations[0];
          const action = animMixer.clipAction(animation);
        //   action.time = gltf.animations[0].duration * i / count;
          action.play();
          animationMixers.push(animMixer);
            scene.add(marshmallowMan);
        }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function(error) {
        console.error('An error happened during loading the model', error);
      });
      }
      
            



}


function initParticleSystem(){
    // Initialize particles
for (let i = 0; i < particleCount; i++) {
  // Start at origin with slight random spread
  positions[i * 3] = (Math.random() - 0.5) * 2;
  positions[i * 3 + 1] = Math.random() * 3;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
  
  // Velocity: upward with slight random drift
  velocities.push({
    x: (Math.random() - 0.5) * 0.5,
    y: 1 + Math.random() * 2,
    z: (Math.random() - 0.5) * 0.5
  });
  
  // Random starting lifetime
  lifetimes.push(Math.random() * maxLifetime);
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Create ember texture
const canvas = document.createElement('canvas');
canvas.width = 32;
canvas.height = 32;
const ctx = canvas.getContext('2d');
const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
gradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
gradient.addColorStop(0.3, 'rgba(255, 100, 50, 1)');
gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 32, 32);
const emberTexture = new THREE.CanvasTexture(canvas);

// Particle material
const particleMaterial = new THREE.PointsMaterial({
  size: 0.1,
  map: emberTexture,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  vertexColors: true
});

// Add colors for fading effect
const colors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  colors[i * 3] = 1;     // R
  colors[i * 3 + 1] = 0.5; // G
  colors[i * 3 + 2] = 0.2; // B
}
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

emberSystem = new THREE.Points(particles, particleMaterial);
scene.add(emberSystem);
}

function updateEmbers(delta) {
  const positions = emberSystem.geometry.attributes.position.array;
  const colors = emberSystem.geometry.attributes.color.array;
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Update lifetime
    lifetimes[i] -= delta;
    
    // Reset particle if lifetime expired
    if (lifetimes[i] <= 0) {
      positions[i3] = (Math.random() - 0.5) * 2;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;
      
      velocities[i] = {
        x: (Math.random() - 0.5) * 0.5,
        y: 1 + Math.random() * 2,
        z: (Math.random() - 0.5) * 0.5
      };
      
      lifetimes[i] = maxLifetime;
    }
    
    // Update position
    positions[i3] += velocities[i].x * delta;
    positions[i3 + 1] += velocities[i].y * delta;
    positions[i3 + 2] += velocities[i].z * delta;
    
    // Add slight random drift
    positions[i3] += (Math.random() - 0.5) * 0.02;
    positions[i3 + 2] += (Math.random() - 0.5) * 0.02;
    
    // Fade out based on lifetime
    const life = lifetimes[i] / maxLifetime;
    const alpha = life * life; // Quadratic fade
    colors[i3] = 1 * alpha;
    colors[i3 + 1] = 0.5 * alpha;
    colors[i3 + 2] = 0.2 * alpha;
  }
  
  emberSystem.geometry.attributes.position.needsUpdate = true;
  emberSystem.geometry.attributes.color.needsUpdate = true;
}