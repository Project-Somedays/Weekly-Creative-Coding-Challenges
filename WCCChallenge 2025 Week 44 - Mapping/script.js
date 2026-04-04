/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 44 - Mapping
| 📅 Started      | 2025-11-02      
| 📅 Completed    | 2025-11-02        
| 🕒 Taken        | 4hrs of fighting Claude... only to realise after using an axis helper that the problem was me 😅                    
| 🤯 Concept      | Scanbot gathers important data on the topography of the land
| 🔎 Focus        | Raycasting and shaders... that I blindly used Claude to generate

Made Scanbot in Blender based on this reference image 😍: https://au.pinterest.com/pin/68749424330/
Taking general inspiration from stuff I've seen on instagram with little scrolling animations

I think Scanbot could probably use a bit more personality... Maybe I'll come back one day.
Pretty pleased with the overall result though!

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

RESOURCES
- Claude, my nemesis and saviour


*/


let scene, camera, renderer, controls, canvas;
// Will hold our cube object
let gltfLoader, textureLoader, soundLoader;// loaders
let raycaster; 
let mouse;
let groundplane, topoplane;
const planeHeight = 10;
const simplexNoise = new SimplexNoise();
// const soundFile = ;

// prototyping variables
const noiseParams = {
    scale: 0.25,
    amplitude: 1,
    timeOffset: 0.5, // Slow evolution
    octaves: 3,                 // More detail
    persistence: 0.5,
    lacunarity: 2
}

const scanParams = {
    sweepSpeed: 0.5,
    sweepAmount: 0.4  // How far they wander within their segment (0-0.5, where 0.5 = full segment width)
};

let scanLines, updateLines;

const botPosition = { x: 0, y: 7.5, z: 0.45*planeHeight };
let scanBot;


const gui = new lil.GUI();
const noiseFolder = gui.addFolder("Noise Params"); 
noiseFolder.add(noiseParams, 'scale', 0.01, 1.0, 0.01);
noiseFolder.add(noiseParams, 'amplitude', 0.1, 2, 0.1);
noiseFolder.add(noiseParams, 'timeOffset', 0.01, 1, 0.01);
noiseFolder.add(noiseParams, 'octaves', 1, 5, 1);
noiseFolder.add(noiseParams, 'persistence', 0.01, 1, 0.01);
noiseFolder.add(noiseParams, 'lacunarity', 0.1, 5, 0.1);

const scanFolder = gui.addFolder("Scan Lines");
scanFolder.add(scanParams, 'sweepSpeed', 0.1, 2.0, 0.1);
scanFolder.add(scanParams, 'sweepAmount', 0.1, 0.5, 0.05);







