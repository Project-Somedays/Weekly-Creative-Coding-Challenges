/*
| Title           | WCCChallenge 2025 W22 - Spiral 
| 📅 Started      | 2025-06-01        
| 📅 Completed    | 2025-06-01        
| 🕒 Taken        | ~2hrs                                  
| 🤯 Concept      | Stuff fallin gdown a spiral staircase        
| 🔎 Technical    | Cannonjs + Threejs       

Had my brainwave WAY too late in the piece. Is defs unfinished. Claude and gemini can only get you so far.

TODO:
- Ragdoll a Knight falling down the stairs?
- Get an orbiting camera going
- Position the invisible cannonjs walls properly to keep stuff in the spiral staircase
- Sound design

Still. The concept is there!

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am
*/

let scene, camera, renderer, controls, canvas;
let cube; // Will hold our cube object
let objLoader, textureLoader, soundLoader;// loaders
// Spiral staircase parameters
const stairCount = 30;
const stairTurns = 3;
const stairRadius = 2;
const stairHeight = 0.3;
const stairWidth = 2;
const stairDepth = 2;
const spiralHeight = 15;
let staircase;
let staircaseCentre;
let staircaseWalls = [];
const stairCaseWallCount = 16;
// const anglePerStair = (Math.PI * 4) / stairCount;
const anglePerStair = 0.5* Math.PI * stairRadius / stairWidth;
// const soundFile = ;
let physicsWallBodies = [];

let world;
let t = 0;

// Ball parameters
const ballCount = 50;
const balls = [];
const ballBodies = [];
const ballColors = [];

// Arrays to store stair meshes and bodies
const stairs = [];
let stairBodies = [];

let params;
let gui = new lil.GUI();
params = {
    freeRotateMode: true,
    cameraOrbitPeriod: 1200,
    cameraOrbitRadius: stairRadius*4
}
// gui.add(params, 'freeRotateMode');
// gui.add(params, 'cameraOrbitPeriod', 300, 1800, 100, 10);
// gui.add(params, 'cameraOrbitRadius', stairRadius*2, stairRadius*8, 0.1)


function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5,5,5);

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;

    // 5. Physics World
    // objLoader = new THREE.OBJLoader();
    // textureLoader = new THREE.TextureLoader();
    world = new CANNON.World();
    world.gravity.set(0, -20, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // 6. Add staircase

    staircase = createSpiralStaircase(50, stairRadius, stairTurns);
    const staircaseCentreGeometry = new THREE.CylinderGeometry(stairRadius, stairRadius, stairCount*stairHeight)
    const staircaseCentreMaterial = new THREE.MeshStandardMaterial({color: 0xffffff, visible: false});
    

    staircaseCentre = new THREE.Mesh(staircaseCentreGeometry, staircaseCentreMaterial);
    staircase.add(staircaseCentre);
    // Create corresponding physics body for central column
    const centralColumnShape = new CANNON.Cylinder(
        stairRadius,  // radiusTop
        stairRadius,  // radiusBottom  
        1.25 * stairCount * stairHeight,  // height
        8  // numSegments (8 is a good default for physics)
    );
    const centralColumnBody = new CANNON.Body({ mass: 0 }); // Static body
    centralColumnBody.addShape(centralColumnShape);
    centralColumnBody.position.set(0, 0, 0); // Centered at origin
    world.add(centralColumnBody);

    
    // staircase wall count
    for(let i = 0; i < stairCaseWallCount; i++){
        let a = i*Math.PI * 2 / stairCaseWallCount;
        let r = (stairRadius + stairWidth) * 0.8;
        let x = r * Math.cos(a);
        let z = r * Math.sin(a);
        let geometry = new THREE.BoxGeometry(2*Math.PI*r/stairCaseWallCount, 1.25*stairCount*stairHeight, stairDepth);
        let material = new THREE.MeshStandardMaterial({color: 0xffffff, visible: false});
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x,0,z);
        mesh.rotation.y = -a;
        staircaseWalls.push(mesh);
        scene.add(mesh);

        const wallShape = new CANNON.Box(new CANNON.Vec3(
            (2*Math.PI*r/stairCaseWallCount)/2, 
            (1.25*stairCount*stairHeight)/2, 
            stairDepth/2
        ));
        const wallBody = new CANNON.Body({ mass: 0 }); // Static body
        wallBody.addShape(wallShape);
        wallBody.position.set(x, 0, z);
        wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -a);
        world.add(wallBody);
        physicsWallBodies.push(wallBody);
    }

    scene.add(staircase)

    // 6B - Balls
    for (let i = 0; i < ballCount; i++) {
        // Ball geometry and material
        const ballGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const ballColor = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
        const ballMaterial = new THREE.MeshLambertMaterial({ color: ballColor });
        const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
        ballMesh.castShadow = true;
        scene.add(ballMesh);
        balls.push(ballMesh);
        ballColors.push(ballColor);

        // Physics body for ball
        const ballShape = new CANNON.Sphere(0.15);
        const ballBody = new CANNON.Body({ mass: 1 });
        ballBody.addShape(ballShape);
        ballBody.material = new CANNON.Material();
        ballBody.material.friction = 0.1;
        ballBody.material.restitution = 0.9;
        // ballBody.material.frictionEquationStiffness = 1e8;
        // ballBody.material.frictionEquationRelaxation = 3;
        // ballBody.material.restitutionEquationStiffness = 1e8;
        
        // Random starting position above the staircase
        // ballBody.position.set(
        //     (Math.random() - 0.5) * 2,
        //     spiralHeight/2 + 5 + Math.random() * 5,
        //     (Math.random() - 0.5) * 2
        // );
        let x = stairRadius + (Math.random() - 0.5);
        let y = stairCount*stairHeight*1.1;
        let z = (Math.random() - 0.5);
        ballBody.position.set(x,y,z);
        
        world.add(ballBody);
        ballBodies.push(ballBody);
    }

    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('mousedown', handleMouseDown, false); // Example of mouse event

    // 8. Lighting Setup
    setupLights();

    // 9. Sound
    // audioLoader = new THREE.AudioLoader();
    // const listener = new THREE.AudioListener();
    // camera.add(listener);
    

    animate(); // Start the animation loop
}

