let scene, camera, renderer, controls, canvas;
let world; // Physics world
let cubes = []; // Array to hold cube objects
let physicsContainer; // Physics container body
let containerMesh; // Visual wireframe container


// GUI controls
let gui;
let params = {
    shake: function() { shakeContainer(); }
};

// Container shake variables
let isShaking = false;
let shakeStartTime = 0;
let initialContainerRotation = { x: Math.PI / 4, y: 0, z: Math.PI / 4 }; // Balanced on corner
let initialContainerPosition = { x: 0, y: 0, z: 0 }; // Initial position
let targetShakeRotation = { x: 0, y: 0, z: 0 };
let targetShakePosition = { x: 0, y: 0, z: 0 };

function init() {
    // 1. Scene setup
    scene = new THREE.Scene();
    
    
   

    // 2. Camera setup
    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 1000);
    camera.position.set(8, -4, 8);
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(1080, 1080);
    // Create radial gradient background
    createGradientBackground();
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.setClearColor(0x111111);
    
    
     
    // 3.1 Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;


    // 4. Physics World Setup
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Improve collision detection to prevent clipping
    world.defaultContactMaterial.friction = 0.1;
    world.defaultContactMaterial.restitution = 0.4;
    world.defaultContactMaterial.contactEquationStiffness = 1e8;
    world.defaultContactMaterial.contactEquationRelaxation = 3;

    // 5. Create Physics Container (invisible cube balanced on corner)
    createPhysicsContainer();

    // 6. Create 17 cubes with physics
    createCubes();

    // 7. Lighting Setup
    setupLights();

    // 8. GUI Setup
    setupGUI();

    // 9. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);

    // 10. Start animation loop
    animate();
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
    gradient.addColorStop(0, '#2a4a6b');    // Lighter navy blue in center
    gradient.addColorStop(1, '#0f1419');    // Deep navy blue at edges
    
    // Fill the canvas with the gradient
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create texture from canvas and set as scene background
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
}

function createPhysicsContainer() {
    const containerSize = 10;
    
    // Create physics container - a hollow box made of walls
    const containerShape = new CANNON.Box(new CANNON.Vec3(containerSize/2, containerSize/2, containerSize/2));
    physicsContainer = new CANNON.Body({ mass: 0 }); // Static body
    
    // Create 6 walls for the container
    const wallThickness = 1.0;
    const walls = [
        // Bottom
        { pos: [0, -containerSize/2, 0], size: [containerSize/2, wallThickness/2, containerSize/2] },
        // Top
        { pos: [0, containerSize/2, 0], size: [containerSize/2, wallThickness/2, containerSize/2] },
        // Front
        { pos: [0, 0, -containerSize/2], size: [containerSize/2, containerSize/2, wallThickness/2] },
        // Back
        { pos: [0, 0, containerSize/2], size: [containerSize/2, containerSize/2, wallThickness/2] },
        // Left
        { pos: [-containerSize/2, 0, 0], size: [wallThickness/2, containerSize/2, containerSize/2] },
        // Right
        { pos: [containerSize/2, 0, 0], size: [wallThickness/2, containerSize/2, containerSize/2] }
    ];

    walls.forEach(wall => {
        const wallShape = new CANNON.Box(new CANNON.Vec3(wall.size[0], wall.size[1], wall.size[2]));
        physicsContainer.addShape(wallShape, new CANNON.Vec3(wall.pos[0], wall.pos[1], wall.pos[2]));
    });

    // Set initial rotation (balanced on corner) - NOW USING ALL THREE AXES
    physicsContainer.quaternion.setFromEuler(
    initialContainerRotation.x, 
    initialContainerRotation.y, 
    initialContainerRotation.z, 
    'XYZ'  // Specify rotation order for consistency
);
    world.add(physicsContainer);

    // Create visual wireframe container
    const containerGeometry = new THREE.BoxGeometry(containerSize, containerSize, containerSize);
    const containerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    containerMesh = new THREE.Mesh(containerGeometry, containerMaterial);
    scene.add(containerMesh);
}

function createCubes() {
    const cubeSize = 1.5;
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    for (let i = 0; i < 17; i++) {
        // Create physics body
        const cubeShape = new CANNON.Box(new CANNON.Vec3(cubeSize/2, cubeSize/2, cubeSize/2));
        const cubeBody = new CANNON.Body({ mass: 1 });
        cubeBody.addShape(cubeShape);
        
        // Random initial position within container
         cubeBody.position.set(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2 + 1,
                (Math.random() - 0.5) * 2
            );
        
        // Add some initial random velocity
        cubeBody.velocity.set(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        );

        world.add(cubeBody);

        // Create visual mesh
        const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        scene.add(cubeMesh);

        // Store reference
        cubes.push({
            body: cubeBody,
            mesh: cubeMesh
        });
    }
}

function setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Point lights for more dynamic lighting
    const pointLight1 = new THREE.PointLight(0xff4444, 0.5, 20);
    pointLight1.position.set(-5, 5, -5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4444ff, 0.5, 20);
    pointLight2.position.set(5, -2, 5);
    scene.add(pointLight2);
}

function setupGUI() {
    gui = new lil.GUI();
    gui.add(params, 'shake').name('Shake Container');
}

