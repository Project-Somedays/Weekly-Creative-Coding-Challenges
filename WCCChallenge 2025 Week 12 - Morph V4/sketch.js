/*
Author: Project Somedays
Date: 2025-03-23 updated 2025-03-29
Title: WCCChallenge 2025 Week 12 - Morph with Quadtree

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Man. Spent a LONG time trying a 3D version of this with glowing spheres on the vertices of models today in three.js
DEFINITELY coming back to finish that one off.

Flocking sim but a third of the cycle, at the change, 
for each boid we pick a random target inside a polygon and attract it to that 🙂

Claude was very helpful for this one.
*/


let flockingSim;
const numBoids = 500;
let time = 0;
let debug = false;

// Flocking parameters
const alignStrength = 1.0;
const cohesionStrength = 1.0;
const separationStrength = 1.5;
const perceptionRadius = 50;
const maxSpeed = 3;
const maxForce = 0.1;
let targets = [];
let showQuadtree = false;

let currentPolygonSides = 2;

// Attraction parameters
let attractionActive = false;
let attractionRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};
const attractionStrength = 0.3;
const attractionCycleLength = 600; // Frames for complete attraction cycle
let attractionCycleCounter = 0;

function setup() {
  // createCanvas(min(windowWidth, windowHeight),min(windowWidth, windowHeight));
  createCanvas(1080, 1080);
  colorMode(HSB, 255);
  background(0);
  
  // Set up the attraction rectangle in the center
  attractionRect = {
    x: width * 0.3,
    y: height * 0.3,
    width: width * 0.4,
    height: height * 0.4
  };

  // targets = setTargets(currentPolygonSides, numBoids);
  
  // Initialize boids
  // for (let i = 0; i < numBoids; i++) {
  //   boids.push(new Boid(random(width), random(height)));
  // }
  flockingSim = new FlockingSimulation(numBoids);
}

function draw() {
  // Semi-transparent background for motion trails
  fill(0, 10);
  noStroke();
  rect(0, 0, width, height);
  
  // Update attraction cycle
  updateAttractionCycle();
  
  // Update and show boids
  // for (let i = 0; i < boids.length; i++) {
  //   boids[i].flock(boids);
    
  //   if (attractionActive) {
  //     boids[i].attractToTarget();
  //   }
    
  //   boids[i].update();
  //   boids[i].wrapEdges();
  //   boids[i].display();
  // }
  flockingSim.update(attractionActive);
  flockingSim.show();

  // Visualize attraction rectangle when active
  if (attractionActive) {
    noFill();
    // stroke(120, 255, 255, 100);
    // strokeWeight(1);
    // rect(attractionRect.x, attractionRect.y, attractionRect.width, attractionRect.height);
    if(debug){
      for(let boid of boids){
        fill(255);
        stroke(255);
        circle(boid.target.x, boid.target.y, 2);
      }
    }
    
  }
  
  time += 0.01;
}

function updateAttractionCycle() {
  attractionCycleCounter = (attractionCycleCounter + 1) % attractionCycleLength;
  let prevState = attractionActive;
  // Activate attraction for 1/3 of the cycle
  if (attractionCycleCounter < attractionCycleLength / 3) {
    attractionActive = true;
    if(!prevState){
      updatePolygonSides();
      console.log("Updating boid targets");
      flockingSim.setBoidTargets();
    }
  } else {
    attractionActive = false;
  }

  
}



function setTargets(polygonSides, n) {
  const points = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width / 5;

  function isPointInsidePolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];

      const intersect = ((yi > y) != (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function generatePolygonVertices(sides, centerX, centerY, radius) {
    const vertices = [];
    for (let i = 0; i < sides; i++) {
      const angle = map(i, 0, sides, 0, TWO_PI);
      const x = centerX + radius * cos(angle);
      const y = centerY + radius * sin(angle);
      vertices.push([x, y]);
    }
    return vertices;
  }

  const polygonVertices = generatePolygonVertices(polygonSides, centerX, centerY, radius);

  while (points.length < n) {
    const randomX = random(centerX - radius, centerX + radius);
    const randomY = random(centerY - radius, centerY + radius);

    if (isPointInsidePolygon(randomX, randomY, polygonVertices)) {
      points.push(createVector(randomX, randomY));
    }
  }

  return points;
}

function updatePolygonSides(){
  currentPolygonSides++;
  if(currentPolygonSides > 8) currentPolygonSides = 3;
  console.log(`CurrentPolygon Sides: ${currentPolygonSides}`);
}

function keyPressed(){
  if(keyCode === ENTER){
    debug = !debug;
    console.log(`Debug: ${debug}`);
  }
}