/* 
Author: Project Somedays
Date: 2025-03-22
Title: WCCChallenge 2025 Week 12 - Morph

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Man, Big Hero 6 was a good movie... Replicating a little of his demo scene: https://www.youtube.com/watch?v=Iuum5--i2tE

RESOURCES:
  - Microbot model: modelled in Blender by yours truly
  - Physics Library: Cannon.js
  - Surfaces: https://www.craftsmanspace.com/free-3d-models/mathematical-3d-surfaces.html

  Moving microbots to the vertices of 3D surfaces
*/

// Set up scene, camera, and renderer


// Set up scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Create glow materials for the spheres - we'll use an array to store multiple materials
const numMaterials = 10; // Number of different phase groups
const sphereMaterials = [];
const glowMaterials = [];

// Create materials with different base colors (optional)
for (let i = 0; i < numMaterials; i++) {
  // Create a slightly different color for each material
  const hue = i / numMaterials;
  const color = new THREE.Color().setHSL(hue, 1, 0.5);
  
  sphereMaterials.push(new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.8
  }));
  
  glowMaterials.push(new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.2
  }));
}

// Add a point light
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 0, 5);
scene.add(light);

// Debug helper - add axes to see orientation
// const axesHelper = new THREE.AxesHelper(3);
// scene.add(axesHelper);

// Variables to store loaded model and spheres
let loadedModel = null;
let vertexSpheres = []; // Store individual spheres instead of instanced mesh

// Function to create spheres at vertices with phase offsets
function createVertexSpheres(vertices) {
  // Remove any existing spheres
  vertexSpheres.forEach(sphere => {
    scene.remove(sphere.sphere);
    scene.remove(sphere.glow);
  });
  vertexSpheres = [];
  
  console.log(`Creating ${vertices.length} vertex spheres`);
  
  // Choose a sphere creation method
  const useInstanced = false; // Set to true for instanced mesh, false for individual meshes
  
  if (useInstanced) {
    // Using instanced meshes with phase data in userData
    createInstancedSpheres(vertices);
  } else {
    // Create individual spheres for more control
    createIndividualSpheres(vertices);
  }
  
  console.log(`Added ${vertices.length} vertex spheres`);
}

// Create individual spheres for maximum control over animations
function createIndividualSpheres(vertices) {
  const sphereGeometry = new THREE.SphereGeometry(0.025, 8, 8);
  const glowGeometry = new THREE.SphereGeometry(0.075, 16, 16);
  
  vertices.forEach((vertex, i) => {
    // Choose material based on index
    const materialIndex = i % numMaterials;
    const material = sphereMaterials[materialIndex];
    const glowMaterial = glowMaterials[materialIndex];
    
    // Create main sphere
    const sphere = new THREE.Mesh(sphereGeometry, material.clone());
    sphere.position.copy(vertex);
    scene.add(sphere);
    
    // Create glow sphere
    const glow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
    glow.position.copy(vertex);
    scene.add(glow);
    
    // Store both with their phase offset
    vertexSpheres.push({
      sphere: sphere,
      glow: glow,
      phase: i / vertices.length, // Phase offset based on index (0 to 1)
      index: i
    });
  });
}

// Alternative approach using instanced meshes (less flexible for individual animations)
function createInstancedSpheres(vertices) {
  // Create multiple instanced meshes, one for each phase group
  for (let m = 0; m < numMaterials; m++) {
    // Count vertices for this material group
    const verticesForThisGroup = vertices.filter((_, i) => i % numMaterials === m);
    if (verticesForThisGroup.length === 0) continue;
    
    // Create instanced meshes for this group
    const sphereGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const instancedSpheres = new THREE.InstancedMesh(
      sphereGeometry,
      sphereMaterials[m],
      verticesForThisGroup.length
    );
    
    // Position each sphere at its vertex
    const matrix = new THREE.Matrix4();
    let instanceIndex = 0;
    
    vertices.forEach((vertex, i) => {
      if (i % numMaterials !== m) return;
      
      matrix.setPosition(vertex.x, vertex.y, vertex.z);
      instancedSpheres.setMatrixAt(instanceIndex, matrix);
      instanceIndex++;
    });
    
    instancedSpheres.instanceMatrix.needsUpdate = true;
    scene.add(instancedSpheres);
    
    // Create glowing instances
    const glowGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const glowInstances = new THREE.InstancedMesh(
      glowGeometry,
      glowMaterials[m],
      verticesForThisGroup.length
    );
    
    // Copy matrices
    instanceIndex = 0;
    vertices.forEach((vertex, i) => {
      if (i % numMaterials !== m) return;
      
      matrix.setPosition(vertex.x, vertex.y, vertex.z);
      glowInstances.setMatrixAt(instanceIndex, matrix);
      instanceIndex++;
    });
    
    glowInstances.instanceMatrix.needsUpdate = true;
    scene.add(glowInstances);
    
    // Store reference with phase information
    vertexSpheres.push({
      sphere: instancedSpheres,
      glow: glowInstances,
      phase: m / numMaterials,
      isInstancedGroup: true,
      groupIndex: m
    });
  }
}

