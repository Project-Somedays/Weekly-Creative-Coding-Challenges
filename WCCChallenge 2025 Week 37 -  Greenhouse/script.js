/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 37 - Greenhouse 
| 📅 Started      | 2025-09-13        
| 📅 Completed    | 2025-09-14        
| 🕒 Taken        | ~6hrs                                  
| 🤯 Concept      | Greenhouses are chill. Pixel art is chill. Pixel art + Greenhouse = chill squared?       
| 🔎 Focus        | Vibe-coded a pixel art shader and then practicing geometry nodes in Blender making assets   

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

📦 RESOURCES 📦
🎵 Lofi chill beat - Lo-Fi Postcard by Free_Audio_Library on Pixabay: https://pixabay.com/music/beats-lofi-chill-beat-lo-fi-postcard-366049/
*/

import {Asset} from './asset.js'

let scene, camera, renderer, controls, canvas;

let gltfLoader, audioLoader;// loaders
let ambientLight, directionalLight;
let composer;
let raycaster; 
let mouse;
let uniforms;
let model;
let greenhouseGroup;
let lastAnimationState = 'idle'; // Track animation state: 'idle', 'dropping', 'rising'
let resetScheduled = false;
const soundFile = "lofi-chill-beat-lo-fi-postcard-366049.mp3";
const greenhouseFile = "Greenhouse.glb";
const floorModels = [
    "CornPlanter1x1.glb",
    "Calamansi1x1.glb",
    "Tomato1x1.glb",
    "Pumpkin1x1.glb"
]

const wallHangings = [
    "Monstera.glb",
    "Rhipsalis.glb",
    "Flowers.glb"
]

const angles = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
const assets = [];
console.log('Assets array created:', assets); // Add this line
let globalTime = 0;
const startHeight = 6.0;



// choose a random element from an array
const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];


// prototyping variables
let params = {
    test: true,
    colour: new THREE.Color(0xffffff)
}
let gui = new lil.GUI(); 

function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 1000);
    // camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
    camera.position.set(-4, 3.5, 4);
    camera.lookAt(new THREE.Vector3(0,0,0));
    window.camera = camera;
    window.scene = scene;
    console.log('Camera exposed to window:', window.camera);
    

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(1080, 1080);
    renderer.setClearColor(0x000000); // White background

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector3();

    setupGUI();
    
    // 5. Loaders
    gltfLoader = new THREE.GLTFLoader();

    // Loading Greenhouse and starting the group
    greenhouseGroup = new THREE.Group();
    gltfLoader.load(
        greenhouseFile,
        function (gltf){
            model = gltf.scene;
            greenhouseGroup.add(model);
        }
    )
    
    // Loading the rest of the assets
   arrangeGreenhouse();
    

    scene.add(greenhouseGroup);
    

     // Define uniforms for the shader
    uniforms = {
        lightPosition: { value: new THREE.Vector3(0.0, 5.0, 5.0) },
        time: { value: 0.0 },
        // Set the resolution to a low value for the pixelation
        resolution: { value: new THREE.Vector2(0.5, 0.5) }
    };    

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

    // --- Set up EffectComposer for post-processing ---
    // 10. Shader biz
    // --- Set up EffectComposer for post-processing ---
    composer = new THREE.EffectComposer(renderer);
     // 1. Add a RenderPass for the main scene
    // This is the second key fix: pass false as the clear property to the RenderPass
    const renderPass = new THREE.RenderPass(scene, camera);
    // renderPass.clear = false;
    composer.addPass(renderPass);

    // 2. Set up the custom shader pass for the pixelation effect
    const pixelShader = {
        uniforms: {
            "tDiffuse": { value: null },
            "time": { value: 0.0 },
            "pixelSize": { value: 4.0 } // Adjust this value for more or less pixelation
        },
        vertexShader: document.getElementById('pixel-vertex-shader').textContent,
        fragmentShader: document.getElementById('pixel-fragment-shader').textContent
    };
    const pixelPass = new THREE.ShaderPass(pixelShader);
    pixelPass.renderToScreen = true; // Make sure this is the final pass
    composer.addPass(pixelPass);

    animate(); // Start the animation loop
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate the cube for demonstration
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    // greenhouseGroup.rotation.y += 0.01;
    // if(model) model.rotation.y += 0.01;
    globalTime++; // Increment frame counter
    
    // Update all assets with current time
    for(let asset of assets) {
        asset.update(globalTime);
    }
    // Check if we need to auto-reset after drop-out
    checkForAutoReset();

    controls.update(); // Update controls (required for damping)
    composer.render(scene, camera);
    // renderer.render(scene, camera);
}

