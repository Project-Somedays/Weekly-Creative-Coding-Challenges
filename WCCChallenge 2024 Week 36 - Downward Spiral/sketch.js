/*
Author: Project Somedays
Date: 2024-09-04
Title: WCCChallenge 2024 Week 36 - Downward Spiral

RESOURCES:
- Duck model: Pointed Pivots on Turbosquid - https://www.turbosquid.com/3d-models/3d-bathroom-duck-2156511
- Bathtub model: Flytet on Turbosquid - https://www.turbosquid.com/3d-models/free-bath-tub-3d-model/997806
- Three.js
*/

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const clock = new THREE.Clock();

// const noiseScale = 0.1;
// const noise3D = new OpenSimplexNoise(Date.now());
// function getNoiseHeight(x, y, t) {
//     return noise3D(x * noiseScale, y * noiseScale, t*noiseScale); // Scale and offset noise
// }

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
const controls = new THREE.OrbitControls(camera, renderer.domElement);
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

camera.position.set(6.0, 6.0, 6.0);
camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));




//####### LOAD BATHTUB ##########//
// const objloader = new OBJLoader();
const loader = new THREE.OBJLoader();

loader.load(
    // Path to the OBJ file
    'Bathtub.obj',
    
    // Function called when the resource is loaded
    function (object) {
        scene.add(object);
    },

    // Function called while loading is progressing
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // Function called when loading has errors
    function (error) {
        console.error('An error happened', error);
    }
);

//####### LIGHTS ##########//
const pointLight = new THREE.PointLight(0xffffff, 1.25);
pointLight.position.set(0.0, 6.0, 0.0);
scene.add(pointLight);

// const colours = "#f94144, #f3722c, #f8961e, #f9844a, #f9c74f, #90be6d, #43aa8b, #4d908e, #577590, #277da1".split(", ").map(e => new THREE.Color(e));
// // const colours = ['red','blue','yellow','cyan','magenta','green'];
// const getRandElement = (arr) => arr[Math.floor(Math.random(1)*arr.length)];

// let grid = [];
// let n = 50;
// for(let i = 0; i < n; i++){
//     for(let j = 0; j < n; j++){
//         let geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
//         let material = new THREE.MeshToonMaterial({color: getRandElement(colours)});
//         let mesh = new THREE.Mesh(geometry, material);
//         mesh.position.set(i-n/2,0,j-n/2);
//         scene.add(mesh);
//         grid.push({meshBiz: mesh, offset: Math.random(1)*Math.PI*2});
//     }
// }


function animate() {
	const elapsedTime = clock.getElapsedTime();
	
	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;
	// for(let i = 0; i < n; i++){
  //       for(let j = 0; j < n; j++){
  //           let mesh = grid[i*n + j];
  //           // mesh.scale.y = getNoiseHeight(mesh.position.x, mesh.position.z, Math.cos(elapsedTime/2)+0.1)*10;
  //           // mesh.scale.y = getNoiseHeight(mesh.position.x, mesh.position.z, elapsedTime/2)*10;
	// 				mesh.meshBiz.scale.y = (Math.sin(mesh.offset + elapsedTime/2)+0.1)*10.0;
  //       }
  //   }

	// camera.position.set(
  //       10*Math.cos(elapsedTime/3), 10*Math.sin(elapsedTime/3), 10*Math.sin(elapsedTime/3)
  //   )
  //   camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
	controls.update();
	renderer.render( scene, camera );

}