function animate() {
    requestAnimationFrame(animate);
    t ++;

    // Rotate the cube for demonstration
    // Update physics
    world.step(1/60);

    // Update ball positions and reset if fallen
    balls.forEach((ball, index) => {
        const ballBody = ballBodies[index];
        
        // Copy physics position to visual mesh
        ball.position.copy(ballBody.position);
        ball.quaternion.copy(ballBody.quaternion);
        
        // Reset ball if it falls too low
        if (ballBody.position.y < -spiralHeight/2 - 5) {
            let x = stairRadius + (Math.random() - 0.5);
            let y = stairCount*stairHeight*1.25;
            let z = (Math.random() - 0.5);
            ballBody.position.set(x,y,z);
            ballBody.velocity.set((Math.random() - 0.5)*0.25, 0, (Math.random() - 0.5)*0.25);
            ballBody.angularVelocity.set(0, 0, 0);
            
            // Change color when reset
            const newColor = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
            ball.material.color = newColor;
        }
    });

    controls.update();
    // if(params.freeRotateMode){
    //      controls.update();// Update controls (required for damping)
    // } else{
    //     let a = 2 *Math.PI * t / params.cameraRotatePeriod;
    //     let x = params.cameraOrbitRadius * Math.cos(a);
    //     let z = params.cameraOrbitRadius * Math.sin(a);
    //     let y = 0;
    //     camera.position.set(x,y,z);
    //     camera.lookAt(new THREE.Vector3(0,0,0));
    // }
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

}

// Call the init function to set up the scene
init();

/**
 * Calculates the rotation for a cube in a spiral staircase, based on its position along the spiral.
 *
 * @param {number} index The sequential index of the cube in the spiral (e.g., 0 for the first cube, 1 for the second, etc.).
 * @param {number} totalSteps The total number of steps/cubes in the spiral.
 * @param {number} turns The number of full rotations the spiral makes from bottom to top.
 * @returns {THREE.Euler} An Euler object representing the rotation in radians (pitch, yaw, roll).
 */
function getSpiralCubeRotation(index, totalSteps, turns) {
    // Calculate the angular position for this cube.
    // We multiply by Math.PI * 2 to get a full circle in radians.
    // 'turns' determines how many full rotations the spiral makes.
    const angle = -(index / totalSteps) * (Math.PI * 2) * turns;

    // For a spiral staircase, the cube's rotation should generally align with the curve.
    // This means rotating it around its Y-axis (vertical axis in Three.js default) by the angle.
    // You might also want to slightly rotate it around its X or Z axis depending on the desired
    // "tilt" of the steps, but for a standard spiral, Y-axis rotation is key.
    return new THREE.Euler(0, angle, 0, 'XYZ'); // Y-axis rotation, 'XYZ' order is common
}


function createSpiralStaircase(numSteps = 20, radius = 5, turns = 2) {
    const staircaseGroup = new THREE.Group(); // Use a group to hold all steps
    const stairBodies = []; // Array to store physics bodies

    const cubeGeometry = new THREE.BoxGeometry(stairWidth, stairHeight, stairDepth); // Width, Height, Depth of the step
    const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Wood-like color

    for (let i = 0; i < numSteps; i++) {
        const cube = new THREE.Mesh(cubeGeometry, material);

        // Calculate angular position for X and Z coordinates
        const angle = (i / numSteps) * (Math.PI * 2) * turns;

        // Calculate X and Z positions based on angle and radius
        cube.position.x = radius * Math.cos(angle);
        cube.position.z = radius * Math.sin(angle);

        // Calculate Y position (height)
        cube.position.y = -stairCount*stairHeight/2 + i * stairHeight;

        // Apply rotation
        const rotation = getSpiralCubeRotation(i, numSteps, turns);
        cube.rotation.copy(rotation);

        staircaseGroup.add(cube);

        // Create corresponding Cannon.js physics body
        const stairShape = new CANNON.Box(new CANNON.Vec3(stairWidth/2, stairHeight/2, stairDepth/2));
        const stairBody = new CANNON.Body({ mass: 0 }); // Static body
        stairBody.addShape(stairShape);
        stairBody.position.set(cube.position.x, cube.position.y, cube.position.z);
        
        // Convert Three.js Euler rotation to Cannon.js quaternion
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(rotation);
        stairBody.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        stairBody.Material
        world.add(stairBody);
        stairBodies.push(stairBody);
    }
    
    return staircaseGroup
};


