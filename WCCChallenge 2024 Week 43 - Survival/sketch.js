/*
Author: Project Somedays
Date: 2024-10-27
Title: WCCChallenge - Survival

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Rock, Scissors, Paper, Lizard, Spock simulator
3D Flocking with hunt and flee behaviours using Octree for optimisation inspired by Patt Vira's Quadtree video
Psst: implemented by Claude.AI with a bit of manual tweaking 🎃

Population graph inspired by Age of Empires - was anyone else MEGA confused by that at age 11?
(In Australia, I got AOE1 out of a cereal packet as part of promotion which DEFINITELY ages me hahaha)

Using that feedback idea I learned from Aaron Reuland for that previous challenge to make drawing the graph super easy.

Interaction:
  - "O" toggles orbitControl
  - "S" shows or hides the scoreboard by either looking at it 90 degrees off to the side
  - "R" toggles global rotations

RESOURCES:
  - Claude.ai
	- Patt Vira's Excellent tutorial: https://m.youtube.com/watch?v=AMugNCfP1NA
  - Meshy.ai for converting text to 3D models! The future is now.

TODO:
  - Fix Broken orbitControl a bit. I suspect it's because I moved the camera in setup. Tried just translating back but that didn't do the trick. hmmm.
*/



// Flock biz
const totalPopulation = 250;
let flock = [];
let octree;
let worldSize;
let populationCounts = [];
const postConversionCooldownFrames = 1;

// Moving models biz
let rockModel, paperModel, scissorsModel, lizardModel, spockModel;
const smoothingFactor = 0.25; // the smaller, the smoother but also the laggier

// Rotation to see scoreboard biz
const animationDuration = 1000; // Rotation duration in milliseconds
let currentRotation = 0;
let targetRotation = 0;
let animating = false;
let startTime;
let isRotated = false;
const newPopCountWidth = 1;

// visual pizzazz biz
const rotationRate = 1200;
// let palette = "#fe218b, #fed700, #21b0fe".split(", ");
let palette = "#ffbe0b, #fb5607, #ff006e, #8338ec, #3a86ff".split(", ");

// graphics buffer biz
let scoreboard;
let winningScreen;
let winningTeam = null;

// toggle controls biz
let rotateInterestinglyMode = true;
let manualControlOn = false;

// camera
let cam;


const TYPES = {
  ROCK: 0,
  PAPER: 1,
  SCISSORS: 2,
  LIZARD: 3,
  SPOCK: 4
};

let typesInOrder = ["ROCK", "PAPER", "SCISSORS", "LIZARD", "SPOCK"]

// const COLORS = {
//   [TYPES.ROCK]: '#fe218b',     
//   [TYPES.PAPER]: '#fed700',    
//   [TYPES.SCISSORS]: '#21b0fe'
// };
const COLORS = {
  [TYPES.ROCK]: '#ffbe0b',     
  [TYPES.PAPER]: '#fb5607',    
  [TYPES.SCISSORS]: '#ff006e',
  [TYPES.LIZARD] : '#8338ec',
  [TYPES.SPOCK] : '#3a86ff'
};

const HUNTS = {
  [TYPES.ROCK]: [TYPES.SCISSORS, TYPES.LIZARD],
  [TYPES.PAPER]: [TYPES.ROCK, TYPES.SPOCK],
  [TYPES.SCISSORS]: [TYPES.PAPER, TYPES.LIZARD],
  [TYPES.LIZARD] : [TYPES.SPOCK, TYPES.PAPER],
  [TYPES.SPOCK] : [TYPES.SCISSORS, TYPES.ROCK]
};

const FLEES_FROM = {
  [TYPES.ROCK]: [TYPES.PAPER, TYPES.SPOCK],
  [TYPES.PAPER]: [TYPES.SCISSORS, TYPES.LIZARD],
  [TYPES.SCISSORS]: [TYPES.ROCK, TYPES.SPOCK],
  [TYPES.LIZARD]: [TYPES.SCISSORS, TYPES.ROCK],
  [TYPES.SPOCK] : [TYPES.LIZARD, TYPES.PAPER]
};

let MODEL2TYPE;

function preload(){
  rockModel = loadModel('Rock.obj', true, () => console.log("Rock model load success"), (err) => console.log("Rock model load err: " + err));
  paperModel = loadModel('Paper.obj', true, () => console.log("Paper model load success"), (err) => console.log("Paper model load err: " + err));
  scissorsModel = loadModel('Scissors.obj', true, () => console.log("Scissors model load success"), (err) => console.log("Scissors model load err: " + err));
  lizardModel = loadModel('Lizard.obj', true, () => console.log("Lizard model load success"), (err) => console.log("Lizard model load err: " + err));
  spockModel = loadModel('Spock.obj', true, () => console.log("Spock model load success"), (err) => console.log("Spock model load err: " + err));

  MODEL2TYPE = {
    [TYPES.ROCK]: rockModel,     
    [TYPES.PAPER]: paperModel,    
    [TYPES.SCISSORS]: scissorsModel,
    [TYPES.LIZARD] : lizardModel,
    [TYPES.SPOCK] : spockModel
  }
}


