let scene, camera, renderer, controls;
let keyLight, fillLight, backLight;
let modelManager;
// let gui, params;

// let test;
let testnest;
let discs = [];
let openSimplexNoise;
let t = 0;
const noiseScale = 0.05;
const noiseMagnitude = 0.1;
const discCount = 50;
let planeBizMesh;


function setup() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0000);
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild( renderer.domElement );

  openSimplexNoise = new OpenSimplexNoise(new Date());
	
	params = {
		explodeMode: true,
		rotateMode: true
	}
	
	// gui = new lil.GUI();
  // OrbitControls
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  camera.position.z = 5;


  // 3-Point Lighting
  keyLight = new THREE.DirectionalLight( 0xffffff, 1.0 ); // Key light (main light)
  keyLight.position.set( 1, 1, 1 );
  scene.add( keyLight );

  fillLight = new THREE.DirectionalLight( 0xffffff, 0.5 ); // Fill light (softens shadows)
  fillLight.position.set( -1, 0, 1 );
  scene.add( fillLight );

  backLight = new THREE.DirectionalLight( 0xffffff, 0.5 ); // Back light (separates object from background)
  backLight.position.set( 0, -1, -1 );
  scene.add( backLight );

  // discs 
  for(let i = 0; i < discCount; i ++){
    discs.push(new Disc(3, i*Math.PI * 2.0/10.0, i*0.3));
  }

  //planeBiz
  planeBizMesh = createDistortedPlaneWithHole(8.0, 2.0);
  planeBizMesh.position.z = 0.5;
  scene.add(planeBizMesh);
  
}

class Disc{
  constructor(r, theta, z){
    this.r = r;
    this.rNoiseOffset = Math.random()*10000.0;
    this.aNoiseOffset = Math.random()*10000.0;
    this.subANoiseOffset = Math.random()*10000.0;
    this.theta = theta;
    this.dir = Math.random() < 0.5 ? -1 : 1;
    this.p = new THREE.Vector3(0,0,-z);
    this.body = new THREE.Group();
    for(let i = 0; i < 10; i++){
      let col = i >= 8 ? new THREE.Color(0x000000) : new THREE.Color(0xffffff);
      
        const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1 - 0.1*i, 
          0.075, 16,100),
        new THREE.MeshStandardMaterial({color: col})
      )
      const distortedRing = distortMeshWithNoise(ring, i, noiseScale, noiseMagnitude);
      this.body.add(distortedRing);
    }

    scene.add(this.body);
  }
  update(){
    this.theta = mapNoiseVal(this.aNoiseOffset, 0.1, 0.0, TWO_PI);
    this.r = mapNoiseVal(this.rNoiseOffset, 1.0, 3.0, 4.0);
    this.p.x = this.r * Math.cos(this.theta);
    this.p.y = this.r * Math.sin(this.theta);
    this.body.position.copy(this.p);
    this.localA = mapNoiseVal(this.subANoiseOffset, 1.0, 0, TWO_PI);
    this.body.rotation.z = this.localA;
    
  }
}

const mapNoiseVal = (offset, tMult, minVal, maxVal) => map(openSimplexNoise.noise2D(offset, t*tMult), 0, 1, minVal, maxVal); 

// Animation loop
function animate() {
  requestAnimationFrame( animate );
  t += 0.005;
  if(controls) controls.update();
  if(renderer) renderer.render( scene, camera );

  if(discs){

    for(let testnest of discs){
      testnest.update();
    }
  }
}

animate();

// Handle window resizing
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );

function distortMeshWithNoise(mesh, time, noiseScale, noiseMagnitude) {
  if (!mesh || !mesh.geometry) {
    console.error('Invalid mesh input.');
    return;
  }

  const geometry = mesh.geometry;
  if (!geometry.isBufferGeometry) {
    console.error('Geometry must be BufferGeometry.');
    return;
  }

  const originalVertices = geometry.attributes.position.array.slice();
  const positionAttribute = geometry.attributes.position;
  const vertexCount = positionAttribute.count;
  for (let i = 0; i < vertexCount; i++) {
    const x = originalVertices[i*3];
    const y = originalVertices[i*3+1];
    const z = originalVertices[i*3+2];

    const noiseX = openSimplexNoise.noise4D(x * noiseScale, y * noiseScale, z * noiseScale, time);
    const noiseY = openSimplexNoise.noise4D(x * noiseScale + 10, y * noiseScale + 10, z * noiseScale, time);
    const noiseZ = openSimplexNoise.noise4D(x * noiseScale + 20, y * noiseScale + 20, z * noiseScale, time);

    positionAttribute.setX(i, x + noiseX * noiseMagnitude);
    positionAttribute.setY(i, y + noiseY * noiseMagnitude);
    positionAttribute.setZ(i, z + noiseZ * noiseMagnitude);
  }
  positionAttribute.needsUpdate = true;
  return mesh;

}

function createDistortedPlaneWithHole(planeWidth, holeWidth) {
  const geometry = new THREE.PlaneGeometry(planeWidth, planeWidth, 100, 100);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false });

  const openSimplexNoise = new OpenSimplexNoise(Date.now());
  const holeOffset = (planeWidth - holeWidth) / 2;

  const vertices = geometry.attributes.position.array;
  const newVertices = [];
  const newIndices = [];

  const originalIndices = geometry.index.array;
  let newVertexIndex = 0;

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];

    if (x < -holeOffset || x > holeOffset || y < -holeOffset || y > holeOffset) {
      // Vertex is outside the hole
      newVertices.push(x, y, z);
    }
  }

  // Create a mapping of old vertex indices to new vertex indices
  const vertexMap = {};
  for (let i = 0, j = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];

    if (x < -holeOffset || x > holeOffset || y < -holeOffset || y > holeOffset) {
      vertexMap[i / 3] = j / 3;
      j += 3;
    }
  }

  // Generate new indices, excluding those that reference vertices inside the hole
  for (let i = 0; i < originalIndices.length; i += 3) {
    const a = originalIndices[i];
    const b = originalIndices[i + 1];
    const c = originalIndices[i + 2];

    if (vertexMap[a] !== undefined && vertexMap[b] !== undefined && vertexMap[c] !== undefined) {
      newIndices.push(vertexMap[a], vertexMap[b], vertexMap[c]);
    }
  }

  const newGeometry = new THREE.BufferGeometry();
  newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
  newGeometry.setIndex(newIndices);
  newGeometry.computeVertexNormals(); // Important for lighting/shading

  // Distort the new geometry
  const noiseScale = 0.02;
  const noiseStrength = 10;
  const positionAttribute = newGeometry.attributes.position;

  // for (let i = 0; i < positionAttribute.count; i++) {
  //   const x = positionAttribute.getX(i);
  //   const y = positionAttribute.getY(i);
  //   const noiseValue = openSimplexNoise.noise2D(x * noiseScale, y * noiseScale);
  //   positionAttribute.setZ(i, noiseValue * noiseStrength);
  // }

  positionAttribute.needsUpdate = true;

  return new THREE.Mesh(newGeometry, material);
}