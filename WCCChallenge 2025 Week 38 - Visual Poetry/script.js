/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 38 - Visual Poetry 
| 📅 Started      | 2025-09-21      
| 📅 Completed    | 2025-09-21        
| 🕒 Taken        | Longer than it should have... using claude.ai but running into vibe-code-related "didn't quite think this through" nonsense 🤣                               
| 🤯 Concept      | Play with your alphabet soup! Also, it's a fun A. A. Milne poem
| 🔎 Focus        | Basic physics sim in Three.js for practice

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am
*/
let scene, camera, renderer, controls, canvas;
let textureLoader, soundLoader;// loaders
let raycaster; // user controls
let mouseIndicator;
let letters;

let meshes = [];
let letterPositions = [];

let meshesLoaded = false;
let t = 0;
let bobbingUp = false;
let isTransitioning;
let mouseWorldPos = new THREE.Vector3();


const AAMilne = "If I were John and John were me, he'd be six and I'd be three.\nBut if John were me and I were John, I shouldn't have these trousers on.\nA A Milne.";
const SteveWright = "Eagles may soar but weasels don't get sucked into jet engines.\nSteve Wright."
const Bush = "Our enemies are innovative and resourceful.\nAnd so are we.\nThey never stop thinking of new ways to harm our country and our people.\nAnd neither will we.\nGeorge Bush."
// const quote = "HELLO WORLD";

// GUI Biz
let params = {
    'updateSoup': updateSoup,
    quote: AAMilne,
    maxLineLim: 25,
    transitionFrames: 60,
    maxDepthOffset: 0.33,
    startingDepth: -5,
    maxVel: 0,
    maxPosOffset: 0,
    maxRotOffset: 0,
    maxAngular: 0,
    velDamping: 0.001,
    angularDamping: 0.005,
    colour: new THREE.Color(0xffffff),
    mouseRepelForce: 0.01,
    mouseRepelRadius: 1,
    mouseAngularForce: 0.2,
    letterCollisionRadius: 0.1,
    letterBounciness: 0.8,
    buoyancyDampening: 0.075,
    airResistance: 0.025,
    mouseInteractivity: true
}
let gui = new lil.GUI();

gui.addColor(params, 'colour').onChange(col => {
    let threeColour = new THREE.Color(col);
    for(let meshInfo of meshes){
        meshInfo.mesh.material.color = threeColour;
    }
}); 
gui.add(params, 'transitionFrames', 30, 300, 5);
gui.add(params, 'quote', {'AAMilne': AAMilne, 'Bush': Bush, 'Steve Wright': SteveWright}).onChange(newQuote => loadNewQuote(newQuote));
gui.add(params, 'maxLineLim', 10, 50, 1).onChange((newLineLim) => letterPositions = quoteToLetters(quote, 0.75, newLineLim,1, params.startingDepth));
gui.add(params, 'startingDepth', -5, 0, 0.25);
gui.add(params, 'maxPosOffset', 0, 0.01, 0.0005);
gui.add(params, 'maxRotOffset', 0, 0.2, 0.01);
gui.add(params, 'maxVel', 0, 0.01, 0.001);
gui.add(params, 'maxAngular', 0, 0.05, 0.001);
gui.add(params, 'velDamping', 0, 0.01, 0.0001);
gui.add(params, 'angularDamping', 0, 0.01, 0.0001);
gui.add(params, 'maxDepthOffset', 0, 1, 0.01);
gui.add(params, 'mouseRepelForce', 0, 0.1, 0.001);
gui.add(params, 'mouseRepelRadius', 0.5, 5, 0.1);
gui.add(params, 'mouseAngularForce', 0, 0.5, 0.01);
gui.add(params, 'letterCollisionRadius', 0.1, 1, 0.05);
gui.add(params, 'buoyancyDampening', 0, 0.1, 0.001);
gui.add(params, 'airResistance', 0, 0.05, 0.001);
gui.add(params, 'letterBounciness', 0, 1, 0.01).name('Letter Bounciness');
gui.add(params, 'mouseInteractivity');
gui.add(params, 'updateSoup').name("Update/Reset Soup"); 



