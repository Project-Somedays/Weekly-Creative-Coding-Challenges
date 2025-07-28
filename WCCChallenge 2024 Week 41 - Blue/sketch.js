/*
Author: Project Somedays
Date: 2024-10-09
Title: WCCChallenge 2024 Week 41 - Blue

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

RBG colours are pretty interesting. Anyone else remember being a bit blown away by how light behaves VERY differently to mixing paints?

Loading coloured ColourGrapes in proportion to their channel strengths into the machine. Outputting colours that are technically blue:
Pick a random blue values from 25 to 255 and then red and green is somewhere between 0 and 80% of that.

The ooze at the bottom is, courtesy of Claude.ai and the Graham Scan algorithm, a convex hull of colourGrapes > height/2

INTERACTION:
 - Hit 's' to toggle sounds
 - Hit 'm' to toggle showing the machine

RESOURCES:
- Matter.js: https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.min.js
- Dan Shiffman/Coding Train video on wrapping Matter.js objects: https://www.youtube.com/watch?v=urR596FsU68&list=PLRqwX-V7Uu6bLh3T_4wtrmVHOrOEM1ig_
- Engine noises: https://pixabay.com/sound-effects/steam-engine-loop-43171/
- Squishy sounds: https://pixabay.com/sound-effects/slime-squish-12-219047/
- Ping sound: https://pixabay.com/sound-effects/ping-82822/
- Dropping sound: https://pixabay.com/sound-effects/dropping-a-heap-of-small-things-47348/
- Machine: AI-generated from NightCafeCreator: https://creator.nightcafe.studio/creation/SwxAPvrL02aPgWtSQxCP?ru=projectsomedays

*/


const targetImagePropOfHeight = 0.75;
const wallColour = "#703a18";
const systemFriction = 0.001; 
const systemStaticFriction = 0.001;
const ballRadiusPropOfWidth = 0.015;

let playSounds = true;
let shakeMode = false;
let currentColour;
let r, g, b;
let ballRadius;
let wallThick;
let wallHeight;
let imgScale;
let showMachine = true;
let colourGrapes = [];
let funnelLeft, funnelRight;
let pipeLeft, pipeRight;

// Matter.js biz
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint;
let engine, world;

// let barrelFront, barrelBack;
let machine;
let machineSounds;
let squishSound;
let ping;
let ballDropSound;


function preload(){
  machine = loadImage("Machine.png");
  machineSounds = loadSound("steam-engine-loop-43171.mp3");
  squishSound = loadSound("slime-squish-14-219049.mp3");
  ping = loadSound("ping-82822.mp3");
  ballDropSound = loadSound("dropping-a-heap-of-small-things-47348.mp3");
}

function setup() {
  // createCanvas(windowHeight/sqrt(2), windowHeight);
  createCanvas(1920/sqrt(2), 1920);
  imageMode(CENTER);
  setProportionalVariables();
  // Matter.js world biz
  engine = Engine.create();
  world = engine.world;
  engine.world.gravity.y = 1.5;
  currentColour = generateBlue();//random(palette);
  colourGrapes = loadNewBallSet(currentColour);
  rectMode(CENTER);

  generateWalls();
  noStroke();

  
  ballDropSound.play();

  describe("Coloured balls are funneled into a steampunk machine in proportion to their colour channels to make the target colour at the output");
}



function draw() {
  background(255);

  Engine.update(engine); // tick over the Matter.js sim

  shakeModeOnIfColourGrapesInsideMachine();
  if(shakeMode && playSounds){
    if(!machineSounds.isPlaying()) machineSounds.play();
    if(!squishSound.isPlaying()) squishSound.play();
  }
  
  // draw the funnel
  showWall(funnelLeft);
  showWall(funnelRight);

  
  showColourGrapes(); // only show colourGrapes individually during the pour
  
  showColourOoze(); // find and fill in the convex hull of colourGrapes > height/2
  
  
  
  // shake a bit if in shakeMode and draw the machine
  let xShake = shakeMode ? random(-2, 2) : 0;
  let yShake = shakeMode ? random(-1, 1) : 0;
  push();
  translate(width/2 + xShake, height/2 + yShake);
  
  if(showMachine){
    rect(0, 0, width/4, height/4); // show the target colour in the window of the machine
    image(machine, xShake, yShake, machine.width*imgScale, machine.height*imgScale);
  }
  pop();
  

  cleanUpColourGrapes();


  // reset grapes
  if(colourGrapes.length === 0){
    currentColour = generateBlue()//random(palette);
    colourGrapes = loadNewBallSet(currentColour);
    ping.play();
    ballDropSound.play();
  }
}

