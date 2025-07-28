/*
Author: Project Somedays
Date: 2024-06-24
Title: WCCChallenge "Pride Flags"

Decided to hack away with the help of ChatGPT to get some 3D Pride flags to recreate the classic scene from Le Mis
*/



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


camera.position.set(5.0, 5.0, 5.0);
camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

//####### LIGHTS ##########//
// const pointLight = new THREE.PointLight(0xffffff, 1.25);
// pointLight.position.set(0.0, 6.0, 0.0);
// scene.add(pointLight);
const ambientLight = new THREE.AmbientLight(0xffff);
scene.add(ambientLight);

// controls
// const controls = new THREE.OrbitControls(camera, renderer.domElement)
// controls.enableDamping = true
// controls.dampingFactor = 0.25
// controls.enableZoom = false

// // test add cube
const geometry = new THREE.BoxGeometry( 1, 1, 1); 
const material = new THREE.MeshStandardMaterial( {color: 0x00FFFF, wireframe: false} ); 
const cube = new THREE.Mesh( geometry, material ); 
scene.add( cube );

// Set up the physics world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

// Cloth parameters
const clothWidth = 10;
const clothHeight = 6;
const segmentsX = 10;
const segmentsY = 6;
const mass = 0.1;

// Create cloth geometry
const clothGeometry = new THREE.PlaneGeometry(clothWidth, clothHeight, segmentsX, segmentsY);
const clothMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    side: THREE.DoubleSide, 
    wireframe: false 
});


// Create cloth particles in physics world
const particles = [];
const particleMass = mass / (segmentsX * segmentsY);
const restDistanceX = clothWidth / segmentsX;
const restDistanceY = clothHeight / segmentsY;

// Create constraints (springs) between particles
function connectParticles(p1, p2) {
  const distance = p1.position.distanceTo(p2.position);
  const spring = new CANNON.DistanceConstraint(p1, p2, distance);
  world.addConstraint(spring);
}

function generateCloth(){
  for (let y = 0; y <= segmentsY; y++) {
    for (let x = 0; x <= segmentsX; x++) {
        const particle = new CANNON.Body({
            mass: particleMass
        });
        particle.addShape(new CANNON.Particle());
        particle.position.set(x * restDistanceX - clothWidth / 2, -y * restDistanceY + clothHeight / 2, 0);
        world.addBody(particle);
        particles.push(particle);
    }
  }



  for (let y = 0; y < segmentsY; y++) {
      for (let x = 0; x < segmentsX; x++) {
          connectParticles(particles[y * (segmentsX + 1) + x], particles[y * (segmentsX + 1) + x + 1]);
          connectParticles(particles[y * (segmentsX + 1) + x], particles[(y + 1) * (segmentsX + 1) + x]);
      }
  }

  for (let x = 0; x < segmentsX; x++) {
      connectParticles(particles[segmentsY * (segmentsX + 1) + x], particles[segmentsY * (segmentsX + 1) + x + 1]);
  }

  for (let y = 0; y < segmentsY; y++) {
      connectParticles(particles[y * (segmentsX + 1) + segmentsX], particles[(y + 1) * (segmentsX + 1) + segmentsX]);
  }

// Pin the top row of particles
  for (let x = 0; x <= segmentsX; x++) {
      particles[x].mass = 0;
  }

}

generateCloth();



// Load the pride flag texture
const loader = new THREE.TextureLoader();
loader.load('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Philadelphia_Pride_Flag.svg/768px-Philadelphia_Pride_Flag.svg.png?20180405215531', (texture) => {
    clothMaterial.map = texture;
    clothMaterial.needsUpdate = true;
});

const clothMesh = new THREE.Mesh(clothGeometry, clothMaterial);
scene.add(clothMesh);




const clock = new THREE.Clock();
function animate() {
	const elapsedTime = clock.getElapsedTime();

    world.step(1 / 60);
    
    applyWindForce();

    // // Update cloth geometry
    // clothGeometry.vertices.forEach((vertex, i) => {
    //     const particle = particles[i];
    //     vertex.copy(particle.position);
    // });
    // clothGeometry.computeVertexNormals();
    // clothGeometry.verticesNeedUpdate = true;
    // clothGeometry.normalsNeedUpdate = true;

	renderer.render( scene, camera );

}





// Add wind force
function applyWindForce() {
    const windStrength = Math.cos(Date.now() / 7000) * 20 + 40;
    const windForce = new THREE.Vector3(Math.sin(Date.now() / 2000) * windStrength, Math.cos(Date.now() / 3000) * windStrength, Math.sin(Date.now() / 1000) * windStrength);
    
    particles.forEach(particle => {
        particle.applyForce(windForce, particle.position);
    });
}

// Animate the scene
// const clock = new THREE.Clock(new Date())
// function animate() {
//     const elapsedTime = clock.getElapsedTime();
//     // world.step(1 / 60);
    
//     // applyWindForce();

//     // Update cloth geometry
//     // clothGeometry.vertices.forEach((vertex, i) => {
//     //     const particle = particles[i];
//     //     vertex.copy(particle.position);
//     // });
//     // clothGeometry.computeVertexNormals();
//     // clothGeometry.verticesNeedUpdate = true;
//     // clothGeometry.normalsNeedUpdate = true;

//     renderer.render(scene, camera);
// }

// camera.position.z = 20;