async function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    createGradientBackground();

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    raycaster = new THREE.Raycaster();

    
    // 5. Loaders
    textureLoader = new THREE.TextureLoader();

    
    // load in letters
    letters = await loadLetterModels('Alphabet.glb');
    letterPositions = quoteToLetters(params.quote, 0.75, 20, 1.5, params.startingDepth);
    meshes = addLettersToScene(letterPositions, letters, scene);
    meshesLoaded = true;
    console.log("Added  all meshes to scene");
    // convert first sentence to letters


    // 6. Mouse Indicator
    mouseIndicator = new THREE.Mesh(
        new THREE.RingGeometry(0.1, 0.2, 16),
        new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 })
    );
    scene.add(mouseIndicator);
   
    
   

    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('mousedown', handleMouseDown, false); // Example of mouse event
    document.addEventListener('mousemove', handleMouseMove, false);

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

    if(!meshesLoaded){
        controls.update();
        renderer.render(scene, camera);
        return;
    }
    
    for(let i = 0; i < meshes.length; i++){
        let meshInfo = meshes[i];           
        
        // Handle transitions (pushing letters down)
        if(isTransitioning){
            let easedT = easeInOutElastic(t);
            let targetZ = THREE.MathUtils.lerp(meshInfo.equilibriumZ, params.startingDepth + meshInfo.depthOffset, easedT)  
            meshInfo.mesh.position.z = targetZ;
            meshInfo.velocity.z = 0; // Reset Z velocity during forced movement
        }

        // ############### MOUSE REPULSION #################### //
       if(params.mouseInteractivity){
            // Use mouseWorldPos instead of mouse
            let mouseDistance = new THREE.Vector3().subVectors(meshInfo.mesh.position, mouseWorldPos);
            let distance = mouseDistance.length();
            
            if(distance < params.mouseRepelRadius && distance > 0) {
                // Normalize and apply repulsion force
                mouseDistance.normalize();
                let repelStrength = (params.mouseRepelRadius - distance) / params.mouseRepelRadius;
                let repelForce = mouseDistance.multiplyScalar(params.mouseRepelForce * repelStrength);
                
                // Apply linear velocity to X and Y (don't interfere with buoyancy)
                meshInfo.velocity.x += repelForce.x;
                meshInfo.velocity.y += repelForce.y;
                
                // NEW: Add angular velocity based on the repulsion force
                let torqueStrength = repelStrength * params.mouseAngularForce;
                
                // Create rotation around Z axis (spinning in XY plane)
                meshInfo.angularVelocity.z += (repelForce.x * 0.5 - repelForce.y * 0.5) * torqueStrength;
                
                // Add some random tumbling for more natural motion
                meshInfo.angularVelocity.x += (Math.random() - 0.5) * torqueStrength * 0.3;
                meshInfo.angularVelocity.y += (Math.random() - 0.5) * torqueStrength * 0.3;
            }
        }
        

        // ############### LETTER REPULSION #################### //
        
        // Letter-to-letter bouncing collisions
        for(let j = i + 1; j < meshes.length; j++){
            let otherMeshInfo = meshes[j];
            let separation = new THREE.Vector3().subVectors(meshInfo.mesh.position, otherMeshInfo.mesh.position);
            let distance = separation.length();
            
            if(distance < params.letterCollisionRadius && distance > 0) {
                // Normalize the collision vector
                let normal = separation.clone().normalize();
                
                // Calculate relative velocity along the collision normal
                let relativeVelocity = new THREE.Vector3().subVectors(meshInfo.velocity, otherMeshInfo.velocity);
                let velocityAlongNormal = relativeVelocity.dot(normal);
                
                // Don't resolve if velocities are separating
                if(velocityAlongNormal > 0) continue;
                
                // Calculate restitution (bounciness) - you can make this a parameter
                let restitution = 0.8; // 0 = no bounce, 1 = perfect bounce
                
                // Calculate impulse scalar
                let impulseScalar = -(1 + restitution) * velocityAlongNormal;
                // Assuming equal mass for all letters, so we divide by 2
                impulseScalar /= 2;
                
                // Apply impulse to velocities (only X and Y)
                let impulse = normal.clone().multiplyScalar(impulseScalar);
                meshInfo.velocity.x += impulse.x;
                meshInfo.velocity.y += impulse.y;
                otherMeshInfo.velocity.x -= impulse.x;
                otherMeshInfo.velocity.y -= impulse.y;
                
                // Separate overlapping letters
                let overlap = params.letterCollisionRadius - distance;
                let separationVector = normal.clone().multiplyScalar(overlap * 0.5);
                meshInfo.mesh.position.x += separationVector.x;
                meshInfo.mesh.position.y += separationVector.y;
                otherMeshInfo.mesh.position.x -= separationVector.x;
                otherMeshInfo.mesh.position.y -= separationVector.y;
            }
        }
    }

    // ############### APPLYING FORCES LOOP #################### //
    for(let meshInfo of meshes){
        // Buoyancy physics for Z-axis - on release...
        // Calculate buoyancy force based on distance from equilibrium
        let distanceFromEquilibrium = meshInfo.equilibriumZ - meshInfo.mesh.position.z;
        let buoyantForce = distanceFromEquilibrium * meshInfo.buoyancyForce;

            // Apply angular velocity to rotation
        meshInfo.mesh.rotation.x += meshInfo.angularVelocity.x;
        meshInfo.mesh.rotation.y += meshInfo.angularVelocity.y;
        meshInfo.mesh.rotation.z += meshInfo.angularVelocity.z;
        
        // Apply damping to X/Y velocities
        meshInfo.velocity.x *= (1-params.velDamping);
        meshInfo.velocity.y *= (1-params.velDamping);
        meshInfo.angularVelocity.multiplyScalar(1-params.angularDamping);
        
        // Add some damping to Z velocity to prevent oscillation
        meshInfo.velocity.z += buoyantForce;
        meshInfo.velocity.z *= (1- params.buoyancyDampening); // Z-axis damping


        // 2. Air resistance - proportional to velocity squared for realism
        let speed = Math.sqrt(meshInfo.velocity.x ** 2 + meshInfo.velocity.y ** 2);
        if (speed > 0) {
            let airResistanceForce = params.airResistance * speed;
            let resistanceX = (meshInfo.velocity.x / speed) * airResistanceForce;
            let resistanceY = (meshInfo.velocity.y / speed) * airResistanceForce;
            
            meshInfo.velocity.x -= resistanceX;
            meshInfo.velocity.y -= resistanceY;
        }


        // Continuous X/Y physics simulation
        meshInfo.mesh.position.x += meshInfo.velocity.x;
        meshInfo.mesh.position.y += meshInfo.velocity.y;
                    
        // Apply Z velocity
        meshInfo.mesh.position.z += meshInfo.velocity.z;

        const fadeStartZ = 0;
        const fadeEndZ = params.startingDepth;
        const currentZ = meshInfo.mesh.position.z;
        
        let opacity = 1.0;  
        if (currentZ < fadeStartZ) {
            // Map Z position to opacity (1.0 to 0.0)
            opacity = Math.max(0, (currentZ - fadeEndZ) / (fadeStartZ - fadeEndZ));
        }
        
        // Apply opacity to the material
        meshInfo.mesh.material.opacity = opacity;
    }

    // Update transition timer
        if(isTransitioning) {
            t = constrain(t + 1/params.transitionFrames, 0, 1);
            if(t >= 1) {
                isTransitioning = false;
                t = 0;
                // reset positions
                // remove all letters
                
                clearLetters()
                meshes = addLettersToScene(letterPositions, letters, scene);
                meshesLoaded = true;
            }
        }

    if(params.mouseInteractivity) {
        // Disable controls when mouse interactivity is ON
        controls.enabled = false;
    } else {
        // Enable controls when mouse interactivity is OFF
        controls.enabled = true;
        controls.update();
    }
    renderer.render(scene, camera);
}

