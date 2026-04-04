/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 50 - Layers
| 📅 Started      | 2025-12-14      
| 📅 Completed    | 2025-12-14        
| 🕒 Taken        | 3ish hrs of tweaking/adding possible adjustments                     
| 🤯 Concept      | Make your own leaf texture and scatter it on a tree
| 🔎 Focus        | Canvas and making dynamic textures using Three.js

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Saw someone making a similar geometry nodes generator in blender and thought I could probably give that a go 🥰
Learned a few things about canvases in Three.js and about how vertex normals can be accessed

INSTRUCTIONS
1. Draw your leaf design - just try a squiggle to start with
2. Scatter the leaves!

Want to erase? Toggle eraseMode
Want to use a colour you've used before?
Just copy the hex code into the strokeColour box
Want to start over? Hit Clear Canvas

LEAF CONTROLS
- leafCount: How many leaf planes (Starts to chug big time at 5000 on my machine)
- leafClumping: In theory, 1 is supposed to group the leaves as far from the trunk as possible. Doesn't really work though 🤷
- leafSpread: How far out from the vertices the leaf planes can be
- leafSize: How big are the planes?
- leafMaxDiff: How much bigger is the largest leaf?

RESOURCES
- Claude (on a VERY tight leash and teaching me things as we go)
- "Trees No Leaves" (https://skfb.ly/6WZPK) by hamraj15 is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

Stretch Goals:
- When Jigglephysics/Wigglebones is patched for Blender 5.0, come back and make a womping willow generator 🌳
- Work out a nicer way of using lil-gui to store a palette of colours
*/


let scene, camera, renderer, controls, canvas;
let cube; // Will hold our cube object
let gltfLoader, textureLoader, soundLoader;// loaders
let raycaster; 
let mouse;
let currentColour;
let treeModel;
let leaves = [];
let clumping = 0.5;
let leafTexture;
const treeRadius = 80;
let drawingCanvas, drawingCtx;
let cursorCanvas, cursorCtx;
let isDrawing = false;
let canvasVisible = false;
let colorHistory = [];
let treeGroup = new THREE.Group();
// const soundFile = ;

// prototyping variables
let brushTools = {
    strokeColour: 0x10aa10,
    brushPixelSize: 25,
    clearDesign: clearDesign,
    drawLeafButton: drawLeafButton,
    confirmLeafDesign: confirmLeafDesign,
    eraseMode: false
}

let leafTools = {
    leafCount: 2000,
    leafSize: 10,
    leafClumping: 0.5,
    leafSpread: 10,
    leafMaxDiff: 10,
    rotateMode: true,
    rotateSpeed: 0.005
}

let gui = new lil.GUI();
let folderBrushTools = gui.addFolder("Brush Tools");


function addColorToHistory(col) {
    if (!colorHistory.includes(col)) {
        colorHistory.push(col);
        
        // Add a color preview for this color in the GUI
        const colorKey = `usedColor${colorHistory.length}`;
        brushTools[colorKey] = col;
        folderBrushTools.addColor(brushTools, colorKey)
            .name(`Used ${colorHistory.length}`)
            .onChange(selectedCol => {
                brushTools.strokeColour = selectedCol;
                currentColour = new THREE.Color(selectedCol);
            });
    }
}

folderBrushTools.add(brushTools, 'drawLeafButton').name("1. Draw a leaf design 🥬");
folderBrushTools.add(brushTools, 'confirmLeafDesign').name("2. Scatter the leaves! 🍃");
folderBrushTools.addColor(brushTools, 'strokeColour').onChange((col) => currentColour = new THREE.Color(col));
folderBrushTools.add(brushTools, 'brushPixelSize', 1, 50, 1).name("Brush size");
folderBrushTools.add(brushTools, 'clearDesign').name("Clear canvas 🐦‍🔥");
folderBrushTools.add(brushTools, 'eraseMode');


let folderLeafBiz = gui.addFolder("Leaf Biz");
folderLeafBiz.add(leafTools, 'leafCount', 100, 5000, 100).onChange( () => populateTreeWithLeaves(leafTexture));
// folderLeafBiz.add(leafTools, 'leafSize', 0, 5, 0.1).onChange( () => populateTreeWithLeaves(leafTexture));
folderLeafBiz.add(leafTools, 'leafClumping', 0, 1).onChange(val => {
    clumping = val;
    populateTreeWithLeaves(leafTexture);
});

folderLeafBiz.add(leafTools, 'leafSpread', 1, 30, 0.1).onChange(() => populateTreeWithLeaves(leafTexture));
folderLeafBiz.add(leafTools, 'leafSize', 1, 30, 0.1).onChange(() => populateTreeWithLeaves(leafTexture));
folderLeafBiz.add(leafTools, 'leafMaxDiff', 0, 30, 0.1).onChange(() => populateTreeWithLeaves(leafTexture));

gui.add(leafTools, 'rotateMode');
gui.add(leafTools, 'rotateSpeed', 0.001, 0.02, 0.001);

function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 120;
    camera.position.y = 60;
    camera.position.x = 60;

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background

    setupDrawingCanvas();


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

    // 6. Add a Cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // Load the biz
    gltfLoader.load(
        'Tree.glb',
        function(gltf) {
        treeModel = gltf.scene;
        // load once, clone thereafter
        treeGroup.add(treeModel);
        scene.add(treeGroup);
      }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function(error) {
        console.error('An error happened during loading the model', error);
      });

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

function animate() {
    requestAnimationFrame(animate);

    // make the leaves do the things
    // leaves.forEach(leaf => leaf.billboard(camera));
    if(treeGroup && leafTools.rotateMode){
        treeGroup.rotation.y += leafTools.rotateSpeed;
    }

    controls.update(); // Update controls (required for damping)
    renderer.render(scene, camera);
}

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




