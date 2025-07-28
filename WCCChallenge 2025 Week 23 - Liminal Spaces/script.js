let scene, camera, renderer, controls, canvas;
let cube; // Will hold our cube object
let objLoader, textureLoader, soundLoader;// loaders
let cubicleBlocks = []; // keep as an array so we can recycle easier
let floor, carpetMaterial;
const wallThick = 0.1;


const HALF_PI = Math.PI / 2;
const PI = Math.PI;
const TWO_PI = 2*PI;
const cos = Math.cos;
const sin = Math.sin;
const res = 21;
const repeatVal = 150;
let officeChairs, officeChair;
let computers, computer;
// const soundFile = ;

// all the models for offices
let officeBiz = {
    book: "Book.glb",
    chair: "chair.glb",
    coffee: "Coffee.glb",
    computer: "Computer.glb",
    flower: "Flower.glb",
    paperBig: "PaperPile_Big.glb",
    paperSmall: "PaperPile_Small.glb"
}

let officeModels = {};

let params, gui;
gui = new lil.GUI();
params = {
    speed: 0.005,
    moveMode: false
}
gui.add(params, 'speed', 0.0001, 0.01, 0.0001);
gui.add(params, 'moveMode');

function init() {

    // 1. Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 5, 15);

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 2.5;
    camera.position.z = 0;

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;

    // 5. Loaders
    gltfLoader = new THREE.GLTFLoader();
    textureLoader = new THREE.TextureLoader(); 

    // 6A. Plane
    loadCarpetTexture('dirty_carpet',function(material) {
    console.log('Carpet material ready!', material);
    
    // Use the material on your floor or carpet geometry
    const floorGeometry = new THREE.PlaneGeometry(150, 150);
    const floor = new THREE.Mesh(floorGeometry, material);
    floor.receiveShadow = true; // Enable shadow receiving
    floor.position.y = -0.5;
    floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    scene.add(floor);
});
    

    // 6. Cubicles
    for(let x = 0; x < res; x++){
        for(let z = 0; z < res; z++){
            let cubicleBlock = new CubicleBlock((-2*res + x * 3), 0, (-2*res + z * 3));
            cubicleBlocks.push(cubicleBlock);
            scene.add(cubicleBlock.group);
        }
    }
//    scene.add(testCubicle.group);
    
    // adding the chairs to the cubicles
    // load the models
    gltfLoader.load(
    'chair.glb',
    (gltf) => {
        // Find the first mesh in the GLTF scene
        let chairMesh = null;
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                chairMesh = child;
                return; // Use the first mesh found
            }
        });
        
        if (!chairMesh) {
            console.error('No mesh found in chair.glb');
            return;
        }
        
        // Create instanced mesh with the found geometry and material
        officeChairs = new THREE.InstancedMesh(
            chairMesh.geometry, 
            chairMesh.material, 
            4 * res * res
        );
        
        const dummy = new THREE.Object3D();
        let index = 0;
        
        for(let cubicleBlock of cubicleBlocks){
            for(let cubicle of cubicleBlock.group.children){
                if (index >= officeChairs.count) break; // Safety check
                
                // Get world position of the cubicle
                const worldPos = new THREE.Vector3();
                cubicle.getWorldPosition(worldPos);
                
                dummy.scale.set(0.66, 0.66, 0.66);
                dummy.position.copy(worldPos);
                dummy.position.y = -0.5; // Place on ground
                dummy.rotation.y = Math.random() * Math.PI * 2; // Use Math.PI * 2 instead of TWO_PI
                dummy.updateMatrix();
                
                officeChairs.setMatrixAt(index, dummy.matrix);
                index++;
            }
        }
        
        // Update the instance matrix
        officeChairs.instanceMatrix.needsUpdate = true;
        
        // Enable shadows if needed
        officeChairs.castShadow = true;
        officeChairs.receiveShadow = true;
        
        scene.add(officeChairs);
        console.log(`Added ${index} office chairs`);
    },
    (progress) => {
        console.log('Loading chair:', (progress.loaded / progress.total * 100) + '%');
    },
    (error) => {
        console.error('Error loading chair.glb:', error);
    }
);

    // 6B Computers - Fixed version
// gltfLoader.load(
//     'Computer.glb',
//     (gltf) => {
//         // Find the first mesh in the GLTF scene
//         let mesh = null;
//         gltf.scene.traverse((child) => {
//             if (child.isMesh) {
//                 mesh = child;
//                 return; // Use the first mesh found
//             }
//         });
        
