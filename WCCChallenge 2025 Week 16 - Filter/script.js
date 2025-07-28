let scene, camera, renderer, controls, canvas;
let audio, backgroundSound, abductionSound, abductionMidwayPoint, ambientSpaceShipSound;
let objLoader, textureLoader; // loaders
let t = 0;
let alpacaPositions = [];
let sheepPositions = [];
const alpacaRatio = 0.025;
let sheepHerd = null;
let alpacaHerd = null;
let ufo = null;
let ufoPos;
let isAbducting = false;
let closestSheep, closestAlpaca, closestAminal;
let abductedSheepIndex = -1;
let abductedAlpacaIndex = -1;
let startingPositions = [];
let score = -1;
let escapedAlpacas = 0;
let abductedAlpacas = 0;
let abductedSheep = 0;
scoreElement = document.getElementById('score-container');

const cameraHeight = 10;
const herdCount = 500;
const audioLoader = new THREE.AudioLoader();
const soundFile = 'sheep-23761.mp3';
const abductionSoundFile = 'abduction-single-bass-107937-shortened';
const ambientSpaceshipFile = 'spaceship-ambient-27988.mp3';

function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
    camera.position.set(0, cameraHeight*1.5,-cameraHeight*2);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // 2.1 Audio listener
    const listener = new THREE.AudioListener();
    camera.add(listener); // Add the listener to the camera 

    // 2.2 Audio
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

    // 2.2.1
    audioLoader.load(abductionSoundFile, function(buffer) {
        // Audio loading is complete, you can now create and play sounds
        console.log('Audio file loaded:', abductionSoundFile);
      
        // Example: Create and play background music (non-positional)
        abductionSound = new THREE.Audio(listener);
        abductionSound.setBuffer(buffer);
        abductionMidwayPoint = buffer.duration/2;
        abductionSound.setLoop(false); // Optional: Loop the sound
        abductionSound.setVolume(0.5); // Optional: Adjust the volume
        
      }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function(error) {
        console.error('An error happened during the audio loading:', error);
      });

    // 2.2.2
    audioLoader.load(ambientSpaceshipFile, function(buffer) {
        // Audio loading is complete, you can now create and play sounds
        console.log('Audio file loaded:', ambientSpaceshipFile);
      
        // Example: Create and play background music (non-positional)
        ambientSpaceShipSound = new THREE.Audio(listener);
        ambientSpaceShipSound.setBuffer(buffer);
        ambientSpaceShipSound.setLoop(true); // Optional: Loop the sound
        ambientSpaceShipSound.setVolume(0.25); // Optional: Adjust the volume
        ambientSpaceShipSound.play();
        
      }, function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function(error) {
        console.error('An error happened during the audio loading:', error);
      });
    

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background
    

    // 3.1 Score biz
    
    updateScore();

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;

    // 5. Loaders
    objLoader = new THREE.OBJLoader();
    textureLoader = new THREE.TextureLoader();

    // 6. Adding objects to the scene
    calcuateInitialPlacements(0.05);
    console.log(`sheep: ${sheepPositions.length}, alpaca: ${alpacaPositions.length}`);

    initializeHerds(); // Call the async function to initialize the herds

    
    

    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    // document.addEventListener('mousedown', handleMouseDown, false); // Example of mouse event

    // 8. Lighting Setup
    setupLights();

    // 9. UFO
    ufo = new THREE.Group();
    lightBeam = new THREE.Mesh(
        new THREE.ConeGeometry(1,cameraHeight, 96, 1),
        new THREE.MeshStandardMaterial({color: 0xF5F5DC, transparent: true, opacity: 0.6, emissive: 0xF5F5DC})
    )
    lightBeam.position.y = -cameraHeight/2;
    ufo.add(lightBeam);

    async function addModelToGroup(objFile, textureFile, targetGroup) {
        const loadedModel = await loadModel(objFile, textureFile);
    
        if (loadedModel) {
            targetGroup.add(loadedModel);
            console.log('Model added to group:', loadedModel, targetGroup);
        } else {
            console.log('Failed to load model, not added to group.');
        }
    }
    
    // Example usage:
    scene.add(ufo);
    ufo.position.y = cameraHeight;
    
    async function initialize() {
        await addModelToGroup("UFO.obj", "UFOTexture.png", ufo);
    }
    
    initialize();


    animate(); // Start the animation loop
}



function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    

    if(ufo){
        ufo.rotation.y += 0.1;
    }

    if (sheepHerd) updateHerd(sheepHerd, sheepPositions.length, abductedSheepIndex, sheepPositions);
    if (alpacaHerd) updateHerd(alpacaHerd, alpacaPositions.length, abductedAlpacaIndex, alpacaPositions);

      // dealing with abductions
    if ( abductedSheepIndex !== -1){
        abductedSheepIndex = abduct(sheepHerd, abductedSheepIndex);
    }

    if(abductedAlpacaIndex !== -1){
        abductedAlpacaIndex = abduct(alpacaHerd, abductedAlpacaIndex);
    }
      

    controls.update(); // Update controls (required for damping)
    renderer.render(scene, camera);
}