function showWall(rectBody){
  fill(wallColour);
  push();
  translate(rectBody.position.x, rectBody.position.y)
  rotate(rectBody.angle);
  rect(0, 0, wallThick, wallHeight);
  pop();
}

function cleanUpColourGrapes(){
  for(let i = colourGrapes.length - 1; i >= 0; i--){
    if(colourGrapes[i].body.position.y < height + ballRadius) return;
    World.remove(world, colourGrapes[i].body);
    colourGrapes.splice(i, 1);
  }
}

function loadNewBallSet(col){
  let balls = [];
  function loadBalls(n, c, x){
    for(let i = 0; i < n; i++){
      let newColourGrape = new ColourGrape(x + random(-width/8, width/8),-random(height), c);
      balls.push(newColourGrape);
      World.add(world, newColourGrape.body);
    }
  }
  loadBalls(red(col), color(255, 0, 0), width/4);
  loadBalls(green(col), color(0,255,0), width/2);
  loadBalls(blue(col), color(0,0,255), width*0.75);
  return balls;
}

function shakeModeOnIfColourGrapesInsideMachine(){
  shakeMode = false;
  for(let b of colourGrapes){
    if(b.body.position.y > height/4 && b.body.position.y < height*0.75){
      shakeMode = true;
      break;  
    }
  }
}

function showColourGrapes(){
  for(let b of colourGrapes){
    b.update();
    if(b.body.position.y < height/2) b.show();
  }
}

function showColourOoze(){
  fill(currentColour);
  let hull = findConvexHull(colourGrapes.filter(each => each.body.position.y > height/2).map(each => createVector(each.body.position.x, each.body.position.y)));
  beginShape();
  for(let pt of hull){
    curveVertex(pt.x, pt.y);
  }
  endShape(CLOSE);
}


function setProportionalVariables(){
  ballRadius = width*ballRadiusPropOfWidth;
  wallThick = width/20;
  wallHeight = height*0.45;
  imgScale = height*targetImagePropOfHeight / machine.height;
}

function generateWalls(){
 
  funnelLeft = Bodies.rectangle(width*0.2, height/8, wallThick, wallHeight, {isStatic: true, angle: -QUARTER_PI, friction: systemFriction, frictionStatic: systemStaticFriction});
  funnelRight = Bodies.rectangle(width*0.8, height/8, wallThick, wallHeight, {isStatic: true, angle: +QUARTER_PI, friction: systemFriction, frictionStatic: systemStaticFriction});
  World.add(world, funnelLeft);
  World.add(world, funnelRight);

  pipeLeft = Bodies.rectangle(width*0.4, height*0.5, wallThick, wallHeight*1.05, {isStatic: true, friction: systemFriction, frictionStatic: systemStaticFriction});
  pipeRight = Bodies.rectangle(width*0.6, height*0.5, wallThick, wallHeight*1.05, {isStatic: true, friction: systemFriction, frictionStatic: systemStaticFriction});
  World.add(world, pipeLeft);
  World.add(world, pipeRight);
}

function keyPressed(){
  switch(key.toLowerCase()){
    case 'm':
      showMachine = !showMachine;
      break;
    case 's':
      playSounds = !playSounds;
      if(playSounds){
        machineSounds.loop();
        squishSound.loop();
      } else {
        machineSounds.stop();
        squishSound.stop();
      }
      break;
    default:
      break;
  }
}


function generateBlue(){
  let blue = int(random(50, 256));
  let green = int(random(0, 0.66*blue));
  let red = int(random(0, 0.66*blue));
  return color(red, green, blue);
}


// function windowResized() {
//   resizeCanvas(windowHeight/sqrt(2), windowHeight);
//   World.remove(world, funnelLeft);
//   World.remove(world, funnelRight);
//   World.remove(world, pipeLeft);
//   World.remove(world, pipeRight);
//   setProportionalVariables();
//   generateWalls();
// }


// Thanks Claude.ai!
function findConvexHull(points) {
  // Helper function to calculate the cross product of vectors OA and OB
  function cross(O, A, B) {
    return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
  }

  // Sort points lexicographically (first by x-coordinate, then by y-coordinate)
  points.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);

  const n = points.length;
  const hull = [];

  // Build lower hull
  for (let i = 0; i < n; ++i) {
    while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], points[i]) <= 0) {
      hull.pop();
    }
    hull.push(points[i]);
  }

  // Build upper hull
  const lowerHullSize = hull.length;
  for (let i = n - 2; i >= 0; --i) {
    while (hull.length > lowerHullSize && cross(hull[hull.length - 2], hull[hull.length - 1], points[i]) <= 0) {
      hull.pop();
    }
    hull.push(points[i]);
  }

  // Remove the last point as it's the same as the first point
  hull.pop();

  return hull;
}