// Extract vertices from model
function extractVerticesFromModel(model) {
  const vertices = [];
  
  model.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry;
      
      if (!geometry || !geometry.attributes || !geometry.attributes.position) {
        console.error("Geometry or position attribute missing:", geometry);
        return;
      }
      
      // Extract vertices
      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const vertex = new THREE.Vector3(
          positions[i],
          positions[i + 1],
          positions[i + 2]
        );
        
        // Remove duplicates (optional)
        if (!vertices.some(v => v.distanceTo(vertex) < 0.001)) {
          vertices.push(vertex);
        }
      }
    }
  });
  
  return vertices;
}

// Function to trigger positioning spheres on vertices
function positionSpheresOnVertices() {
  if (!loadedModel) {
    console.error("No model loaded yet!");
    return;
  }
  
  const vertices = extractVerticesFromModel(loadedModel);
  
  if (vertices.length === 0) {
    console.warn("No vertices found in the model");
    return;
  }
  
  // Create spheres at vertices
  createVertexSpheres(vertices);
  
  // Match position with model
  const modelPosition = new THREE.Vector3();
  loadedModel.getWorldPosition(modelPosition);
  
  vertexSpheres.forEach(item => {
    if (item.isInstancedGroup) {
      item.sphere.position.copy(modelPosition);
      item.glow.position.copy(modelPosition);
    } else {
      // Individual spheres are already positioned at vertices
    }
  });
}

// Load the model
function loadModel(url) {
  const loader = new THREE.OBJLoader();
  
  console.log("Starting to load OBJ file...");
  
  loader.load(
    url,
    function (object) {
      console.log("Model loaded successfully:", object);
      
      // Remove previous model if exists
      if (loadedModel) {
        scene.remove(loadedModel);
      }
      
      loadedModel = object;
      
      // Add the model to the scene
      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x444444,
            wireframe: true,
            transparent: true,
            opacity: 0.3
          });
        }
      });
      
      // Center the model
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      
      scene.add(object);
      
      console.log("Model added to scene. Call positionSpheresOnVertices() to add spheres.");
      
      // Uncomment if you want spheres automatically added when model loads
      // positionSpheresOnVertices();
    },
    function (xhr) {
      if (xhr.lengthComputable) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      } else {
        console.log('Loading in progress...');
      }
    },
    function (error) {
      console.error('Error loading OBJ:', error);
    }
  );
}

// Animation options - configurable
const animationOptions = {
  phaseSpeed: 1.0,    // How fast the phases cycle
  pulseAmount: 0.4,   // Amount of pulsing (0-1)
  baseOpacity: 0.6,   // Base opacity
  wavesEnabled: true, // Enable wave effect
  waveType: 'linear', // 'linear', 'circular', or 'random'
  colorShift: false   // Enable color shifting
};

// Create UI controls
function createUI() {
  // Main control buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.position = 'absolute';
  buttonContainer.style.top = '20px';
  buttonContainer.style.left = '20px';
  buttonContainer.style.zIndex = '100';
  document.body.appendChild(buttonContainer);
  
  // Position spheres button
  const button = document.createElement('button');
  button.textContent = 'Position Spheres on Vertices';
  button.style.padding = '10px';
  button.style.marginRight = '10px';
  button.addEventListener('click', positionSpheresOnVertices);
  buttonContainer.appendChild(button);
  
  // Load model button
  const loadButton = document.createElement('button');
  loadButton.textContent = 'Load Model';
  loadButton.style.padding = '10px';
  loadButton.addEventListener('click', () => {
    const url = prompt('Enter path to OBJ file:', 'your_model.obj');
    if (url) {
      loadModel(url);
    }
  });
  buttonContainer.appendChild(loadButton);
  
  // Wave type select
  const waveSelect = document.createElement('select');
  waveSelect.style.padding = '10px';
  waveSelect.style.marginLeft = '10px';
  
  const waveTypes = ['linear', 'circular', 'random'];
  waveTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ' Wave';
    waveSelect.appendChild(option);
  });
  
  waveSelect.addEventListener('change', (e) => {
    animationOptions.waveType = e.target.value;
  });
  buttonContainer.appendChild(waveSelect);
  
  // Speed slider
  const speedContainer = document.createElement('div');
  speedContainer.style.position = 'absolute';
  speedContainer.style.top = '60px';
  speedContainer.style.left = '20px';
  speedContainer.style.zIndex = '100';
  document.body.appendChild(speedContainer);
  
  const speedLabel = document.createElement('span');
  speedLabel.textContent = 'Speed: ';
  speedLabel.style.color = 'white';
  speedContainer.appendChild(speedLabel);
  
  const speedSlider = document.createElement('input');
  speedSlider.type = 'range';
  speedSlider.min = '0.1';
  speedSlider.max = '3';
  speedSlider.step = '0.1';
  speedSlider.value = animationOptions.phaseSpeed.toString();
  speedSlider.addEventListener('input', (e) => {
    animationOptions.phaseSpeed = parseFloat(e.target.value);
  });
  speedContainer.appendChild(speedSlider);
}