//         if (!mesh) {
//             console.error('No mesh found in Computer.glb');
//             return;
//         }
        
//         // Create instanced mesh with the found geometry and material
//         // Fix 1: Create a computer variable, not reuse officeChairs
//         computer = new THREE.InstancedMesh(
//             mesh.geometry, 
//             mesh.material, 
//             4 * res * res
//         );
        
//         const dummy = new THREE.Object3D();
//         let index = 0;
        
//         for(let cubicleBlock of cubicleBlocks){
//             // Fix 2: Correct forEach syntax - (item, index) not (index, item)
//             cubicleBlock.group.children.forEach((cubicle, ix) => {
//                 // Fix 3: Check against computer.count, not officeChairs.count
//                 if (index >= computer.count) return; // Use return in forEach, not break
                
//                 // Get world position of the cubicle
//                 const worldPos = new THREE.Vector3();
//                 // Fix 4: Better error checking for desk position
//                 if (cubicle.children && cubicle.children.length > 0) {
//                     cubicle.children[cubicle.children.length-1].getWorldPosition(worldPos); //centre on the table
//                 } else {
//                     cubicle.getWorldPosition(worldPos); // Fallback to cubicle position
//                 }
                
//                 dummy.scale.set(0.1, 0.1, 0.1);
//                 dummy.position.copy(worldPos);
//                 dummy.position.y += 0.1; // Place slightly above the desk
//                 dummy.rotation.y = -ix * HALF_PI; // Rotate based on cubicle orientation
//                 dummy.updateMatrix();
                
//                 // Fix 5: Set matrix on computer, not officeChairs
//                 computer.setMatrixAt(index, dummy.matrix);
//                 index++;
//             });
//         }
        
//         // Update the instance matrix
//         computer.instanceMatrix.needsUpdate = true;
        
//         // Enable shadows if needed
//         computer.castShadow = true;
//         computer.receiveShadow = true;
        
//         // Fix 6: Add computer to scene, not officeChairs
//         scene.add(computer);
//         console.log(`Added ${index} computers`);
//     },
//     (progress) => {
//         console.log('Loading computer:', (progress.loaded / progress.total * 100) + '%');
//     },
//     (error) => {
//         console.error('Error loading Computer.glb:', error);
//     }
// );

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

    // move carpet texture
    if(params.moveMode){
        // Move texture in Z direction (adjust the divisor to match your texture scale)
        // Divide by texture repeat value
        // Also update other texture maps if they exist
        if(carpetMaterial){
            if(carpetMaterial.map) carpetMaterial.map.offset.z += params.speed / repeatVal;
            if(carpetMaterial.normalMap) carpetMaterial.normalMap.offset.z += params.speed / repeatVal;
            if(carpetMaterial.roughnessMap) carpetMaterial.roughnessMap.offset.z += params.speed / repeatVal;
            if(carpetMaterial.aoMap) carpetMaterial.aoMap.offset.z += params.speed / repeatVal;
        }

    // moving the cubicle blocks
    if(cubicleBlocks && cubicleBlocks.length > 0){
        for(let cubBlock of cubicleBlocks){
            cubBlock.update();
        }

        recycleCubicleBlocksAdvanced();
    }

    // Update chair positions to sync with moving cubicles
        if(officeChairs) {
            let index = 0;
            const dummy = new THREE.Object3D();
            
            for(let cubicleBlock of cubicleBlocks){
                for(let cubicle of cubicleBlock.group.children){
                    if (index >= officeChairs.count) break; // Safety check
                    
                    // Get world position of the cubicle
                    const worldPos = new THREE.Vector3();
                    cubicle.getWorldPosition(worldPos);
                    
                    // Set chair properties to match original setup
                    dummy.scale.set(0.66, 0.66, 0.66);
                    dummy.position.copy(worldPos); // Use copy, not clone
                    dummy.position.y = -0.5; // Place on ground
                    dummy.rotation.y = cubicle.rotation.y + (Math.PI * 2 * (index % 4) / 4); // Maintain original rotation pattern
                    dummy.updateMatrix();
                    
                    officeChairs.setMatrixAt(index, dummy.matrix);
                    index++;
                }
            }
            
            // Correct property name for updating instances
            officeChairs.instanceMatrix.needsUpdate = true;
        }
    }
    
    
    // for(let i = 0; i <testCubicle.update();

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
    // Example: Log which mouse button was pressed
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

    // spotlight
    // const light = new THREE.SpotLight(0xF4FDFF, 2.5, 15, Math.PI / 6, 0.5, 0.5);
    // light.position.set(0, 10, 0);
    // light.target.position.set(0, 0, 0);
    // scene.add(light);

    // 2. Directional Light - Simulates sunlight, has direction
    directionalLight = new THREE.DirectionalLight(0xF4FDFF, 1); // White light, intensity 1
    directionalLight.position.set(5, 5, 5); // Position the light
    directionalLight.castShadow = true; // Enable shadows for this light
    directionalLight.shadow.mapSize.width = 1024; // Shadow map size
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5; // Shadow camera near plane
    directionalLight.shadow.camera.far = 20; // Shadow camera far plane
    // directionalLight.
    scene.add(directionalLight);

    // // 3. Point Light - Emits light from a single point in all directions
    // pointLight = new THREE.PointLight(0xff0000, 2, 10); // Red light, intensity 2, distance 10
    // pointLight.position.set(-2, 2, -2); // Position the light
    // pointLight.castShadow = true;  // Point lights can cast shadows, but it's expensive.
    // pointLight.shadow.mapSize.width = 512;
    // pointLight.shadow.mapSize.height = 512;
    // pointLight.shadow.camera.near = 0.1;
    // pointLight.shadow.camera.far = 10;
    // scene.add(pointLight);

    // Helper for directional light (optional, for visualization)
    // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
    // scene.add(directionalLightHelper);
    // const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    // scene.add(pointLightHelper);
}