function clearLetters() {
    if(meshes && meshes.length > 0) {
        // Remove each mesh from the scene
        meshes.forEach(meshInfo => {
            scene.remove(meshInfo.mesh);
            
            // Clean up geometry and material to free memory
            if(meshInfo.mesh.geometry) {
                meshInfo.mesh.geometry.dispose();
            }
            if(meshInfo.mesh.material) {
                if(Array.isArray(meshInfo.mesh.material)) {
                    meshInfo.mesh.material.forEach(material => material.dispose());
                } else {
                    meshInfo.mesh.material.dispose();
                }
            }
        });
        
        // Clear the meshes array
        meshes = [];
        
        console.log("All letters cleared from scene");
    }
    
    meshesLoaded = false;
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

function handleMouseMove(event) {
    if(meshesLoaded) {
        mouseWorldPos = getMousePositionOnXYPlaneAtZ(event, camera, renderer, 0)
        mouseIndicator.position.copy(mouseWorldPos);
        mouseIndicator.scale.setScalar(params.mouseRepelRadius); // Scale ring to show repel radius
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



function getMousePositionOnXYPlaneAtZ(event, camera, renderer, zDepth = 0) {
    const rect = renderer.domElement.getBoundingClientRect();
    
    mouseWorldPos.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseWorldPos.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouseWorldPos, camera);
    
    // Create plane at specified Z depth
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -zDepth);
    
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);
    // console.log(intersectionPoint);
    
    return intersectionPoint;
}