function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    const aspect = 1.0; //window.innerWidth / window.innerHeight;
	const frustumSize = 10;
	camera = new THREE.OrthographicCamera(
	    -frustumSize * aspect / 2,  // left
	    frustumSize * aspect / 2,   // right
	    frustumSize / 2,            // top
	    -frustumSize / 2,           // bottom
	    0.1,                        // near
	    1000                        // far
	);
	camera.position.set(-8, 10, 8);
	// camera.zoom = 0.1;
	camera.updateProjectionMatrix();

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
    controls.target.set(1.5, 2.5, -1.5);
    controls.update();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector3();

    const axisHelper = new THREE.AxesHelper(5); // 5 is the size
    // scene.add(axisHelper);

    // 5. Loaders
    gltfLoader = new THREE.GLTFLoader();
    textureLoader = new THREE.TextureLoader();

    // 6. Add planes
    scanLineMaterial.uniforms.scanX.value = -planeHeight * 0.45;
    groundplane = new THREE.Mesh(
        new THREE.PlaneGeometry(planeHeight, planeHeight, 200, 200),
        scanLineMaterial
        // new THREE.MeshStandardMaterial({color: new THREE.Color(0x2e8c57)})
    )
    
    groundplane.rotation.x = -Math.PI/2;
    
    scene.add(groundplane)

    topoplane = new THREE.Mesh(
        new THREE.PlaneGeometry(planeHeight, planeHeight, 1, 1, 1),
        topoMaterial
    )
    topoMaterial.uniforms.terrainData = { value: null };

    topoplane.position.x = 5;
    topoplane.position.y = 5;
    topoplane.rotation.y = -Math.PI/2;
    scene.add(topoplane);

    ({ scanLines, updateLines } = createAndUpdateScanLines(
    groundplane,
    16,
    botPosition  // Just pass the reference, we'll use scanBot.position dynamically
));

    

    // Load the biz
    gltfLoader.load(
        'ScanBot.glb',
        function(gltf) {
        scanBot = gltf.scene;
        scanBot.position.set(botPosition.x, botPosition.y, botPosition.z);
        scene.add(scanBot);
        // load once, clone thereafter
        
      }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function(error) {
        console.error('An error happened during loading the model', error);
      });

    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    // document.addEventListener('mousedown', handleMouseDown, false); // Example of mouse event

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

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    
    applySimplexHeightMap(groundplane.geometry, simplexNoise, {
        scale : noiseParams.scale,        // Noise sampling scale (smaller = larger features)
        amplitude : noiseParams.amplitude,      // Height of deformation
        timeOffset : elapsedTime * noiseParams.timeOffset,     // For animation - shift noise in 3D space
        octaves : noiseParams.octaves,        // Number of noise layers (for fractal noise)
        persistence : noiseParams.persistence,  // Amplitude multiplier per octave
        lacunarity : noiseParams.lacunarity 
    });

    // update the topographic map
    const positions = groundplane.geometry.attributes.position;
    const segmentsX = 200; // Match your PlaneGeometry segments
    const segmentsY = 200;
    const resolutionX = segmentsX + 1; // 201 vertices
    const resolutionY = segmentsY + 1; // 201 vertices

    const heightData = new Float32Array(resolutionX * resolutionY);

    // Map vertices correctly - PlaneGeometry creates vertices row by row
    // Each row goes along X, rows go along Y
    for (let row = 0; row < resolutionY; row++) {
    for (let col = 0; col < resolutionX; col++) {
        const vertexIndex = row * resolutionX + col;
        heightData[vertexIndex] = positions.getZ(vertexIndex);
    }
    }

    // Create/update data texture
    if (!topoMaterial.uniforms.terrainData.value) {
    const dataTexture = new THREE.DataTexture(
        heightData,
        resolutionX,
        resolutionY,
        THREE.RedFormat,
        THREE.FloatType
    );
    dataTexture.minFilter = THREE.LinearFilter;
    dataTexture.magFilter = THREE.LinearFilter;
    dataTexture.needsUpdate = true;
    topoMaterial.uniforms.terrainData.value = dataTexture;
    } else {
    topoMaterial.uniforms.terrainData.value.image.data = heightData;
    topoMaterial.uniforms.terrainData.value.needsUpdate = true;
    }
    
    // spin props
    if(scanBot){
        scanBot.position.y = 7.5 + 0.1*Math.sin(5*elapsedTime);
        scanBot.children[0].children[10].rotation.y += 0.5; // large props
        scanBot.children[0].children[11].rotation.y += 0.5; // small props
    }

    updateLines(elapsedTime);

    controls.update(); // Update controls (required for damping)
    renderer.render(scene, camera);
}

function handleWindowResize() {
    const aspect = 1.0 //window.innerWidth / window.innerHeight;
    const frustumSize = 10; // Adjust this to control how "zoomed in" you are
    
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    
    camera.updateProjectionMatrix();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(1080, 1080);
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





function showFPS() {
  const fpsDisplay = document.createElement('div');
  fpsDisplay.style.position = 'absolute';
  fpsDisplay.style.top = '10px';
  fpsDisplay.style.left = '10px';
  fpsDisplay.style.color = 'white';
  fpsDisplay.style.fontFamily = 'monospace';
  fpsDisplay.style.fontSize = '16px';
  fpsDisplay.style.background = 'rgba(0,0,0,0.5)';
  fpsDisplay.style.padding = '5px 10px';
  fpsDisplay.style.zIndex = '1000';
  document.body.appendChild(fpsDisplay);
  
  let lastTime = performance.now();
  let frames = 0;
  
  function updateFPS() {
    frames++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (currentTime - lastTime));
      fpsDisplay.textContent = `FPS: ${fps}`;
      frames = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(updateFPS);
  }
  
  updateFPS();
}

// Call once at startup
// showFPS();


  
function handleKeyDown(event) {
    if (event.key === 'p') {  // Press 'p' to print camera settings
        console.log('Camera position:', camera.position);
        console.log('Controls target:', controls.target);
        console.log('Camera zoom:', camera.zoom);
    }
}
  