// Call the init function to set up the scene
init();


function loadCarpetTexture(basePath, onLoad) {
    const textureFiles = {
        diffuse: `${basePath}_diff_1k.jpg`,
        normal: `${basePath}_nor_dx_1k.png`,
        roughness: `${basePath}_rough_1k.png`,
        ao: `${basePath}_ao_1k.jpg`
    };
    
    // Create EXR loader for the roughness map
  
    
    const textures = {};
    let loadedCount = 0;
    const totalTextures = Object.keys(textureFiles).length;
    
    function checkComplete() {
        loadedCount++;
        if (loadedCount === totalTextures) {
            carpetMaterial = new THREE.MeshStandardMaterial({
                map: textures.diffuse,
                normalMap: textures.normal,
                roughnessMap: textures.roughness,
                aoMap: textures.ao,
                aoMapIntensity: 1.0,
                roughness: 1.0,
                metalness: 0.0
            });
            
            onLoad(carpetMaterial, textures);
        }
    }
    
    // Load regular textures with TextureLoader
    ['diffuse', 'normal', 'ao', 'roughness'].forEach(textureType => {
        textureLoader.load(
            textureFiles[textureType],
            function(texture) {
                console.log(`Loaded ${textureType} texture:`, textureFiles[textureType]);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(repeatVal, repeatVal);
                textures[textureType] = texture;
                checkComplete();
            },
            function(progress) {
                console.log(`Loading ${textureType}: ${(progress.loaded / progress.total * 100)}%`);
            },
            function(error) {
                console.error(`Error loading ${textureType} texture:`, error);
                textures[textureType] = null;
                checkComplete();
            }
        );
    });
    
   
}

function recycleCubicleBlocks() {
    const recycleDistance = 10; // Distance behind camera to recycle
    const moveDistance = res * 3; // Distance to move block forward (full grid length)
    
    for(let cubBlock of cubicleBlocks) {
        // If cubicle block has moved too far behind the camera, move it to the front
        if(cubBlock.group.position.z > camera.position.z + recycleDistance) {
            cubBlock.group.position.z -= moveDistance;
        }
    }
}

function recycleCubicleBlocksAdvanced() {
    const recycleDistance = 15; // Distance behind camera to recycle
    const spawnDistance = 15; // Distance ahead of camera to spawn
    
    // Find the furthest forward and furthest back cubicle blocks
    let furthestBack = null;
    let furthestBackZ = -Infinity;
    let furthestForward = null;
    let furthestForwardZ = Infinity;
    
    for(let cubBlock of cubicleBlocks) {
        const blockZ = cubBlock.group.position.z;
        
        if(blockZ > furthestBackZ) {
            furthestBackZ = blockZ;
            furthestBack = cubBlock;
        }
        
        if(blockZ < furthestForwardZ) {
            furthestForwardZ = blockZ;
            furthestForward = cubBlock;
        }
    }
    
    // If the furthest back block is too far behind camera, move it to the front
    if(furthestBack && furthestBackZ > camera.position.z + recycleDistance) {
        furthestBack.group.position.z = furthestForwardZ - 3; // Place 3 units ahead of current front
    }
}