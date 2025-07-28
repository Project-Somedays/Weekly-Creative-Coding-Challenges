let scene, camera, renderer, controls, canvas;
let cube; // Will hold our cube object
let objLoader, textureLoader, soundLoader;// loaders
// const soundFile = ;
let cultistModel;
let cultistAnimationMixer;

let cultistModelB, cultistAnimationMixerB;
let cultists = [];
let mixers = [];
const cultistCount = 3;
const clock = new THREE.Clock();

function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    createGradientBackground();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;

    // 5. Loaders
    gltfLoader = new THREE.GLTFLoader();
    textureLoader = new THREE.TextureLoader();

    // 6. Load the cultist
    loadCultists()
    // gltfLoader.load(
    //     'Cultist_Animated.glb',
    //     (gltf) => {
    //         cultistModel = gltf.scene;
    //         // console.log(cultistModel);
    //         // // const animationDuration = cultistModel.animations[0].duration;
    //         // // console.log(`Animation Duration: ${animationDuration}`);
    //         // for(let i = 0; i < cultistCount; i++){
    //         //     const cultist = cultistModel.clone();
    //         //     cultist.position.x = -cultistCount/2 + i;
    //         //     scene.add(cultist);
    //         //     const mixer = new THREE.AnimationMixer(cultistModel);
    //         //     const animation = cultist.animations[0];
    //         //     const action = mixer.clipAction(animation)
    //         //     action.time = i*animationDuration/cultistCount;
    //         //     action.play();
    //         //     cultists.push({
    //         //         model: cultist,
    //         //         mixer : new THREE.AnimationMixer(action)
    //         //     })
    //         // }
            
    //         scene.add(cultistModel);
    //         cultistModel.position.x = 3;
    //         cultistAnimationMixer = new THREE.AnimationMixer(cultistModel);
    //         const animation = gltf.animations[0];
    //         const action = cultistAnimationMixer.clipAction(animation);
    //         action.play();

    //         // cultistB = gltf.scene.clone();
    //         // cultistB.position.x = 3;
    //         // scene.add(cultistB); 
    //     }
    // )

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

function loadCultists(){
    for(let i = 0; i < cultistCount; i++){
        gltfLoader.load('Cultist_Animated.glb', (gltf) => {
            const cultist = gltf.scene;
            cultist.position.x = -cultistCount + 2*i; // positioning code goes here
            scene.add(cultist);
            const animMixer = new THREE.AnimationMixer(cultist);
            const animation = gltf.animations[0];
            const action = animMixer.clipAction(animation);
            action.time = gltf.animations[0].duration * i / cultistCount;
            action.play();
            mixers.push(animMixer);
        });
        
       
    }
   
}


function animate() {
    requestAnimationFrame(animate);
    // if(cultistAnimationMixer) cultistAnimationMixer.update(clock.getDelta());
    // if(cultists && cultists.length > 0){
    //     for(let thisCultist of cultists){
    //         thisCultist.mixer.update(clock.getDelta());
    //     }
    // }
    let deltaT = clock.getDelta()
    if(mixers && mixers.length > 0){
        for(let mixer of mixers){
            mixer.update(deltaT);
        } 
    }

    // Rotate the cube for demonstration
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    controls.update(); // Update controls (required for damping)
    renderer.render(scene, camera);
}

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleKeyDown(event) {
    console.log('Key Down:', event.key);
    // Example: Change camera position on key press
    if (event.key === 'ArrowUp') {
        camera.position.z -= 0.5;
    } else if (event.key === 'ArrowDown') {
        camera.position.z += 0.5;
    }
}

function handleMouseDown(event) {
    console.log('Mouse Down:', event.button);
    // Example: Log which mouse button was pressed
    switch (event.button) {
        case 0: console.log('Left mouse button'); break;
        case 1: console.log('Middle mouse button'); break;
        case 2: console.log('Right mouse button'); break;
    }
}

function setupLights() {
    // 1. Ambient Light - Provides a base level of illumination
    ambientLight = new THREE.AmbientLight(0x404040, 20); // Soft white light
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

function createGradientBackground() {
    // Create a canvas for the gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Create radial gradient
    const gradient = context.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,           // Inner circle (center)
        canvas.width / 2, canvas.height / 2, canvas.width / 2  // Outer circle
    );
    
    // Define gradient colors
    gradient.addColorStop(0, '#2a4a6b');    // Lighter navy blue in center
    gradient.addColorStop(1, '#0f1419');    // Deep navy blue at edges
    
    // Fill the canvas with the gradient
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create texture from canvas and set as scene background
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
}

