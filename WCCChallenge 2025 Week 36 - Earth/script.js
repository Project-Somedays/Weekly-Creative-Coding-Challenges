/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 36 - Earth 
| 📅 Started      | 2025-09-07        
| 📅 Completed    | 2025-09-07        
| 🕒 Taken        | ~3hrs                                  
| 🤯 Concept      | Started with imagining a point cloud of earth, but stayed for the simplex wobbles 
| 🔎 Focus        | Points in Three.js       

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Using Bruno Simon's ThreeJSJourney class

What started as an experiment in reading in a height map of earth ended in applying easing functions to 4D simplex noise values
Love the puckering! Will defs return to this in future. Especially once I finally learn about shaders.

But is it earth? Maybe in its formative molten stages...

*/


let scene, camera, renderer, controls, canvas;
let cube; // Will hold our cube object
let objLoader, textureLoader, soundLoader;// loaders
let raycaster; 
let mouse;
let pointCloud;
let pointsGeometry;
let pointsMaterial;
let t = 0;

const simplex = new SimplexNoise();
// const soundFile = ;

// prototyping default variables
let params = {
    pointCount: 150000,
    noiseZoom: 2,
    noiseAmp: 0.5,
    easingMethod: easeInOutBounce,
    maxColour: new THREE.Color(0xff0000),
    minColour: new THREE.Color(0x0000ff),
    autoRotate: true,
    autoProgress: true,
    progressionRate: 0.005
}
let gui = new lil.GUI();


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


    // 4. Loaders
    objLoader = new THREE.OBJLoader();
    textureLoader = new THREE.TextureLoader();

    // 5. Add point cloud
    const pointsOnSphere = generateColouredPointsOnSphere(params.pointCount, params.minColour, params.maxColour, params.noiseZoom, params.noiseAmp, 5);
    pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointsOnSphere.positionsArr,3)); // Create the Three.js BufferAttribute and specify that each information is composed of 3 values
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(pointsOnSphere.coloursArr,3));
    
    pointsMaterial = new THREE.PointsMaterial({size: 0.02, sizeAttenuation: true, vertexColors: true})
  
    pointCloud = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointCloud);
    
    // 6. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother interaction
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector3();

    setupGUI();

    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('mousedown', handleMouseDown, false); // Example of mouse event

    // 8. Lighting Setup
    // setupLights();

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

    // Rotate the pointCloud for demonstration
    if(params.autoRotate){
        pointCloud.rotation.y += 0.001;
    }
    
    if(params.autoProgress){
        t += params.progressionRate;
        updateSphere(pointsGeometry, t);
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


function updateSphere(pointsGeometry, t = 0) {
    // Your function would use params.noiseZoom instead of a hardcoded value
    const newPointsData = generateColouredPointsOnSphere(params.pointCount, params.minColour, params.maxColour, params.noiseZoom, params.noiseAmp, 5, t);
    
    const positionAttribute = pointsGeometry.getAttribute('position');
    const colorAttribute = pointsGeometry.getAttribute('color');
    
    positionAttribute.array.set(newPointsData.positionsArr);
    colorAttribute.array.set(newPointsData.coloursArr);
    
    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
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


/**
 * Generates an array of points evenly distributed on the surface of a sphere.
 * This uses the Golden Spiral algorithm, which avoids the clustering at the poles
 * that occurs with simple spherical coordinate-based methods.
 * * @param {number} numPoints The desired number of points.
 * @param {THREE.Color} maxColour Colour for the highest points
 * @param {THREE.Color} minColour Colour for the lowest points
 * @param {number} noiseZoom How much we consider the difference
 * @param {number} noiseAmp How much we exaggerate the noise amplitude
 * @param {number} radius The radius of the sphere.
 * @returns {Float32Array} A flat array of x, y, z coordinates.
 */
function generateColouredPointsOnSphere(numPoints, maxColour, minColour, noiseZoom, noiseAmp, radius, t = 0) {
    const positions = [];
    const colours = [];
    
    // The golden angle in radians, approximately 137.5 degrees
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < numPoints; i++) {
        // Calculate y position, mapping i to a range from -1 to 1
        const y = 1 - (i / (numPoints - 1)) * 2;
        
        // Calculate the radius of the circle at this y position
        const r = Math.sqrt(1 - y * y);

        // Calculate the angle using the golden angle
        const theta = i * goldenAngle;
        
        // Convert to Cartesian coordinates (x, z)
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        // calculate the noise displacement
        const noiseVal = simplex.noise4D(x*noiseZoom,y*noiseZoom,z*noiseZoom, t);
        const easedNoiseVal = params.easingMethod(0.5*(noiseVal+1));
        const noiseRadius = radius + easedNoiseVal * noiseAmp; // which ranges from -1 to 1

        const noiseToCol = maxColour.clone().lerp(minColour, easedNoiseVal);
        
        // Push the scaled coordinates into the array
        positions.push(x * noiseRadius);
        positions.push(y * noiseRadius);
        positions.push(z * noiseRadius);
        colours.push(noiseToCol.r);
        colours.push(noiseToCol.g);
        colours.push(noiseToCol.b);
    }
    const positionsArr = new Float32Array(positions);
    const coloursArr  = new Float32Array(colours);
    return {positionsArr, coloursArr};
}

function easeOutBounce(x){
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

function easeInOutBounce(x){
return x < 0.5
  ? (1 - easeOutBounce(1 - 2 * x)) / 2
  : (1 + easeOutBounce(2 * x - 1)) / 2;
}

function easeInBounce(x){
return 1 - easeOutBounce(1 - x);
}

function easeInOutElastic(x){
const c5 = (2 * Math.PI) / 4.5;

return x === 0
  ? 0
  : x === 1
  ? 1
  : x < 0.5
  ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
  : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}

function easeInElastic(x) {
const c4 = (2 * Math.PI) / 3;

return x === 0
  ? 0
  : x === 1
  ? 1
  : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
}

function easeOutElastic(x) {
const c4 = (2 * Math.PI) / 3;

return x === 0
  ? 0
  : x === 1
  ? 1
  : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

function linear(x){
    return x;
}

function easeInOutSine(x){
return -(Math.cos(Math.PI * x) - 1) / 2;
}

function easeInOutCirc(x){
return x < 0.5
  ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
  : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

function quad(x){
    return x**2;
}

function updateSpherePointCount() {
    // Remove the old point cloud from the scene
    scene.remove(pointCloud);
    
    // Create entirely new geometry and points
    const pointsOnSphere = generateColouredPointsOnSphere(params.pointCount, params.minColour, params.maxColour, params.noiseZoom, params.noiseAmp, 5);
    
    pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointsOnSphere.positionsArr, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(pointsOnSphere.coloursArr, 3));
    
    // Reuse the same material
    pointCloud = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointCloud);
}

function setupGUI(){
    gui.add(params, 'pointCount', 1000, 500000, 500).onChange(() => updateSpherePointCount());
    gui.add(params, 'noiseZoom', 0.1, 5, 0.001).onChange(() => updateSphere(pointsGeometry));
    gui.add(params, 'noiseAmp', 0.01, 1.0, 0.001).onChange(() => updateSphere(pointsGeometry));
    gui.add(params, 'easingMethod', {
        'easeInOutBounce': easeInOutBounce,
        'easeInElastic': easeInElastic, 
        'easeOutElastic': easeOutElastic, 
        'easeInOutElastic': easeInOutElastic, 
        'easeInBounce': easeInBounce, 
        'easeOutBounce': easeOutBounce,
        'linear': linear,
        'quad': quad,
        'easeInOutSine': easeInOutSine,
        'easeInOutCirc': easeInOutCirc
    }).onChange(() => updateSphere(pointsGeometry));
    gui.add(params, 'autoRotate');
    gui.add(params, 'autoProgress');
    gui.add(params, 'progressionRate', 0.0001, 0.02, 0.0001);
    gui.addColor(params, 'minColour');
    gui.addColor(params, 'maxColour');
}