function abduct(abuctedAnimalHerd, abductedAnimalIndex){
    if (abductedAnimalIndex !== -1 && abuctedAnimalHerd) {
        const dummy = new THREE.Object3D();
        abuctedAnimalHerd.getMatrixAt(abductedAnimalIndex, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
    
        // Make the abducted sheep follow the UFO's position (with a small offset if desired)
        const followSpeed = 0.1;
        const followDirection = new THREE.Vector3().subVectors(ufo.position, dummy.position).normalize();
        dummy.position.addScaledVector(followDirection, followSpeed);
        // get smaller
        dummy.scale.x -= 0.0025;
        dummy.scale.y -= 0.0025;
        dummy.scale.z -= 0.0025;

       
        dummy.rotation.x += 0.01;
        dummy.rotation.y += 0.01;
        dummy.rotation.z += 0.01;

        let endAbduction = false;
        // if it is abducted, do the biz?
        if(dummy.position.y >= cameraHeight || dummy.scale.x < 0.1){
            console.log('resetting abduction thing');
            dummy.scale.x = 0;
            dummy.scale.y = 0;
            dummy.scale.z = 0;
            // dummy.position.x = 0;
            // dummy.position.z = -10 + Math.floor(20 * Math.random());
            // abuctedAnimalHerd.setMatrixAt(abductedAnimalIndex, dummy.matrix);
            endAbduction = true;
        }
    
        dummy.updateMatrix();
        abuctedAnimalHerd.setMatrixAt(abductedAnimalIndex, dummy.matrix);
        abuctedAnimalHerd.instanceMatrix.needsUpdate = true;
        if(endAbduction) abductedAnimalIndex = -1; 
        console.log(abductedAnimalIndex);
        return abductedAnimalIndex;
      }
}

function updateHerd(herd, herdCount, abductedIndex, herdPositions){
    const dummy = new THREE.Object3D();
    const matrix = new THREE.Matrix4(); // Create a separate Matrix4

    for (let i = 0; i < herdCount; i++) {
        if(i === abductedIndex) continue;
        // Get the current matrix into our separate Matrix4 object
        herd.getMatrixAt(i, matrix);

        // Decompose the matrix into the dummy's properties
        matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        // Modify the dummy's position and rotation
        moveAminal(dummy, t, herdPositions[i].offset);

        // Update the matrix from the dummy's properties
        dummy.updateMatrix();

        // Set the updated matrix back to the InstancedMesh
        herd.setMatrixAt(i, dummy.matrix);
    }
    herd.instanceMatrix.needsUpdate = true;
}

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

async function setupLights() {
    // 1. Ambient Light - Provides a base level of illumination
    ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    // 2. Directional Light - Simulates sunlight, has direction
    directionalLight = new THREE.DirectionalLight(0xffffff, 2); // White light, intensity 1
    directionalLight.position.set(5, 5, 5); // Position the light
    directionalLight.castShadow = true; // Enable shadows for this light
    directionalLight.shadow.mapSize.width = 1024; // Shadow map size
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5; // Shadow camera near plane
    directionalLight.shadow.camera.far = 20; // Shadow camera far plane
    scene.add(directionalLight);

    // 3. Point Light - Emits light from a single point in all directions
    // pointLight = new THREE.PointLight(0xff0000, 2, 10); // Red light, intensity 2, distance 10
    // // pointLight.position.set(-2, 2, -2); // Position the light
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



function getClosestAnimalIndex(herd, herdCount, ufoPosition) {
    let closestIndex = -1;
    let minDistanceSquared = Infinity;
    const dummy = new THREE.Object3D();
    const position = new THREE.Vector3();
  
    for (let i = 0; i < herdCount; i++) {
      herd.getMatrixAt(i, dummy.matrix);
      position.setFromMatrixPosition(dummy.matrix);
  
      const distanceSquared = ufoPosition.distanceToSquared(position);
  
      if (distanceSquared < minDistanceSquared) {
        minDistanceSquared = distanceSquared;
        closestIndex = i;
      }
    }
    

  
    return {closestIndex: closestIndex, distanceSquared: minDistanceSquared};
  }

// Call the init function to set up the scene
init();


function calcuateInitialPlacements(alpacaRatio){
    sheepPositions = [];
    alpacaPositions = [];
    for(let i = 0; i < herdCount; i++){
        let a = Math.random() * Math.PI*2.0;
        let x = 2.0 * Math.floor(i/10) + 0.3*Math.cos(a);
        let z = -10 + 2.0 * (i % 10) + 0.3*Math.sin(a);
        if(Math.random() < alpacaRatio){
            alpacaPositions.push({x:x, z:z, offset: Math.random() * Math.PI * 2.0 });
        } else{
            sheepPositions.push({x:x, z:z, offset: Math.random() * Math.PI * 2.0 });
        }
    }
}


function moveAminal(aminalModel, t, offset){
    // aminalModel.rotation.x += 0.01;
    aminalModel.rotation.x = Math.sin(10*t + offset) * Math.PI/50;
    aminalModel.position.y = Math.abs(Math.sin(10*t + offset)) * 0.1;
    aminalModel.position.x -= 0.01;
}

function handleKeyDown(event) {
    // console.log('Key Down:', event.key);
    // Example: Change camera position on key press
    switch(event.key){
        case 'ArrowUp':
            ufo.position.z += 0.5;
            // camera.position.z -= 0.5;
            break;
        case 'ArrowDown':
            ufo.position.z -= 0.5;
            // camera.position.z += 0.5;
            break;
        case 'ArrowLeft':
            ufo.position.x += 0.5;
            // camera.position.x -= 0.5;
            break;
        case 'ArrowRight':
            ufo.position.x -= 0.5;
            // camera.position.x += 0.5;
            break;
        case ' ':
            closestSheep = getClosestAnimalIndex(sheepHerd, sheepPositions.length, ufo.position);
            closestAlpaca = getClosestAnimalIndex(alpacaHerd, alpacaPositions.length, ufo.position);
            if(closestSheep.distanceSquared < closestAlpaca.distanceSquared){
                abductedSheepIndex = closestSheep.closestIndex;
                abductedSheep ++;
                abductedAlpacaIndex = -1;
            } else{
                abductedAlpacaIndex = closestAlpaca.closestIndex;
                abductedSheepIndex = -1;
                abductedAlpacas ++;
            }
            updateScore();
        
            // if(abductedAlpacaIndex === -1 && abductedSheepIndex === -1) 
            abductionSound.play(); // don't play the sound if we're not done abducting
        default:
            break;
    }
}

// function handleMouseDown(event) {
//     console.log('Mouse Down:', event.button);
//     // Example: Log which mouse button was pressed
//     switch (event.button) {
//         case 0: console.log('Left mouse button'); break;
//         case 1: console.log('Middle mouse button'); break;
//         case 2: console.log('Right mouse button'); break;
//     }
// }

async function loadModel(objFile, textureFile) {
    try {
        const [model, texture] = await Promise.all([
            objLoader.loadAsync(objFile),
            textureLoader.loadAsync(textureFile)
        ]);

        console.log('Loaded Texture:', texture); // Check if texture loaded

        model.children[0].material = new THREE.MeshStandardMaterial({map: texture});
        
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        return null;
    }
}

async function populateHerd(objFile, textureFile, positions) {
    try {
        const model = await loadModel(objFile, textureFile);
        console.log('Model loaded successfully:', model, objFile);
        console.log('Model Children:', model.children); // Inspect the model structure

        if (!model || !model.children || model.children.length === 0 || !model.children[0].geometry || !model.children[0].material) {
            console.error('Invalid model structure for instancing.');
            return null;
        }

        const herd = new THREE.InstancedMesh(
            model.children[0].geometry,
            model.children[0].material,
            positions.length
        );
        scene.add(herd);

        const dummy = new THREE.Object3D();
        for (let i = 0; i < positions.length; i++) {
            dummy.position.set(positions[i].x, 0, positions[i].z);
            dummy.updateMatrix();
            herd.setMatrixAt(i, dummy.matrix);
        }
        herd.instanceMatrix.needsUpdate = true;

        return herd;
    } catch (error) {
        console.error('Error populating herd:', error);
        return null;
    }
}

async function initializeHerds() {
    alpacaHerd = await populateHerd("alpaca.obj", "alpacaTexture.png", alpacaPositions);
    sheepHerd = await populateHerd("sheep.obj", "sheepTexture.png", sheepPositions);

    console.log('Alpaca Herd:', alpacaHerd);
    console.log('Sheep Herd:', sheepHerd);
}

function playSound(soundFileName) {
    // Create a new Audio object, passing in the listener
    const sound = new THREE.Audio(listener);
  
    // Load the sound buffer
    audioLoader.load(
        soundFileName,
      // Callback when the sound is loaded
      function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false); // Set to true if you want it to loop
        sound.setVolume(0.5); // Adjust the volume as needed
        sound.play(); // Play the sound!
  
        // Optional: Remove the sound object from the scene after it finishes playing
        sound.onEnded = function () {
          sound.disconnect(); // Clean up the audio node
        };
      },
      // Optional: Callback for progress loading
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      // Optional: Callback for errors
      function (error) {
        console.error('An error happened loading the sound:', error);
      }
    );
  }

  function updateScore(){
    // score ++;
    console.log(`Updating score: ${score}`);
    scoreElement.innerHTML = `🦙abducted: ${abductedAlpacas}<br>🐏abducted: ${abductedSheep}<br>Score:${2*abductedAlpacas - 10*abductedSheep}`;
  }
