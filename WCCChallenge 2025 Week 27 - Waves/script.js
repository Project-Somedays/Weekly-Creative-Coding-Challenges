let scene, camera, renderer, controls, canvas;
let cube;
let objLoader, textureLoader, soundLoader;
let grid;
let n = 200;
const R = 0.05;
const xStep = R * Math.sqrt(3);
const zStep = R * 1.5;
let test;
let t = 0;

let gui, params;
let minColour, maxColour;

function init() {
    // 1. Scene setup
    scene = new THREE.Scene();

    // 1.1 Gradient Background
    createGradientBackground();

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0,10,10);
    camera.lookAt(0,0,0);

    // 3. Renderer setup
    canvas = document.getElementById('threeCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);

    // 4. Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;

    // 4.1 Gui setup
    gui = new dat.GUI();
    params = {
        xOffsetMultiplier: 0.05,
        zOffsetMultiplier: 0.05,
        amplitude: 1.0,
        period: 4.0,
        progressSpeed: 0.01,
        // maxColour: [0, 0, 255], // RGB values for dat.GUI
        // minColour: [0, 0, 85]
    }

    // minColour = new THREE.Color(params.minColour[0]/255, params.minColour[1]/255, params.minColour[2]/255);
    // maxColour = new THREE.Color(params.maxColour[0]/255, params.maxColour[1]/255, params.maxColour[2]/255);

    gui.add(params, 'xOffsetMultiplier', 0.0, 0.1, 0.001);
    gui.add(params, 'zOffsetMultiplier', 0.0, 0.1, 0.001);
    gui.add(params, 'amplitude', 0.0, 2.0, 0.1);
    gui.add(params, 'period', 0.0, 10.0, 0.1);
    gui.add(params, 'progressSpeed', 0.001, 0.1, 0.001);
    // gui.addColor(params, 'maxColour').onChange(value => {
    //     maxColour.setRGB(value[0]/255, value[1]/255, value[2]/255);
    // });
    // gui.addColor(params, 'minColour').onChange(value => {
    //     minColour.setRGB(value[0]/255, value[1]/255, value[2]/255);
    // });

    // 5. Loaders
    objLoader = new THREE.OBJLoader();
    textureLoader = new THREE.TextureLoader();

    // 6. Set up the spheres
    const geometry = new THREE.CylinderGeometry(R, R, 1, 6);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x0000ff, 
        // flatShading: true, 
        // vertexColors: true 
    });
    
    grid = new THREE.InstancedMesh(geometry, material, n * n);
    
    // Initialize the color attribute
    // const colors = new Float32Array(n * n * 3);
    // grid.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    
    scene.add(grid);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let index = i * n + j;
            let x = j * xStep;
            
            if (i % 2 === 1) {
                x += xStep / 2;
            }
            let z = i * zStep;

            x -= (n - 1) * xStep / 2;
            z -= (n - 1) * zStep / 2;

            dummy.position.set(x, 0, z);
            dummy.updateMatrix();
            grid.setMatrixAt(index, dummy.matrix);
            
            // Set initial color
            // const colorIndex = index * 3;
            // colors[colorIndex] = minColour.r;
            // colors[colorIndex + 1] = minColour.g;
            // colors[colorIndex + 2] = minColour.b;
        }
    }
    
    grid.instanceMatrix.needsUpdate = true;
    // grid.instanceColor.needsUpdate = true;

    // 7. Event Listeners
    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('mousedown', handleMouseDown, false);

    // 8. Lighting Setup
    setupLights();

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let index = i * n + j;
            
            grid.getMatrixAt(index, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.rotation, dummy.scale);
            
            // Calculate wave animation
            let yOffset = Math.sin(params.period * t + (i * params.xOffsetMultiplier) + (j * params.zOffsetMultiplier));
            dummy.position.y = yOffset * params.amplitude;
            
            // Normalize yOffset to 0-1 range for color lerping
            let normY = (yOffset + 1) * 0.5;
            
            dummy.updateMatrix();
            grid.setMatrixAt(index, dummy.matrix);
            
            // Update color by lerping between minColour and maxColour
            // tempColor.copy(minColour).lerp(maxColour, normY);
            
            // Set the color in the instanceColor attribute
            // const colorIndex = index * 3;
            // grid.instanceColor.array[colorIndex] = tempColor.r;
            // grid.instanceColor.array[colorIndex + 1] = tempColor.g;
            // grid.instanceColor.array[colorIndex + 2] = tempColor.b;
        }
    }
    
    grid.instanceMatrix.needsUpdate = true;
    // grid.instanceColor.needsUpdate = true;
    t += params.progressSpeed;

    controls.update();
    renderer.render(scene, camera);
}

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleKeyDown(event) {
    // Key handling code here
}

function handleMouseDown(event) {
    // Mouse handling code here
}

function setupLights() {
    // 1. Ambient Light - Much brighter base illumination
    // const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    // scene.add(ambientLight);

    // 2. Directional Light - Brighter and better positioned
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 5);
    // directionalLight.castShadow = true;
    // directionalLight.shadow.mapSize.width = 1024;
    // directionalLight.shadow.mapSize.height = 1024;
    // directionalLight.shadow.camera.near = 0.5;
    // directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // 3. Point Light - Reduced intensity and moved further away
    const pointLight = new THREE.PointLight(0xff4444, 0.5, 20);
    pointLight.position.set(-5, 8, -5);
    pointLight.castShadow = false; // Disable shadows for better performance
    scene.add(pointLight);
    
    // 4. Additional fill light from below
    const fillLight = new THREE.DirectionalLight(0x4444ff, 0.3);
    fillLight.position.set(0, -5, 0);
    scene.add(fillLight);
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
    gradient.addColorStop(0, '#000080');    // Lighter navy blue in center
    gradient.addColorStop(1, '#0f1419');    // Deep navy blue at edges
    
    // Fill the canvas with the gradient
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create texture from canvas and set as scene background
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
}

init()