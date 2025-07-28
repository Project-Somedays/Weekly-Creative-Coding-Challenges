/*
Author: Project Somedays
Date: 2024-06-10 last updated 2024-06-15
Title: WCCChallenge "Knotwork"

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

https://paulbourke.net/geometry/knots/
https://p5js.org/learn/getting-started-in-webgl-custom-geometry.html
https://en.wikipedia.org/wiki/Torus_knot

ChatGPT for the win with helping me integrate THREE.js with p5.js

Cycling through the values of a "(p,q)-torus knot" blindly copied from wolfram alpha

Cupped hands: https://www.printables.com/model/849757-cupped-hands-with-birds-on-wrist-holder/files

TODO/Opportunities:
- Try changing p
- Get Orbit Control working
- Comparison of different variables
- Restructure to make that easier
*/

import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import {STLLoader} from 'three/addons/loaders/STLLoader.js'


let canvas;
let renderer, scene, camera, cube, ambientLight, ptLight;
let p, q;

let knot;
const cycleFrames = 900;

let orbitControl;
let stl, stlLoader;

let colours = [];

function setup() {
  // Create p5 canvas with WEBGL mode
  // canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas = createCanvas(1080, 1080, WEBGL);
  frameRate(60);
	
	colours = "#ef476f, #ffd166, #06d6a0, #118ab2".split(", ").map(e => new THREE.Color(e));
	// console.log(colours);
	
  // Initialize THREE.js renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas.elt, antialias: true });
  renderer.setSize(width, height);
	
	// Initialize THREE.js scene
  scene = new THREE.Scene();
	
	// Add Lights
	ambientLight = new THREE.AmbientLight( 0x404040, 0.2 ); // soft white light
	scene.add(ambientLight);
	
	ptLight = new THREE.PointLight(0xffffff, 0.2);
	ptLight.position.set(3, 3, 3);
	scene.add(ptLight);
	
	centreLight = new THREE.PointLight(0xffffff, 0.2);
	scene.add(centreLight);

	
	 // Initialize THREE.js camera and move to the side
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(2.125, 2.125, 2.125);
	camera.lookAt(new THREE.Vector3(0,0,0));
  
  // use a group so we can apply rotations to the entire thing
  knot = new THREE.Group();

  // generate 500 spheres at evenly spaced points between t = 0 and t = TWO_PI
  for(let t = 0; t < TWO_PI; t += TWO_PI/2000){
    // let pt = twothreetorusknot(t);
    let pt = pqtorusknot(2,3,t)
    let geometry = new THREE.SphereGeometry(0.05, 32, 16);
    // let material = new THREE.MeshToonMaterial({color: lerpColor()]});
    let material = new THREE.MeshNormalMaterial({});
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pt.x, pt.y, pt.z);
    knot.add(mesh);

    p = 2; // starting here works well
  }

  frameRate(60);
  // add the knot
  scene.add(knot);

  //load the hands
  // stlLoader = new THREE.STLLoader();
  // stlLoader.load('cupped-hands-with-birds-on-the-wrists.stl', function (geometry) {
  //   let material = new THREE.MeshPhongMaterial({ color: 0x0055ff });
  //   stlObject = new THREE.Mesh(geometry, material);
  //   scene.add(stlObject);
  // });

  orbitControl = new OrbitControls(camera, renderer.domElement);
  orbitControl.damping = true;

}

function draw() {
  // Update p5.js background
  background(0);

  
	// if(frameCount % 1200 === 0) p++;
  // cycle through values of p in a pqtorus knot, updating each point
  // let p = 2*cycleVariable(1, 10, 250000);
  p = 2*cycleVariable(2,1, 150000);
  q = 3*cycleVariable(1, 2, 150000);
  
  for(let t = 0; t < knot.children.length; t++){
    let pt = pqtorusknot(p,q,t);
    knot.children[t].position.set(pt.x, pt.y, pt.z);
    // let nv = map(noise(frameCount/300 + t, 0, 1, 0.25, 2));
    let nv = cycleVariable(0.5, 1.5, 500, t*TWO_PI/knot.children.length);
    knot.children[t].scale.set(nv, nv, nv);
  }

  // Spin the knot interestingly
  // knot.rotation.x += TWO_PI/cycleFrames;
  // knot.rotation.y -= TWO_PI/cycleFrames;
  // knot.rotation.z += TWO_PI/cycleFrames;
 
  orbitControl.update();
  
  // Render the THREE.js scene
  renderer.render(scene, camera);
}