// Initialize UI
createUI();

// Load a default model
loadModel('FireTree.obj');

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop with phase offset
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  // Animation time
  const time = Date.now() * 0.001 * animationOptions.phaseSpeed;
  
  // Update individual spheres with phase offsets
  vertexSpheres.forEach(item => {
    if (item.isInstancedGroup) {
      // For instanced meshes (less individual control but better performance)
      // We control the whole group with the phase offset
      const phase = item.phase;
      const pulseValue = ((Math.sin(time + phase * Math.PI * 2) + 1) / 2) * animationOptions.pulseAmount;
      
      // Update opacity for instanced meshes
      item.sphere.material.opacity = animationOptions.baseOpacity + pulseValue;
      item.glow.material.opacity = 0.1 + pulseValue * 0.3;
    } else {
      // For individual meshes
      let phase = item.phase;
      
      // Apply different wave types
      if (animationOptions.wavesEnabled) {
        switch (animationOptions.waveType) {
          case 'linear':
            // Default: Linear offset based on index
            // phase is already set correctly
            break;
          case 'circular':
            // Circular wave pattern
            const center = new THREE.Vector3();
            const distance = item.sphere.position.distanceTo(center);
            phase = distance * 0.5; // Adjust the multiplier to control wave density
            break;
          case 'random':
            // Random phase offset (uses the existing phase but adds noise)
            phase = item.phase + Math.sin(time * 0.1 + item.index) * 0.2;
            break;
        }
      }
      
      // Calculate pulse value with phase offset
      const pulseValue = ((Math.sin(time + phase * Math.PI * 2) + 1) / 2) * animationOptions.pulseAmount;
      
      // Update opacity
      item.sphere.material.opacity = animationOptions.baseOpacity + pulseValue;
      item.glow.material.opacity = 0.1 + pulseValue * 0.3;
      
      // Optional: Scale pulsing
      const scale = 1 + pulseValue * 0.2;
      item.sphere.scale.set(scale, scale, scale);
      item.glow.scale.set(scale, scale, scale);
      
      // Optional: Color shifting based on phase
      if (animationOptions.colorShift) {
        const hue = (time * 0.05 + phase) % 1;
        item.sphere.material.color.setHSL(hue, 1, 0.5);
        item.glow.material.color.setHSL(hue, 1, 0.5);
      }
    }
  });
  
  renderer.render(scene, camera);
}

animate();

