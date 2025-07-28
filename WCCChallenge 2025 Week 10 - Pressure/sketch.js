

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Adjust camera position as needed

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls (Optional, but very useful)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Animate controls smoothly
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 500;

// Lights
const mainLight = new THREE.AmbientLight(0x404040);
scene.add(mainLight);

// directional light facing away from the user
const headLight = new THREE.DirectionalLight(0x404040, 10.0);
headLight.position.set(0,0,1);
scene.add(headLight);

// leafBlowerBiz
let leafBlower;
const gltfLoader = new THREE.GLTFLoader();
gltfLoader.load('Low Poly LeafBlower.glb', (gltf) => {
    // Model loaded successfully
    leafBlower = gltf.scene;
    // leafBlower.scale.set(10);
    scene.add(leafBlower);
    // Proceed to load and apply texture
    // applyTexture(leafBlower);
}, undefined, (error) => {
    console.error('An error happened while loading the GLB file', error);
});

// function applyTextureToModel(model, texture) {
//     model.traverse((child) => {
//         if (child.isMesh) {
//             if (Array.isArray(child.material)) {
//                 child.material.forEach((material) => {
//                     material.map = texture;
//                     material.needsUpdate = true;
//                 });
//             } else {
//                 child.material.map = texture;
//                 child.material.needsUpdate = true;
//             }
//         }
//     });
// }

// function applyTexture(model) {
//     const textureLoader = new THREE.TextureLoader();
//     textureLoader.load('LeafBlowerTexture.png', (texture) => {
//         // Texture loaded successfully
//         applyTextureToModel(model, texture);
//     }, undefined, (error) => {
//         console.error('An error happened while loading the texture', error);
//     });
// }

// Vine biz
const vinePath = generateVinePath(100, 500); // Length, segments

const vineGroup = new THREE.Group();
for (let i = 1; i < vinePath.length; i++) {
  const segment = createVineSegment(vinePath, i, vinePath.length);
  vineGroup.add(segment);
}
scene.add(vineGroup);


// guidance cube
const guidancePlaneGeometry = new THREE.PlaneGeometry(100, 100);
const guidancePlaneMaterial = new THREE.MeshBasicMaterial({
    color: 0xd4af37,
    transparent: true,
    opacity: 0.25
})
const guidancePlane = new THREE.Mesh(guidancePlaneGeometry, guidancePlaneMaterial);
guidancePlane.position.set(0,0,-50);
scene.add(guidancePlane);

// Balloon
const balloon = createBalloon(1, 32, 32, 0.5, 0.1, 4); // Radius, segments, neck height, neck radius
balloon.position.z = -50;
balloon.position.y = 0;
balloon.position.x = 0;
scene.add(balloon);


// mouse Biz
let mouseX = 0;
let mouseY = 0;
function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove, false);

// mapping the mouseBiz
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// vineGroup.children.forEach((segment) => {
//   for (let i = 0; i < 5; i++) { // Add a few thorns per segment
//     const thorn = createThorn(segment);
//     segment.add(thorn);
//   }
// });


// // Create Vine Segments
// for (let i = 1; i < vinePath.length; i++) {
// const segment = createVineSegment(vinePath, i, vinePath.length);
// vineGroup.add(segment);
// for (let j = 0; j < 5; j++) {
//   const thorn = createThorn(segment);
//   segment.add(thorn);
// }
// }

// lil-gui
const gui = new lil.GUI();
const params = {
    balloonSize: 2,
    leafBlowerScale: 10,
    orbitDistance: 10
}

gui.add(params, 'balloonSize', 1, 3);
gui.add(params, 'leafBlowerScale', 0.1, 10).onChange(scl => leafBlower.scale.set(scl));
gui.add(params, 'orbitDistance', 1, 10);





// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Update Orbit Controls
    vineGroup.position.z += 0.1;

    mouse.x = mouseX;
    mouse.y = mouseY;

    raycaster.setFromCamera(mouse, camera);

    // const intersects = raycaster.intersectObject(guidancePlane);

    // if (intersects.length > 0) {
    //     balloon.position.x = intersects[0].point.x;
    //     balloon.position.y = intersects[0].point.y;
    // }

    if (leafBlower) {
        // Calculate mouse offset from balloon (screen space)
        const mouseOffsetX = mouseX - (balloon.position.x / 10); // scale mouseX to world units.
        const mouseOffsetY = mouseY - (balloon.position.y / 10); // scale mouseY to world units.

        // Calculate orbit angle based on mouse offset
        const orbitAngle = Math.atan2(mouseOffsetY, mouseOffsetX);

        // Calculate leaf blower position
        leafBlower.position.x = balloon.position.x + params.orbitDistance * Math.cos(orbitAngle);
        leafBlower.position.y = balloon.position.y + params.orbitDistance * Math.sin(orbitAngle);
        leafBlower.position.z = balloon.position.z; // Keep Z Coordinate

        // Leaf blower always looks at balloon
        leafBlower.lookAt(balloon.position);
        // leafBlower.rotation.x += Math.PI/2;
        // leafBlower.rotation.z -= Math.PI/2;
        // leafBlower.rotation.x += Math.PI/2;
    }


    renderer.render(scene, camera);
}

// Start the animation loop
animate();


// Resize Handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);
  
 