function quoteToLetters(sentence, spacing = 1, maxCharsPerLine = 20, lineHeight = 2, startZ = 0) {

    const letters = [];
    const upperSentence = sentence.toUpperCase();
    
    // First split by explicit line breaks, then handle word wrapping within each segment
    const segments = upperSentence.split('\n');
    const lines = [];
    
    segments.forEach(segment => {
        if (segment.trim() === '') {
            // Empty line - add it to preserve spacing
            lines.push('');
            return;
        }
        
        const words = segment.trim().split(' ');
        let currentLine = '';
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            
            if (testLine.length <= maxCharsPerLine) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    // Word is longer than max line length, force it on its own line
                    lines.push(word);
                }
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
    });
    
    // Calculate total height and center vertically
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = totalHeight / 2; // Center vertically around y = 0
    
    // Process each line and center it
    lines.forEach((line, lineIndex) => {
        // Skip empty lines but maintain spacing
        if (line === '') {
            return;
        }
        
        const lineWidth = (line.length - line.split(' ').length + 1) * spacing + (line.split(' ').length - 1) * spacing * 0.5;
        const startX = -lineWidth / 2; // Center the line horizontally
        const currentY = startY - (lineIndex * lineHeight); // Stack lines vertically from center
        
        let currentX = startX;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            // Skip spaces - just advance position
            if (char === ' ') {
                currentX += spacing * 1.5;
                continue;
            }
            
            // Map special characters to your model names
            let letterName;
            switch (char) {
                case '.':
                    letterName = 'dot';
                    break;
                case ',':
                    letterName = 'comma';
                    break;
                case "'":
                    letterName = 'apostrophe';
                    break;
                default:
                    if (char.match(/[A-Z]/)) {
                        letterName = char;
                    } else {
                        continue;
                    }
            }
            
            letters.push({
                letter: letterName,
                pos: {
                    x: currentX,
                    y: currentY,
                    z: startZ
                }
            });
            
            currentX += spacing;
        }
    });
    
    return letters;
}

