/*
Author: Project Somedays
Date: 
Title: 

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

*/


let renderer, scene, camera, controls, lights, clock, aspectRatio;
let grid = [];
let currentGenGrid = [];
let nextGenGrid = [];


function setup(){
  //######### RENDERER ##########//
renderer = new THREE.WebGLRenderer();
// renderer.setSize(1080, 1080);
renderer.setSize( Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight));
const w = Math.min(window.innerWidth, window.innerHeight);
// renderer.setSize(window.innerWidth, window.innerHeight);
aspectRatio = 1;//window.innerWidth / window.innerHeight; // 1
renderer.setAnimationLoop( animate );

document.body.appendChild( renderer.domElement );
clock = new THREE.Clock();

// Add window resize listener
// window.addEventListener('resize', onWindowResize, false);


//######### Scene ##########//
scene = new THREE.Scene();
// scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshNormalMaterial()));

  //######### CAMERA ##########//
camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
camera.position.set(0,0,5);
camera.lookAt(new THREE.Vector3(0,0,0));

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//############ LIGHTS ##############//
lights = setupThreePointLighting(scene);

  gui = new lil.GUI();
  params = {
    // gridX: 100,
    // gridY: 100,
    // gridZ: 100,
    // spanX: 1,
    // spanY: 1,
    // spanZ: 1,
    colour: 0xffffff
  }
  // gui.add(params, 'gridX', 10, 1000,1);
  // gui.add(params, 'gridY', 10, 1000,1);
  // gui.add(params, 'gridZ', 10, 1000,1);
  // gui.add(params, 'spanX', 0.1, 2);
  // gui.add(params, 'spanY', 0.1, 2);
  // gui.add(params, 'spanZ', 0.1, 2);
  gui.addColor(params, 'colour');

  describe("");

  for(let x = 0; x < 20; x++){
    let yzSlice = [];
    for(let y = 0; y < 20; y++){
      let zCol = []; 
      for(let z = 0; z < 20; z++){
        let cell = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshStandardMaterial({color: params.colour, transparent: true, opacity: 0.25}));
        cell.position.set(-2 + x*0.2, -2 + y*0.2, -2 + z*0.2);
        zCol.push(cell);
        scene.add(cell);
      }
      yzSlice.push(zCol);
    }
    grid.push(yzSlice);
  }

  // get currentGenGrid
  for(let x = 0; x < 20; x++){
    let yzSlice = [];
    for(let y = 0; y < 20; y++){
      let zCol = []; 
      for(let z = 0; z < 20; z++){
        zCol.push(random() < 0.05);
      }
      yzSlice.push(zCol);
    }
    currentGenGrid.push(yzSlice);
  }

  applyGenGrid(currentGenGrid);


}



function applyGenGrid(genGrid){
  for(let x = 0; x < 20; x++){
    for(let y = 0; y < 20; y++){
      for(let z = 0; z < 20; z++){
        grid[x][y][z].visible = genGrid[x][y][z]
      }
    }
  }
}

function getNextGenGrid(currentGenGrid){
  let newGenGrid = [];
  for(let x = 0; x < 20; x++){
      let newYZSlice = [];
    for(let y = 0; y < 20; y++){
      let newZCol = [];
      for(let z = 0; z < 20; z++){
        let liveNeighbours = getLiveNeighhourCount(x,y,z);
        let state = currentGenGrid[x,y,z];
        newZCol.push(applyRules(state, liveNeighbours));
      }
      newYZSlice.push(newZCol);
    }
    newGenGrid.push(newYZSlice);
  }
  return newGenGrid
}

function getLiveNeighhourCount(x,y,z){
  // checking neighbours
  let liveNeighbours = 0;
  for(let dx = -1; dx <= 1; dx++){
    for(let dy = -1; dy <= 1; dy++){
      for(let dz = -1; dz <= 1; dz++){
        // ignore coords outside boundaries
        if(x + dx < 0 || x + dx >= 20 || y + dy < 0 || y + dy >= 20 || z + dz < 0 || z + dz >= 20 || (dx === 0 && dy === 0 && dz === 0)) continue;
        liveNeighbours += currentGenGrid[x+ dx][y + dy][z + dz] ? 1 : 0;
      }
    }
  }
  return liveNeighbours;
}

function applyRules(state, liveNeighbours){
  //Rule 1: Survival - A live cell survives if it has 4-5 neighbors
  if(state){
    return liveNeighbours >= 4 && liveNeighbours <= 5
  }
  
  // Rule 2: Birth - A dead cell becomes alive if it has exactly 5 neighbors
  // Rule 3: Death - All other cells die or stay dead
  return liveNeighbours === 5;
}

function draw(){
  const clock = new THREE.Clock();
  animate();
}



function animate() {
	const elapsedTime = clock.getElapsedTime();

  nextGenGrid = getNextGenGrid(currentGenGrid);
  applyGenGrid(nextGenGrid);
  currentGenGrid = nextGenGrid;

	controls.update();
	renderer.render( scene, camera );
}

function keyPressed(){
  if(key === ' '){
    nextGenGrid = getNextGenGrid(currentGenGrid);
    applyGenGrid(nextGenGrid);
    currentGenGrid = nextGenGrid;
  }
}


// function onWindowResize() {
//   // Update camera
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
  
//   // Update renderer
//   renderer.setSize(window.innerWidth, window.innerHeight);
  
//   // Optional: Update any custom render targets
//   // if (yourRenderTarget) {
//   //     yourRenderTarget.setSize(window.innerWidth, window.innerHeight);
//   // }
  
//   // Optional: Update any screen-space calculations
//   // if (yourScreenSpaceEffect) {
//   //     yourScreenSpaceEffect.resolution.set(window.innerWidth, window.innerHeight);
//   // }
// }