function handleWindowResize() {
    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();
    // renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
        console.log('Triggering drop in')
        for(let asset of assets){
            asset.dropping = true;
            asset.trigger(globalTime);
        }
    } else if (event.key === 'ArrowUp') {
        console.log('trigger drop out');
        for(let asset of assets){
            asset.dropping = false;
            asset.trigger(globalTime);
        }
    } else if (event.key === 'r') { 
        // Manual reset
        console.log('Manual reset triggered');
        clearGreenhouse();
        setTimeout(() => {
            arrangeGreenhouse();
            lastAnimationState = 'idle';
            resetScheduled = false;
        }, 100);
    }
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
    directionalLight = new THREE.DirectionalLight(0xf1bd56, 3); // White light, intensity 1
    directionalLight.position.set(2.5, 5, 2.5); // Position the light
    directionalLight.castShadow = true; // Enable shadows for this light
    directionalLight.shadow.mapSize.width = 1024; // Shadow map size
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5; // Shadow camera near plane
    directionalLight.shadow.camera.far = 20; // Shadow camera far plane
    scene.add(directionalLight);
}

// Call the init function to set up the scene
init();

function setupGUI(){
 gui.add(params, 'test');
 gui.addColor(params, 'colour');  
}

function checkForAutoReset() {
    if (assets.length === 0) return; // No assets to check
    
    // Check if all assets are at rest and at their start positions (t = 0)
    const allAtRest = assets.every(asset => asset.isAtRest);
    const allAtStartPosition = assets.every(asset => asset.t === 0);
    const allAtEndPosition = assets.every(asset => asset.t === 1);
    
    // Detect state transitions
    if (allAtRest) {
        if (allAtStartPosition && lastAnimationState === 'rising' && !resetScheduled) {
            // All assets finished rising back to start - schedule reset
            console.log('All assets returned to start position. Scheduling reset...');
            resetScheduled = true;
            
            // Wait a moment then reset and rearrange
            setTimeout(() => {
                clearGreenhouse();
                setTimeout(() => {
                    arrangeGreenhouse();
                    resetScheduled = false;
                    lastAnimationState = 'idle';
                    console.log('Greenhouse reset complete!');
                }, 100);
            }, 500); // Wait 500ms before resetting
            
        } else if (allAtEndPosition) {
            lastAnimationState = 'dropped';
        } else if (allAtStartPosition) {
            lastAnimationState = 'idle';
        }
    } else {
        // Animation in progress - detect direction
        const anyDropping = assets.some(asset => asset.dropping);
        if (anyDropping) {
            lastAnimationState = 'dropping';
        } else {
            lastAnimationState = 'rising';
        }
    }
}



function clearGreenhouse(){
    // Remove all assets from the scene and clear the assets array
    for(let asset of assets){
        scene.remove(asset.model);
    }
    
    // Clear the assets array
    assets.length = 0; // This empties the array
    
    console.log('Greenhouse cleared, assets remaining:', assets.length);
}

function arrangeGreenhouse(){
    for(let x = -3; x <= 3.5; x+= 1.5){
        for(let z = -3; z <= 3.5; z+= 1.5){
            gltfLoader.load(
            choose(floorModels),
            function (gltf) {
                model = gltf.scene;
                model.rotation.y = choose(angles);
                let newAsset = new Asset(model, x, startHeight, z, x, 0, z);
                assets.push(newAsset);
                scene.add(newAsset.model);
                console.log('Asset added, total assets:', assets.length); // Add this line
                // greenhouseGroup.add(model);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('An error happened', error);
            }
        );
        }
    }

    // back wall assets
    for(let x = -3; x <=3; x += 1.5){
        for(let y = 1; y <=2; y++){
            gltfLoader.load(
            choose(wallHangings),
            function (gltf) {
                model = gltf.scene;
                model.rotation.y = -Math.PI / 2;
                model.scale.set(0.5, 0.5, 0.5);
                let newAsset = new Asset(model, x + 5, y + 5, -4, x, y, -4);
                assets.push(newAsset);
                scene.add(newAsset.model);
                console.log('Asset added, total assets:', assets.length); // Add this line
                // greenhouseGroup.add(model);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('An error happened', error);
            }
        );
        }
    }

    // right wall assets
    for(let z = -3; z <=3; z += 1.5){
        for(let y = 1; y <=2; y++){
            gltfLoader.load(
            choose(wallHangings),
            function (gltf) {
                model = gltf.scene;
                model.rotation.y = -Math.PI;
                model.scale.set(0.5, 0.5, 0.5);
                let newAsset = new Asset(model, 4, y + startHeight, z, 4, y, z);
                assets.push(newAsset);
                scene.add(newAsset.model);
                console.log('Asset added, total assets:', assets.length); // Add this line
                // greenhouseGroup.add(model);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('An error happened', error);
            }
        );
        }
    }

}
