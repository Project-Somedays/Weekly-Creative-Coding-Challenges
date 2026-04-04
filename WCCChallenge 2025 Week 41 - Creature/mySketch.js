// https://pixabay.com/sound-effects/marshmallow-mouth-sounds-asmr-295418/
// https://pixabay.com/sound-effects/wet-mouth-sounds-asmr-2-295416/
// https://pixabay.com/music/mystery-creepy-horror-ambience-381940/
// https://www.filterforge.com/filters/1610-bump.html
let scene, camera, renderer, controls, canvas;
let sphere; // Will hold our cube object
let gltfLoader, textureLoader, soundLoader;// loaders
let raycaster; 
let mouse;
let locations = [];
let locationsTypes = [];
let eye, mouth; // to be copied
let eyes = [];
let mouths = [];
let creature = new THREE.Group();
// const soundFile = ;
const icabodRed = new THREE.Color(0xE72307);
const simplex = new SimplexNoise();
let t = 0;
let sounds = {
    mouthSounds1: null,
    mouthSounds2: null,
    horrorAmbience: null
};

let soundParams = {
    mouthSounds1Enabled: true,
    mouthSounds1Volume: 0.5,
    mouthSounds2Enabled: true,
    mouthSounds2Volume: 0.5,
    horrorAmbienceEnabled: true,
    horrorAmbienceVolume: 0.5
};

// prototyping variables
let params = {
    manualEyeControl: false,
    eyeOpenness: 0,
    shapeKeySelection: 0,
    shapeKeyInfluence: 0,
    n: 200,
    r: 5,
    autoRotate: true
}

let gui = new lil.GUI(); 
 gui.add(params, 'manualEyeControl');
 gui.add(params, 'eyeOpenness', 0, 1, 0.01).onChange(val => {
    for(let eyeInstance of eyes){
        eyeInstance.mesh.children[1].rotation.x = Math.PI/2 * val;
        eyeInstance.mesh.children[2].rotation.x = -Math.PI/2 * val;
    }
 })
//  gui.add(params, 'shapeKeySelection', 0, 4, 1);
//  gui.add(params, 'shapeKeyInfluence', 0.01);
//  gui.add(params, 'n', 5, 500, 1);
//  gui.add(params, 'r', 1, 10, 0.1);
 gui.add(params, 'autoRotate');

 // Add GUI controls (add this after your existing GUI setup)
const soundFolder = gui.addFolder('Sounds');
soundFolder.add(soundParams, 'mouthSounds1Enabled').name('Mouth Sounds 1').onChange(val => {
    if(sounds.mouthSounds1) {
        if(val) sounds.mouthSounds1.play();
        else sounds.mouthSounds1.stop();
    }
});
soundFolder.add(soundParams, 'mouthSounds1Volume', 0, 1, 0.01).name('Mouth 1 Volume').onChange(val => {
    if(sounds.mouthSounds1) sounds.mouthSounds1.setVolume(val);
});

soundFolder.add(soundParams, 'mouthSounds2Enabled').name('Mouth Sounds 2').onChange(val => {
    if(sounds.mouthSounds2) {
        if(val) sounds.mouthSounds2.play();
        else sounds.mouthSounds2.stop();
    }
});
soundFolder.add(soundParams, 'mouthSounds2Volume', 0, 1, 0.01).name('Mouth 2 Volume').onChange(val => {
    if(sounds.mouthSounds2) sounds.mouthSounds2.setVolume(val);
});

soundFolder.add(soundParams, 'horrorAmbienceEnabled').name('Horror Ambience').onChange(val => {
    if(sounds.horrorAmbience) {
        if(val) sounds.horrorAmbience.play();
        else sounds.horrorAmbience.stop();
    }
});
soundFolder.add(soundParams, 'horrorAmbienceVolume', 0, 1, 0.01).name('Ambience Volume').onChange(val => {
    if(sounds.horrorAmbience) sounds.horrorAmbience.setVolume(val);
});

function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

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
    mouse = new THREE.Vector3();

    // 5. Loaders
    gltfLoader = new THREE.GLTFLoader();
    textureLoader = new THREE.TextureLoader();

    // 6. Add a Cube
    // establish locations
    locations = fibonacciSphere(params.n);
    for(let i = 0; i < locations.length; i++){
        locationsTypes[i] = {location: locations[i], type: Math.random() < 0.15 ? "MOUTH" : "EYE"};
    }

    const geometry = new THREE.SphereGeometry(params.r, 32, 16);
    const material = new THREE.MeshStandardMaterial({ 
        color: icabodRed,
        bumpMap: textureLoader.load('1610-bump-upres.jpg'),
        bumpScale: 0.25
        });
    sphere = new THREE.Mesh(geometry, material);
    creature.add(sphere);

    // load in the eyes
    // gltfLoader.load(
    //     'eye.glb', 
    //     function ( gltf ) {
    //         eye = gltf.scene;
    //         let eyeLocations = locationsTypes.filter(each => each.type === "EYE");
    //         console.log(`Cloning and positioning ${eyeLocations.length}`);
    //         for(let i = 0; i < eyeLocations.length; i++){
    //             let scl = 0.5*(0.5 +  Math.random()); // randomvalue
    //             let newEye = new Eye(eyeLocations[i].location, scl, creature);
    //             eyes.push(newEye);
    //         }
    //         console.log(`Well, we now have ${eyes.length} eyes... why though? 😅`);
	// },
	// // called while loading is progressing
	// function ( xhr ) {

	// 	console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded eye' );

	// },
	// // called when loading has errors
	// function ( error ) {

	// 	console.log( 'An error happened' );

	// });


    // load in the mouths
    // gltfLoader.load(
    //     'mouth.glb', 
    //     function ( gltf ) {
    //         mouth = gltf.scene;
    //         let mouthLocations = locationsTypes.filter(each => each.type === "MOUTH");
    //         console.log(`Cloning and positioning ${mouthLocations.length}`);
    //         for(let i = 0; i < mouthLocations.length; i++){
    //             let scl = 0.5*(0.5 +  Math.random()); // randomvalue
    //             let newMouth = new Mouth(mouthLocations[i].location, scl, creature)
    //             mouths.push(newMouth);
    //         }
    //         console.log(`Great. We have ${mouths.length} mouths now... 🤮🤣`);
	// },
	// // called while loading is progressing
	// function ( xhr ) {

	// 	console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded mouth' );

	// },
	// // called when loading has errors
	// function ( error ) {

	// 	console.log( 'An error happened' );

	// });


    scene.add(creature);



    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('mousedown', handleMouseDown, false); // Example of mouse event

    // 8. Lighting Setup
    setupLights();

    // 9. Sound
    const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