function shakeContainer() {
    if (isShaking) return;
    
    isShaking = true;
    shakeStartTime = Date.now();
    
    // Generate random target rotation
    targetShakeRotation = {
        x: (Math.random() - 0.5) * 4*Math.PI,
        y: (Math.random() - 0.5) * 4*Math.PI,
        z: (Math.random() - 0.5) * 4*Math.PI + initialContainerRotation.z
    };

    targetShakePosition = {
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 5,
                z: (Math.random() - 0.5) * 5
            };
}

function updateContainerRotation() {
    if (!isShaking) return;
    
    const elapsed = (Date.now() - shakeStartTime) / 1000;
    const duration = 5.0; // 5 seconds total
    const shakePhase = 2.0; // First 2 seconds for shaking
    
    if (elapsed < shakePhase) {
        // Shaking phase - interpolate to target rotation
        const progress = elapsed / shakePhase;
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        const currentRotation = {
            x: initialContainerRotation.x + (targetShakeRotation.x - initialContainerRotation.x) * eased,
            y: initialContainerRotation.y + (targetShakeRotation.y - initialContainerRotation.y) * eased,
            z: initialContainerRotation.z + (targetShakeRotation.z - initialContainerRotation.z) * eased
        };

        const currentPosition = {
            x: initialContainerPosition.x + (targetShakePosition.x - initialContainerPosition.x) * eased,
            y: initialContainerPosition.y + (targetShakePosition.y - initialContainerPosition.y) * eased,
            z: initialContainerPosition.z + (targetShakePosition.z - initialContainerPosition.z) * eased
        };
        
        physicsContainer.quaternion.setFromEuler(currentRotation.x, currentRotation.y, currentRotation.z);
        physicsContainer.position.set(currentPosition.x, currentPosition.y, currentPosition.z);
    } else if (elapsed < duration) {
        // Return phase - interpolate back to initial rotation
        const returnPhase = (elapsed - shakePhase) / (duration - shakePhase);
        const eased = 1 - Math.pow(1 - returnPhase, 2); // Ease out quadratic
        
        const currentRotation = {
            x: targetShakeRotation.x + (initialContainerRotation.x - targetShakeRotation.x) * eased,
            y: targetShakeRotation.y + (initialContainerRotation.y - targetShakeRotation.y) * eased,
            z: targetShakeRotation.z + (initialContainerRotation.z - targetShakeRotation.z) * eased
        };

        const currentPosition = {
            x: targetShakePosition.x + (initialContainerPosition.x - targetShakePosition.x) * eased,
            y: targetShakePosition.y + (initialContainerPosition.y - targetShakePosition.y) * eased,
            z: targetShakePosition.z + (initialContainerPosition.z - targetShakePosition.z) * eased
        };
        
        physicsContainer.quaternion.setFromEuler(currentRotation.x, currentRotation.y, currentRotation.z);
        physicsContainer.position.set(currentPosition.x, currentPosition.y, currentPosition.z);
    } else {
        // Animation complete
        isShaking = false;
        physicsContainer.quaternion.setFromEuler(
            initialContainerRotation.x, 
            initialContainerRotation.y, 
            initialContainerRotation.z
        );
        physicsContainer.position.set(
            initialContainerPosition.x,
            initialContainerPosition.y,
            initialContainerPosition.z
        );
    }
}

function updateCubeColors() {
    cubes.forEach(cube => {
        const velocity = cube.body.velocity;
        const maxVel = 10; // Maximum expected velocity for color mapping
        
        // Map velocity components to color channels (0-1 range)
        const r = Math.min(Math.abs(velocity.x) / maxVel, 1);
        const g = Math.min(Math.abs(velocity.y) / maxVel, 1);
        const b = Math.min(Math.abs(velocity.z) / maxVel, 1);
        
        // Ensure minimum brightness
        const minBrightness = 0.2;
        const finalR = Math.max(r, minBrightness);
        const finalG = Math.max(g, minBrightness);
        const finalB = Math.max(b, minBrightness);
        
        cube.mesh.material.color.setRGB(finalR, finalG, finalB);
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Update physics with smaller timestep for better collision detection
    const timeStep = 1/120;
    world.step(timeStep);

    // Update container rotation for shaking
    updateContainerRotation();

    // Sync visual container with physics container
    containerMesh.position.copy(physicsContainer.position);
    containerMesh.quaternion.copy(physicsContainer.quaternion);

    // Sync cube meshes with physics bodies and update colors
    cubes.forEach(cube => {
        cube.mesh.position.copy(cube.body.position);
        cube.mesh.quaternion.copy(cube.body.quaternion);
        
        // Reset cube if it falls too far or escapes container
        const pos = cube.body.position;
        if (pos.y < -10 || Math.abs(pos.x) > 15 || Math.abs(pos.z) > 15) {
            // Reset to center with random velocity
            cube.body.position.set(
                (Math.random() - 0.5) * 2,
                2,
                (Math.random() - 0.5) * 2
            );
            cube.body.velocity.set(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            );
            cube.body.angularVelocity.set(0, 0, 0);
        }
    });

    // Update cube colors based on velocity
    updateCubeColors();

    // renderer.render(scene.backgroundScene, scene.backgroundCamera);
    
    // // Then render main scene with depth cleared but color preserved
    // renderer.clearDepth();
    renderer.render(scene, camera);
}

function handleWindowResize() {
    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // // Update background shader resolution
    // if (scene.backgroundScene && scene.backgroundScene.children[0]) {
    //     scene.backgroundScene.children[0].material.uniforms.resolution.value.set(
    //         window.innerWidth, 
    //         window.innerHeight
    //     );
    // }
}

// Initialize the scene
init();