function addLettersToScene(letterData, letterModels, scene) {
    const addedMeshes = [];
    
    letterData.forEach(letterInfo => {
        const originalMesh = letterModels[letterInfo.letter];
        
        if (!originalMesh) {
            console.warn(`Model for "${letterInfo.letter}" not found`);
            return;
        }
        
        const meshClone = originalMesh.clone();
        meshClone.rotation.x = Math.PI/2;
        
        let depthOffset = (Math.random() - 0.5) * params.maxDepthOffset; 

        meshClone.position.set(
            letterInfo.pos.x + (Math.random() - 0.5) * params.maxPosOffset,
            letterInfo.pos.y + (Math.random() - 0.5) * params.maxPosOffset,
            letterInfo.pos.z + depthOffset // some start lower than others
        );
        
        // meshClone.rotation.x += (Math.random() - 0.5) * params.maxRotOffset;
        // meshClone.rotation.y += (Math.random() - 0.5) * params.maxRotOffset;
        // meshClone.rotation.z += (Math.random() - 0.5) * params.maxRotOffset;
        
        scene.add(meshClone);
              
        addedMeshes.push({
            mesh: meshClone, 
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * params.maxVel,
                (Math.random() - 0.5) * params.maxVel,
                0 // Z velocity will be handled by buoyancy
            ),
            angularVelocity: new THREE.Vector3(
                (Math.random() - 0.5) * params.maxAngular,
                (Math.random() - 0.5) * params.maxAngular,
                (Math.random() - 0.5) * params.maxAngular
            ),
            // Buoyancy properties
            depthOffset: depthOffset,
            buoyancyForce: 0.001 + Math.random() * 0.001, // Slight variation in buoyancy
            equilibriumZ: 0,//Math.random() * 0.5 - 0.25, // Random floating height around 0
            isBeingPushed: false // Track if letter is being pushed down
        });
    });
    
    console.log(`Added ${addedMeshes.length} letters to scene`);
    return addedMeshes;
}

async function loadLetterModels(gltfPath) {
    const letters = {};
    const loader = new THREE.GLTFLoader();
    const whiteMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        transparent: true,  // Enable transparency
        opacity: 1.0        // Start fully opaque
    });

    try {
        const gltf = await new Promise((resolve, reject) => {
            loader.load(gltfPath, resolve, undefined, reject);
        });
        
        console.log('GLTF loaded, letters object exists:', typeof letters);
        
        gltf.scene.traverse((child) => {
            if (child.isMesh && child.name && child.name.trim() !== '') {
                try {
                    const letterMesh = child.clone();
                    // Apply the white material
                    letterMesh.material = whiteMaterial;
                    console.log('About to add:', child.name, 'Letters object type:', typeof letters);
                    letters[child.name] = letterMesh;
                    console.log('Successfully added:', child.name);
                } catch (err) {
                    console.error('Error adding letter', child.name, ':', err);
                    console.log('Letters object at error:', letters);
                }
            }
        });
        
        console.log('Final letters object:', Object.keys(letters));
        return letters;
        
    } catch (error) {
        console.error('Error loading letter models:', error);
        throw error;
    }
}

function easeOutBack(x) {
const c1 = 1.70158;
const c3 = c1 + 1;

return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function updateSoup(){
    t = 0;
    isTransitioning = true;
}

function constrain(value, low, high) {
  return Math.max(low, Math.min(value, high));
}

function easeInOutElastic(x) {
const c5 = (2 * Math.PI) / 4.5;

return x === 0
  ? 0
  : x === 1
  ? 1
  : x < 0.5
  ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
  : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}

async function loadNewQuote(newQuote) {
    clearLetters(); // Clear existing letters
    
    // Load new letters
    letterPositions = quoteToLetters(newQuote, 0.75, 15, 1.5, 0, -5);
    meshes = addLettersToScene(letterPositions, letters, scene);
    meshesLoaded = true;
    
    console.log("New quote loaded:", newQuote);
}

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
    gradient.addColorStop(1, '#557c93');    
    gradient.addColorStop(0, '#08203e');    
    
    // Fill the canvas with the gradient
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create texture from canvas and set as scene background
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
}