camera.add(listener);

// Load sound 1
audioLoader.load('marshmallow-mouth-sounds-asmr-295418.mp3', function(buffer) {
    sounds.mouthSounds1 = new THREE.Audio(listener);
    sounds.mouthSounds1.setBuffer(buffer);
    sounds.mouthSounds1.setLoop(true);
    if(soundParams.mouthSounds1Enabled) {
        sounds.mouthSounds1.setVolume(soundParams.mouthSounds1Volume);
        sounds.mouthSounds1.play();
    }
}, function(xhr) {
    console.log('Mouth Sounds 1: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
}, function(error) {
    console.error('Error loading mouth sounds 1:', error);
});

// Load sound 2
audioLoader.load('wet-mouth-sounds-asmr-2-295416.mp3', function(buffer) {
    sounds.mouthSounds2 = new THREE.Audio(listener);
    sounds.mouthSounds2.setBuffer(buffer);
    sounds.mouthSounds2.setLoop(true);
    if(soundParams.mouthSounds2Enabled) {
        sounds.mouthSounds2.setVolume(soundParams.mouthSounds2Volume);
        sounds.mouthSounds2.play();
    }
}, function(xhr) {
    console.log('Mouth Sounds 2: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
}, function(error) {
    console.error('Error loading mouth sounds 2:', error);
});

// Load sound 3
audioLoader.load('creepy-horror-ambience-381940.mp3', function(buffer) {
    sounds.horrorAmbience = new THREE.Audio(listener);
    sounds.horrorAmbience.setBuffer(buffer);
    sounds.horrorAmbience.setLoop(true);
    if(soundParams.horrorAmbienceEnabled) {
        sounds.horrorAmbience.setVolume(soundParams.horrorAmbienceVolume);
        sounds.horrorAmbience.play();
    }
}, function(xhr) {
    console.log('Horror Ambience: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
}, function(error) {
    console.error('Error loading horror ambience:', error);
});

console.log("Finished running through init!");
}

function animate() {
    requestAnimationFrame(animate);
    t += 0.0075;

    if(!params.manualEyeControl){
        for(let currentEye of eyes){
            currentEye.updateEyelid(t);
            currentEye.updateEye(1.5*t);
        }
    }

    for(let currentMouth of mouths){
        currentMouth.update(t);
    }

    // Rotate the cube for demonstration
    if(params.autoRotate){
        creature.rotation.x += Math.PI/600;
        creature.rotation.y -= Math.PI/600;
        creature.rotation.z += Math.PI/600;
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

/**
 * Generates an array of 3D points evenly distributed on the surface of a unit sphere
 * using the Fibonacci sphere algorithm. This method is also known as the Golden Spiral method.
 * It provides a near-uniform distribution of points without complex calculations.
 *
 * @param {number} numPoints The number of points to generate.
 * @returns {Array<Array<number>>} An array of points, where each point is an array [x, y, z].
 */
function fibonacciSphere(numPoints) {
    // Array to hold the generated points.
    const points = [];

    // The golden angle in radians, used to create the spiral.
    // This value is approximately 2.399963 radians.
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < numPoints; i++) {
        // Map the index 'i' to a value between -1 and 1 for the y-coordinate.
        // This distributes points vertically along the sphere's surface.
        const y = 1 - (i / (numPoints - 1)) * 2;

        // Calculate the radius of the circle at this 'y' level.
        // This is derived from the equation of a unit sphere: x^2 + y^2 + z^2 = 1
        const radius = Math.sqrt(1 - y * y);

        // Calculate the angle for this point based on the golden angle.
        // This creates a spiral pattern as 'i' increases.
        const theta = goldenAngle * i + (Math.random() - 0.5)*Math.PI/12; // slight perturbation;

        // Convert the cylindrical coordinates (radius, theta, y) to Cartesian coordinates (x, y, z).
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        // Add the new point to the array.
        points.push(new THREE.Vector3(x,y,z));
    }

    return points;
}

function easeInOutQuint(x) {
return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

function easeInOutCubic(x) {
return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeInOutSine(x) {
return -(Math.cos(Math.PI * x) - 1) / 2;
}