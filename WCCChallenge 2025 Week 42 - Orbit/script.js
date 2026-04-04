/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 39 - Music Visualiser
| 📅 Started      | 2025-09-26      
| 📅 Completed    | 2025-09-26        
| 🕒 Taken        | 1.5hrs of tweaking/adding possible adjustments                     
| 🤯 Concept      | FFTs are neat
| 🔎 Focus        | Reliving those heady days of windows media player music visualisations

Representing the amplitude of frequency bands on a Fibonacci lattice of hexagonal columns by height and colour 🥰
Keeping it simple

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

RESOURCES
- Claude to help me with the rotations
- Satellite Model: https://sketchfab.com/3d-models/low-poly-satellite-964642731c274468bf9f7c03dbfdb8b9
"Low Poly Satellite" (https://skfb.ly/6TTRr) by Rectilon is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
- Earth Textures: https://planetpixelemporium.com/earth.html
- Royalty-free music from Pixabay🎵:
  - "Orchestral Joy" by Sonican: https://pixabay.com/music/modern-classical-orchestral-joy-403337/
  - "Dubstep Basketball Event Music" by HitsLab: https://pixabay.com/music/dubstep-dubstep-basketball-event-music-382151/
  - "Experimental Cinematic Hip-Hop" by Rockot: https://pixabay.com/music/beats-experimental-cinematic-hip-hop-315904/

*/

let scene, camera, renderer, controls, canvas;
let earth, clouds;
let t = 0;
const earthRadius = 4;
let gltfLoader, textureLoader, soundLoader;// loaders
let raycaster; 
let mouse;
let satellites = []; // a group of orbits
let satelliteModel;
let earthGroup = new THREE.Group();
let targetSatellite = null;
let orbitTrace = null;
let marker;

// const soundFile = ;

// earth textures
let earthBump, earthMap, earthSpec, earthCloud, earthCloudTrans, earthLights;

function setVisibleByType(arr, type, val){
  let filteredArr = arr.filter(e => e.type === type);
  filteredArr.forEach(e => e.model.visible = val); 
}

function selectSatelliteByType(satellites, type){
  let targets = satellites.filter(each => each.type === type);
  if(targets.length === 0) return null; // Safety check
  let randomTargetIx = Math.floor(Math.random()*targets.length);
  return targets[randomTargetIx]; // Return the satellite
}

function updateMarker(){
  let p = sphericalToCartesian(params.longitude, params.latitude, earthRadius);
  marker.position.copy(p);
  // orient to be facing toward centre of earth
  marker.lookAt(new THREE.Vector3(0,0,0));
}

/**
 * Converts longitude and latitude to a 3D position on a sphere
 * @param {number} longitude - Longitude in radians (0 to 2π, or -π to π)
 * @param {number} latitude - Latitude in radians (-π/2 to π/2, where 0 is equator)
 * @param {number} r - Radius of the sphere
 * @returns {THREE.Vector3} Position on the sphere surface
 */
function sphericalToCartesian(longitude, latitude, r) {
  // Convert spherical coordinates to Cartesian
  // Using physics convention where latitude is from equator
  const x = r * Math.cos(latitude) * Math.cos(longitude);
  const y = r * Math.sin(latitude);
  const z = r * Math.cos(latitude) * Math.sin(longitude);
  
  return new THREE.Vector3(x, y, z);
}



// prototyping variables
let params = {
    n: 20,
    k: 0.01,
    secondsPerDay: 30,
    geoStationary: true,
    lowEarthOrbit: true,
    polarOrbit: true,
    sunSyncOrbit: true,
    mediumEarthOrbit: true,
    highlyEccentricOrbit: true,
    targetSatelliteType: "Highly Eccentric Orbit",
    viewMode: "God's Eye View", // Changed from individual toggles
    showOrbitalPath: false,
    longitude: 0,
    latitude: 0,
    cameraOffset: 0.05
}
let gui = new lil.GUI();
// gui.add(params, 'n', 1, 10);
const speedBiz = gui.addFolder('Speed Biz')
speedBiz.add(params, 'secondsPerDay', 1, 120, 1);
speedBiz.add(params, 'k', 0, 1, 0.0001);

const orbitVisBiz = gui.addFolder('Orbit Visibility');
orbitVisBiz.add(params, 'geoStationary').onChange(val =>   setVisibleByType(satellites, "Geostationary Orbit", val));
orbitVisBiz.add(params, 'lowEarthOrbit').onChange(val =>  setVisibleByType(satellites, "Low Earth Orbit", val));
orbitVisBiz.add(params, 'polarOrbit').onChange(val => setVisibleByType(satellites, "Polar Orbit", val));
orbitVisBiz.add(params, 'sunSyncOrbit').onChange(val => setVisibleByType(satellites, "Sun Synchronous Orbit", val));
orbitVisBiz.add(params, 'mediumEarthOrbit').onChange(val => {
  setVisibleByType(satellites, "Medium Earth Orbit", val);
});
orbitVisBiz.add(params, 'highlyEccentricOrbit').onChange(val => {
  setVisibleByType(satellites, "Highly Eccentric Orbit", val);
});

const PLAYME = gui.addFolder("PLEASE PLAY HERE!")
PLAYME.add(params, 'viewMode', [
  "God's Eye View",
  "Satellite Eye View", 
  "Worm's Eye View"
]).onChange(val => {
  // Select a satellite if switching to satellite view and none selected
  if(val === "Satellite Eye View" && !targetSatellite) {
    targetSatellite = selectSatelliteByType(satellites, params.targetSatelliteType);
  }
  if(val === "Worm's Eye View"){
    marker.visible = false;
  } else{
    marker.visible = true;
  }
});

PLAYME.add(params, 'targetSatelliteType', [
  "Geostationary Orbit",
  "Low Earth Orbit",
  "Polar Orbit",
  "Sun Synchronous Orbit",
  "Medium Earth Orbit",
  "Highly Eccentric Orbit",
]).onChange(val => {
  // Remove old trace if it exists
  if(orbitTrace) {
    scene.remove(orbitTrace);
    orbitTrace = null;
  }
  
  // Select new satellite
  targetSatellite = selectSatelliteByType(satellites, val);
  
  // If orbital path is visible, create new one
  if(params.showOrbitalPath && targetSatellite) {
    orbitTrace = createOrbitPath(targetSatellite.orbitalParams, params.secondsPerDay, 1000);
    scene.add(orbitTrace);
  }
});

PLAYME.add(params, 'showOrbitalPath').onChange(val => {
  if(val){
    if(!targetSatellite) {
      targetSatellite = selectSatelliteByType(satellites, params.targetSatelliteType);
    }
    if(targetSatellite) {
      orbitTrace = createOrbitPath(targetSatellite.orbitalParams, params.secondsPerDay, 1000);
      scene.add(orbitTrace);
    }
  } else {
    if(orbitTrace) {
      scene.remove(orbitTrace);
      orbitTrace = null;
    }
  }
});

const viewFromEarthBiz = gui.addFolder("Earth Eye View Options");
viewFromEarthBiz.add(params, 'latitude', -Math.PI/2, Math.PI/2).onChange(() => updateMarker());
viewFromEarthBiz.add(params, 'longitude', -Math.PI, Math.PI).onChange(() => updateMarker());
viewFromEarthBiz.add(params, 'cameraOffset', -1, 1, 0.01);



function init() {

    // 1. Scene setup
    scene = new THREE.Scene();

    // 2. Camera setup
    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 1000);
    camera.position.z = 10;

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(1080, 1080);
    // renderer.setSize(window.innerWidth, window.innerHeight);
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

    // 5.1 Stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1, // Adjust star size
        map: new THREE.TextureLoader().load('star_09.png'), // Optional star texture
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) { // Number of stars
        const x = (Math.random() - 0.5) * 250;
        const y = (Math.random() - 0.5) * 250;
        const z = (Math.random() - 0.5) * 250;
        starVertices.push(x, y, z);
    }

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

    // marker
    gltfLoader.load(
      'marker.glb',
      function(gltf){
        marker = gltf.scene;
        earthGroup.add(marker);
        updateMarker();
      }
    )
    

    // load the textures
    earthMap = textureLoader.load('earthmap1k.jpg');
    earthBump = textureLoader.load('earthbump1k.jpg');
    earthLights = textureLoader.load('earthlights1k.jpg');
    earthSpec = textureLoader.load('earthspec1k.jpg');
    earthCloud = textureLoader.load('earthcloudmap.jpg');
    earthCloudTrans = textureLoader.load('earthcloudmaptrans.jpg');

    // 6. Add earth
    // Your existing Earth sphere
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayTexture: { value: earthMap },
    nightTexture: { value: earthLights },
    bumpMap: { value: earthBump },
    specularMap: { value: earthSpec },
    sunDirection: { value: new THREE.Vector3(1, 0, 0) },
    bumpScale: { value: 0.05 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldNormal;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform sampler2D bumpMap;
    uniform sampler2D specularMap;
    uniform vec3 sunDirection;
    uniform float bumpScale;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldNormal;
    
    void main() {
      // Sample textures
      vec3 dayColor = texture2D(dayTexture, vUv).rgb;
      vec3 nightColor = texture2D(nightTexture, vUv).rgb;
      float specular = texture2D(specularMap, vUv).r;
      
      // Use world normal (accounts for Earth's rotation)
      vec3 normal = normalize(vWorldNormal);
      
      // Day/night transition using world-space sun direction
      float sunIntensity = dot(normal, sunDirection);
      float mixFactor = smoothstep(-0.2, 0.2, sunIntensity);
      vec3 color = mix(nightColor, dayColor, mixFactor);
      
      // Add specular highlights (only on day side, only on water)
      if (mixFactor > 0.0) {
        vec3 viewDir = normalize(vViewPosition);
        vec3 reflectDir = reflect(-sunDirection, normalize(vNormal));
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        color += spec * specular * mixFactor;
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
});
    earth = new THREE.Mesh(earthGeometry, earthMaterial);

    // Cloud layer - slightly larger radius
    const cloudGeometry = new THREE.SphereGeometry(earthRadius*(1.01), 64, 64); // 1% larger
    const cloudMaterial = new THREE.MeshStandardMaterial({
    map: earthCloud,
    alphaMap: earthCloudTrans,
    transparent: true,
    opacity: 0.4, // adjust to taste
    side: THREE.DoubleSide // optional, for better viewing angles
    });
    clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);

    // Add both to scene (or group them together)
    earthGroup.add(earth);
    earthGroup.add(clouds);
    scene.add(earthGroup);

    // Load the biz
    gltfLoader.load(
        'low_poly_satellite_oriented.glb',
        function(gltf) {
        satelliteModel = gltf.scene;
        satelliteModel.scale.multiplyScalar(0.05);
        // load once, clone thereafter
        
        // geostationary
        for(let i = 0; i < params.n; i++){
            let satellite = satelliteModel.clone();
            scene.add(satellite);
            // position / set in motion
            let aOffset = i*2*Math.PI/params.n;
            let newOrbit = initGeostationaryOrbit(satellite, aOffset);
            satellites.push(newOrbit);
        }

        // low earth orbit
        for(let i = 0; i < params.n; i++){
            let satellite = satelliteModel.clone();
            scene.add(satellite);
            // position / set in motion
            let aOffset = i*2*Math.PI/params.n;
            let newOrbit = initLowEarthOrbit(satellite, aOffset, params.k);
            satellites.push(newOrbit);
        }

        // polar orbit
         for(let i = 0; i < params.n; i++){
            let satellite = satelliteModel.clone();
            scene.add(satellite);
            // position / set in motion
            let aOffset = i*2*Math.PI/params.n;
            let newOrbit = initPolarOrbit(satellite, aOffset, params.k);
            satellites.push(newOrbit);
        }

        // sun synchronous orbit
        for(let i = 0; i < params.n; i++){
            let satellite = satelliteModel.clone();
            scene.add(satellite);
            let aOffset = i*2*Math.PI/params.n;
            let newOrbit = initSunSynchronousOrbit(satellite, aOffset, params.k);
            satellites.push(newOrbit);
        }

        // medium earth orbit
        for(let i = 0; i < params.n; i++){
            let satellite = satelliteModel.clone();
            scene.add(satellite);
            let aOffset = i*2*Math.PI/params.n;
            let newOrbit = initMediumEarthOrbit(satellite, aOffset, params.k);
            satellites.push(newOrbit);
        }

        // highly eccentric orbit
        for(let i = 0; i < params.n; i++){
            let satellite = satelliteModel.clone();
            scene.add(satellite);
            let aOffset = i*2*Math.PI/params.n;
            let newOrbit = initHighlyEccentricOrbit(satellite, aOffset, params.k);
            satellites.push(newOrbit);
        }
        

        
        
        
        
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

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    //Rotate Earth
    earthGroup.rotation.y = -elapsedTime * 2*Math.PI / params.secondsPerDay;
    
    // update each satellite according to its orbital parameters
    for(let orbit of satellites){
      updateSatellitePosition(orbit.model, elapsedTime, orbit.orbitalParams, params.secondsPerDay);
    }

    // Update camera based on view mode
    switch(params.viewMode) {
      case "Satellite Eye View":
        if(targetSatellite) {
          controls.enabled = false;
          camera.position.copy(targetSatellite.model.position);
          camera.lookAt(earth.position);
        }
        break;
        
      case "Worm's Eye View":
        if(marker) {
          controls.enabled = false;
          let markerWorldPos = new THREE.Vector3();
          marker.getWorldPosition(markerWorldPos);
          
          let cameraPos = markerWorldPos.clone().normalize().multiplyScalar(earthRadius + params.cameraOffset);
          camera.position.copy(cameraPos);

          // Look outward into space - point camera away from Earth center
          let outwardDirection = cameraPos.clone().normalize();
          let lookTarget = cameraPos.clone().add(outwardDirection.multiplyScalar(1000));
          camera.lookAt(lookTarget);
        }
        break;
  case "God's Eye View":
      default:
        controls.enabled = true;
        break;
    }

    controls.update(); // Update controls (required for damping)
    renderer.render(scene, camera);
}

function handleWindowResize() {
    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();
    // renderer.setSize(window.innerWidth, window.innerHeight);
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
