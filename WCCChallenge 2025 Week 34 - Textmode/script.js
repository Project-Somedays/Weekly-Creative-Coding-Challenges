/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 34 - Textmode 
| 📅 Started      | 2025-08-24        
| 📅 Completed    | 2025-08-24        
| 🕒 Taken        | ~2.5hrs                                  
| 🤯 Concept      | Spheres morphing into letters within a radius of influence of the mouse       
| 🔎 Focus        | Controlling Shapekeys in three.js        

Been spending a LOT of time in Blender lately and thought I'd combine my two loves in one 😍
Spent a happy half hour converting letters to text and applying shapekeys before I realised the whole alphabet was getting resource hungry.
Next stop: attempting it with geometry nodes (??). 
Sidenote: turns out coming at things with a coding background is super helpful for wrangling nodes

Claude.ai helped with some *ahem* a LOT of the unfamiliar syntax 😅 

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph

See other submissions here: https://openprocessing.org/curation/78544

Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

*/

let scene, camera, renderer, controls, canvas;
let cube; // Will hold our cube object
let objLoader, textureLoader, soundLoader;// loaders
// const soundFile = ;
let params, gui;
const letterPaths = "WCCCHALLENGETEXTMODE".split("").map(each => each + ".glb"); //FGHIJKLMNOPQRSTUVWXYZ
const palette = "#f94144, #f3722c, #f8961e, #f9844a, #f9c74f, #90be6d, #43aa8b, #4d908e, #577590, #277da1".split(", ").map(each=> new THREE.Color(each));
let allLetters;
const cols = 15;
console.log(letterPaths);
let loadedMesh, morphTargetSphereInfluence;
const TWO_PI = Math.PI*2.0;
let raycaster; 
let mouse; 

const chooseRandom = (arr) => arr[Math.floor(Math.random()*arr.length)];

function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 10  ;

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight));
    renderer.setClearColor(0x000000); // Black background
    

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector3();
 

    // 4.1 GUI
    gui = new lil.GUI();
    
    setUpGUI();
    

    
    // 5. Loaders
    gltfLoader = new THREE.GLTFLoader();
    textureLoader = new THREE.TextureLoader();
    allLetters = new THREE.Group();

    // 6 Loading in the letter models as a grid
    let currentIx = 0;
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < cols; j++){
            // let letter = chooseRandom(letterPaths);
            let letter = letterPaths[currentIx]
            currentIx = (currentIx + 1)%letterPaths.length; // wrap around
            let colour = chooseRandom(palette);
            console.log(`Loading up letter ${letter} -> ${colour}`);
            let x = -cols/2 + j + 0.5;
            let y = -cols/2 + i + 0.5;
            loadBiz(colour, letter, x, y);
        }
    }

    scene.add(allLetters); 

    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('mousedown', handleMouseDown, false); // Example of mouse event
    renderer.domElement.addEventListener('mousemove', (event) => {
        mouse = getMousePositionOnXYPlane(event, camera, renderer);
        // console.log('Mouse world position:', mouse.x, mouse.y);
        // Use the position for your objects
        // someObject.position.x = worldPosition.x;
        // someObject.position.y = worldPosition.y;
    });
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

    
   if(params.rotateMode){
    allLetters.children.forEach((letter) => {
        letter.rotation.x += TWO_PI / 300;
        letter.rotation.y += TWO_PI / 300;
        letter.rotation.z += TWO_PI / 300;
    })
   }

   // checkProximity and set value accordingly
   if(!params.masterControlMode){
     for(letter of allLetters.children){
        let d = mouse.distanceTo(letter.position);
        if(d > params.influenceRadius) continue; // outside the sphere? ignore!
        let normD =d/params.influenceRadius;
        let value = normD **2; //  quadratic falloff
        setShapekeyValue(letter, value);
        }
   }
  
    // for(let i = 0; i < cols*cols; i++){
        
    // }

    controls.update(); // Update controls (required for damping)
    renderer.render(scene, camera);
}

function handleWindowResize() {
    // camera.aspect = window.innerWidth / window.innerHeight;
    camera.aspect = 1
    camera.updateProjectionMatrix();
    renderer.setSize(Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight));

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
    // Example: Log which mouse button was pressed
    switch (event.button) {
        // case 0: console.log('Left mouse button'); break;
        // case 1: console.log('Middle mouse button'); break;
        // case 2: console.log('Right mouse button'); break;
    }
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

function loadBiz(colour, letter, x, y){
    gltfLoader.load(
        letter,
        // --- On Load Callback ---
        function (gltf) {
            console.log('Model loaded successfully!', gltf);
            let newLocalScene = gltf.scene;

            newLocalScene.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({color: colour});
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.needsUpdate = true;
                }
            });

            newLocalScene.position.set(x, y, 0);
            newLocalScene.rotation.set(Math.random()*TWO_PI, Math.random()*TWO_PI, Math.random()*TWO_PI); // randomise rotation;
            setShapekeyValue(newLocalScene, 1);
            allLetters.add(newLocalScene);
            
        },
        // --- On Progress Callback ---
        function (xhr) {
            const percentLoaded = (xhr.loaded / xhr.total) * 100;
            console.log('Model ' + percentLoaded.toFixed(2) + '% loaded');
        },
        // --- On Error Callback ---
        function (error) {
            // console.error('An error happened while loading the model', error);
            // loadingScreen.style.backgroundColor = '#880000'; // Indicate error
            // loadingScreen.innerHTML = 'Error loading model. Check console for details.';
        }
    );
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

function setShapekeyValue(letter, value){
    if(letter.children[0].morphTargetInfluences) {
            letter.children[0].morphTargetInfluences[0] = value;
    }
}

function setAllShapekeys(value){
    for(letter of allLetters.children){
        setShapekeyValue(letter, value);
    }
}

function setUpGUI(){
    params = {
        masterControlMode: false,
        shape: 1,
        rotateMode: true,
        influenceRadius: 2
    }

    gui.add(params, 'masterControlMode');
    
    gui.add(params, 'shape', 0, 1, 0.01).onChange((value) => {
                // Update the morph target influence
                if(!params.masterControlMode) return;
                setAllShapekeys(value)
                
            });
            
    gui.add(params, 'rotateMode').onChange((value) => {
       for(letter of allLetters.children){
            if(!value)
                {
                    letter.rotation.set(0,0,0)
                } else {
                    letter.rotation.x = Math.random()*TWO_PI;
                    letter.rotation.y = Math.random()*TWO_PI;
                    letter.rotation.z = Math.random()*TWO_PI;
                }
        } 
    });

    gui.add(params, 'influenceRadius', 0.1, cols, 0.1);
}