/* const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Create a glow material for the spheres
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.8
});

// Add a point light
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 0, 5);
scene.add(light);

// Debug helper - add axes to see orientation
// const axesHelper = new THREE.AxesHelper(3);
// scene.add(axesHelper);

// Variables to store loaded model and spheres
let loadedModel = null;
let instancedSpheres = null;
let glowInstancedSpheres = null;

// Function to create spheres at vertices
function createVertexSpheres(vertices) {
  // Remove any existing spheres
  if (instancedSpheres) {
    scene.remove(instancedSpheres);
    scene.remove(glowInstancedSpheres);
  }
  
  console.log(`Creating ${vertices.length} vertex spheres`);
  
  // Create instanced spheres
  const sphereGeometry = new THREE.SphereGeometry(0.025, 8, 8);
  instancedSpheres = new THREE.InstancedMesh(
    sphereGeometry,
    sphereMaterial,
    vertices.length
  );
  
  // Position each sphere at a vertex
  const matrix = new THREE.Matrix4();
  vertices.forEach((vertex, i) => {
    matrix.setPosition(vertex.x, vertex.y, vertex.z);
    instancedSpheres.setMatrixAt(i, matrix);
  });
  
  instancedSpheres.instanceMatrix.needsUpdate = true;
  scene.add(instancedSpheres);
  
  // Add glow effect
  createGlowingInstance(instancedSpheres);
  
  console.log(`Added ${vertices.length} vertex spheres`);
  return instancedSpheres;
}

// Add a simple glow effect using a larger transparent sphere
function createGlowingInstance(instancedMesh) {
  const glowGeometry = new THREE.SphereGeometry(0.075, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.2
  });
  
  glowInstancedSpheres = new THREE.InstancedMesh(
    glowGeometry,
    glowMaterial,
    instancedMesh.count
  );
  
  // Copy matrices from original instanced mesh
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < instancedMesh.count; i++) {
    instancedMesh.getMatrixAt(i, matrix);
    glowInstancedSpheres.setMatrixAt(i, matrix);
  }
  
  glowInstancedSpheres.instanceMatrix.needsUpdate = true;
  scene.add(glowInstancedSpheres);
  return glowInstancedSpheres;
}

// Extract vertices from model
function extractVerticesFromModel(model) {
  const vertices = [];
  
  model.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry;
      
      if (!geometry || !geometry.attributes || !geometry.attributes.position) {
        console.error("Geometry or position attribute missing:", geometry);
        return;
      }
      
      // Extract vertices
      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const vertex = new THREE.Vector3(
          positions[i],
          positions[i + 1],
          positions[i + 2]
        );
        
        // Remove duplicates (optional)
        if (!vertices.some(v => v.distanceTo(vertex) < 0.001)) {
          vertices.push(vertex);
        }
      }
    }
  });
  
  return vertices;
}

// Function to trigger positioning spheres on vertices
function positionSpheresOnVertices() {
  if (!loadedModel) {
    console.error("No model loaded yet!");
    return;
  }
  
  const vertices = extractVerticesFromModel(loadedModel);
  
  if (vertices.length === 0) {
    console.warn("No vertices found in the model");
    return;
  }
  
  // Create spheres at vertices
  createVertexSpheres(vertices);
  
  // Center the spheres to match the model
  const box = new THREE.Box3().setFromObject(loadedModel);
  const center = box.getCenter(new THREE.Vector3());
  
  if (instancedSpheres) {
    instancedSpheres.position.copy(loadedModel.position);
  }
  if (glowInstancedSpheres) {
    glowInstancedSpheres.position.copy(loadedModel.position);
  }
}

// Load the model
function loadModel(url) {
  const loader = new THREE.OBJLoader();
  
  console.log("Starting to load OBJ file...");
  
  loader.load(
    url,
    function (object) {
      console.log("Model loaded successfully:", object);
      
      // Remove previous model if exists
      if (loadedModel) {
        scene.remove(loadedModel);
      }
      
      loadedModel = object;
      
      // Add the model to the scene
      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x000000
            // color: 0x444444,
            // wireframe: true,
            // transparent: true,
            // opacity: 0.3
          });
        }
      });
      
      // Center the model
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      
      scene.add(object);
      
      console.log("Model added to scene. Call positionSpheresOnVertices() to add spheres.");
      
      // Uncomment if you want spheres automatically added when model loads
      // positionSpheresOnVertices();
    },
    function (xhr) {
      if (xhr.lengthComputable) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      } else {
        console.log('Loading in progress...');
      }
    },
    function (error) {
      console.error('Error loading OBJ:', error);
    }
  );
}

// Create a button to trigger sphere positioning
function createUI() {
  const button = document.createElement('button');
  button.textContent = 'Position Spheres on Vertices';
  button.style.position = 'absolute';
  button.style.top = '20px';
  button.style.left = '20px';
  button.style.padding = '10px';
  button.style.zIndex = '100';
  
  button.addEventListener('click', positionSpheresOnVertices);
  document.body.appendChild(button);
  
  // Add load model button
  const loadButton = document.createElement('button');
  loadButton.textContent = 'Load Model';
  loadButton.style.position = 'absolute';
  loadButton.style.top = '20px';
  loadButton.style.left = '220px';
  loadButton.style.padding = '10px';
  loadButton.style.zIndex = '100';
  
  loadButton.addEventListener('click', () => {
    const url = prompt('Enter path to OBJ file:', 'your_model.obj');
    if (url) {
      loadModel(url);
    }
  });
  document.body.appendChild(loadButton);
}

// Initialize UI
createUI();

// Load a default model
loadModel('FireTree.obj');

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  // Pulse the glow (optional)
  const time = Date.now() * 0.001;
  const pulseIntensity = (Math.sin(time) * 0.25) + 0.75;
  
  // Update all instances if you want to animate them
  scene.traverse((child) => {
    if (child instanceof THREE.InstancedMesh && child.material.transparent) {
      child.material.opacity = child.material.opacity * 0.9 + (pulseIntensity * 0.3) * 0.1;
    }
  });
  
  renderer.render(scene, camera);
}

animate();
*/