function setup() {
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createCanvas(1920, 1080, WEBGL);

  cam = createCamera();
  cam.setPosition(0,0,width*2);
  pixelDensity(1);
  rectMode(CENTER);
  worldSize = min(windowWidth, windowHeight) * 2;
  noStroke();
  // scoreboard = createGraphics(width, worldSize);
  scoreboard = createGraphics(width/2, height/2);
  scoreboard.noStroke();
  for(let i = 0; i < palette.length; i++){
    scoreboard.fill(palette[i]);
    scoreboard.rect(0, i*scoreboard.height/palette.length, scoreboard.width, scoreboard.height/palette.length);
  }

  winningScreen = createGraphics(min(width, height), min(width, height));
  winningScreen.noStroke();
  winningScreen.fill(255);
  winningScreen.textAlign(CENTER, CENTER);
  winningScreen.textSize(winningScreen.height/8);
  
  // Create equal numbers of each type
  for (let i = 0; i < totalPopulation; i++) {  // 50 of each type
    flock.push(new Boid(floor(i / (totalPopulation/palette.length))));
  }

}



function draw() {
  background(0);

  // lighting
  directionalLight(255, 255, 255, -0.5,-0.5,-1);
  directionalLight(255, 255, 255, -0.5,0.5,-1);
  directionalLight(255, 255, 255, 0.5,-0.5,-1);
  directionalLight(255, 255, 255, 0.5,0.5,-1);
  
  handleRotation();
  
  // push();
  // rotateY(radians(currentRotation));
  push();
  // Show the scoreboard
  // rotateY(-HALF_PI);
  translate(0,0,3*width);
  texture(scoreboard);
  rect(0,0, width, height);

  pop();

  push(); // flip around slowly
  if(rotateInterestinglyMode){
    rotateX(frameCount * TWO_PI/rotationRate);
    rotateY(-frameCount * TWO_PI/rotationRate);
    rotateZ(frameCount * TWO_PI/rotationRate);
  }
 

  octree = new Octree(new Box(0, 0, 0, worldSize, worldSize, worldSize));
 
  
  for (let boid of flock) {
    octree.insert(boid);
  }
  
  // First update positions
  for (let boid of flock) {
    boid.edges();
    boid.flock(octree);
    boid.update();
  }
  
  // Then check for conversions
  for (let boid of flock) {
    boid.checkConversion(octree);
  }
  
  // Finally render
  for (let boid of flock) {
    boid.show();
  }
  pop();

  populationCounts = updateCounts();
  updateScoreboard();


  

  checkForWinners();
  

  if(manualControlOn) orbitControl();
}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   worldSize = min(windowWidth, windowHeight) * 0.8;
//   for (let boid of flock) {
//     boid.adjustToNewWorldSize();
//   }
// }

function handleRotation(){
  if (animating) {
    let elapsed = millis() - startTime;
    let progress = elapsed / animationDuration;
    
    if (progress >= 1) {
      // Animation complete
      currentRotation = targetRotation;
      animating = false;
    } else {
      // Apply sine easing
      let easedProgress = easeInOutCubic(progress);
      currentRotation = lerp(currentRotation, targetRotation, easedProgress);
    }
  }
}

function showGameOver(winningTeam){
  winningScreen.text(`${winningTeam}\nWINS!`, winningScreen.width/2, winningScreen.height/2);
  texture(winningScreen);
  box(min(width, height));
}

function updateCounts(){
  return  [
    flock.filter(each => each.type === TYPES.ROCK).length,
    flock.filter(each => each.type === TYPES.PAPER).length,
    flock.filter(each => each.type === TYPES.SCISSORS).length,
    flock.filter(each => each.type === TYPES.LIZARD).length,
    flock.filter(each => each.type === TYPES.SPOCK).length
  ]
}

function checkForWinners(){
  for(let i = 0; i < populationCounts.length; i++){
    if(populationCounts[i] === totalPopulation){
      winningTeam = typesInOrder[i];
      showGameOver(winningTeam);
      break;
    }
  }
  // if(winningTeam) noLoop();
}

function updateScoreboard(){
  // copy the previous image except for newPopCountWidth pixels
  scoreboard.copy(
    scoreboard,         // source
    newPopCountWidth, 0,       // source x, y
    scoreboard.width-newPopCountWidth, // source width (all but last 5 pixels)
    scoreboard.height,  // source height (full height)
    0, 0,       // destination x, y (shifted left by 5)
    scoreboard.width-newPopCountWidth, // destination width
    scoreboard.height   // destination height
  );
 
  // draw the latest population graph
  let prevY = 0;
  for(let i = 0; i < populationCounts.length; i++){
    let popCountPixels = map(populationCounts[i], 0, totalPopulation, 0, scoreboard.height);
    scoreboard.fill(palette[i]);
    scoreboard.rect(scoreboard.width - newPopCountWidth, prevY, newPopCountWidth, popCountPixels);
    prevY += popCountPixels;
  }
}

function keyPressed(){
  switch(key.toLowerCase()){
    case 's':
      if (!animating) {
        startTime = millis();
        animating = true;
        isRotated = !isRotated; // Toggle rotation state
        targetRotation = isRotated ? 90 : 0; // Set target based on state
      }
      break;
    case 'o':
      manualControlOn = !manualControlOn;
      break;
    case 'r':
      rotateInterestinglyMode = !rotateInterestinglyMode; 
    default:
      break;
  }
}

function easeInOutCubic(x){
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}