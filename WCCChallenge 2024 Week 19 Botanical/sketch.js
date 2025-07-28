/*
Author: Project Somedays
Date: 2024-05-04
Title: #WCCChallenge "Botanical"

Made for Sableraph's weekly creative coding challenges, reviewed Sundays on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Building off Dan Shiffman's excellent Inverse Kinematics code: https://www.youtube.com/watch?v=hbgDqyy8bIw

Someone mentioned in the stream last week something along the lines of "let's see how the arms are shoe-horned into this next week's topic..." Challenge accepted, sir or madam. Hahahaa.

Took the opportunity to learn how to draw splines to get the wibbly-wobbly arms. Ended up kind of hacking my way through though...

WIP! Very much ran out of time. More to be done here:
- Lots of cleanup
- Secondary motion on the child
- Secondary motion on the bag of seeds
- Water coming out of the watering can
- Wheels turning
- Making a click-based rigging system? At the moment, it's very hacky. 
- Cleaning up the vehicle


*/


// -------------- ARMS BIZ ---------------//
const figureeight  = (x, y, a, t, globA) => createVector(x + a*sin(t), y + a*sin(t)*cos(t)).rotate(globA);
let handMode = true;
let legacyArmMode = false;
let arm;
let maxLength;
const armSegments = 5;
let arms = [];
const armCycleFrames = 120;

// --------------- FLOWERS -------------------//
let f1, f2, f3, f4, f5, f6, f7, f8;
let flowerScale;
let flowerImages = [];
let flowers = [];
const flowerLifeFrames = 300;
const flowerSpawnProbability = 0.6;
const flowerDeathThreshold = 50;
const flowerLerpSpeed = 1/30;
const flowerPropofScreen = 0.02;
const flowerPossibleSpawnPerFrame = 20;
const flowerSpeed = 5;
const easeInOutQuad = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; // https://easings.net/#easeInOutCubic
let flowerDir;

// --------------- PUPPETS ------------------ //
let car; 
let head;
let glove;
let gloveSclFactor;
let carSclFactor;
let headSclFactor;
let catInTheHat;
let handSize;
let yardstick;


// ---------- RECORDING BIZ ------------- //
const fps = 30;
let capturer;
let m;
const captureMode = false;

function preload(){
  glove = loadImage("glove.png");
  head = loadImage("Head.png");
  car = loadImage("Vehicle.png");
  f1 = loadImage("f1@2x.png");
  f2 = loadImage("f2@2x.png");
  f3 = loadImage("f3@2x.png");
  f4 = loadImage("f4@2x.png");
  f5 = loadImage("f5@2x.png");
  f6 = loadImage("f6@2x.png");
  f7 = loadImage("f7@2x.png");
  f8 = loadImage("f8@2x.png");
}


function setup() {
  // createCanvas(windowWidth, windowHeight);
   createCanvas(1080, 1080);

  yardstick = min(width, height);

  imageMode(CENTER);
  noFill();
  stroke(255);

  
  maxLength = width/10;
  gloveSclFactor = 0.1*yardstick/glove.width;
  carSclFactor = 0.5*yardstick/car.width;
  headSclFactor = 0.5*yardstick/head.width;
  m = createVector(mouseX, mouseY);
  catInTheHat = new Car(width*0.45, height*0.5, carSclFactor, headSclFactor);

  capturer = new CCapture({
    format: 'png',
    framerate: fps
  });

 

	describe("The Cat in the Hat handy car planting flowers as it bumps along. It's unclear whether the kid is ok with being there or not.");
	
  stroke("#1f6cfe");
  strokeWeight(10);

  // ---------- FLOWER BIZ ------------//
  flowerDir = p5.Vector.sub(createVector(0,0), createVector(width/2, height*0.15)).setMag(flowerSpeed);
  flowerScale = flowerPropofScreen*yardstick/f1.width; // scale to 5% of the width of the image;
  flowerImages = [f1, f2, f3, f4, f5, f6, f7, f8];
  
  
	
}

function draw() {
  background(0);

  if(captureMode && frameCount === 1) capturer.start()
  
  
  
  

  m.set(mouseX-width/2, mouseY-height/2);
  // trackArmsToPoints([m]);

  // updating flowers
  for(let f of flowers){  
    f.update();
    f.show();
  }
  cleanUpDeadFlowers();
  

  catInTheHat.update();
  catInTheHat.trackArmsToPoints(0);
  catInTheHat.show();
  catInTheHat.trackArmsToPoints([m,m],1);


  


  if (captureMode && frameCount > 5*totalFrames) {
    noLoop();
    console.log('finished recording.');
    capturer.stop();
    capturer.save();
    return;
  }

  if(captureMode) capturer.capture(document.getElementById('defaultCanvas0'));
}

function spawnFlowers(x,y, layer){
  for(let i = 0; i < flowerPossibleSpawnPerFrame; i++){
    if(random(1) >= flowerSpawnProbability){
      continue;
    }
    let img = random(flowerImages);
    let rPerm = randomGaussian()*width/30;
    let a = random(TAU);
    flowers.push(new Flower(x + rPerm*cos(a),y + rPerm*sin(a), img, layer));
  }
}

function cleanUpDeadFlowers(){
  // remove dead flowers from flowers
  for(let i = flowers.length - 1; i >= 0; i --){
    if(flowers[i].isDead) flowers.splice(i,1);
  }
}



function easeInOutSine(x) {
  return 0.5*(cos(PI*x) + 1);
  }

function keyPressed(){
  if(key === ' ') legacyArmMode = !legacyArmMode;
}

function mousePressed(){
  if(mouseButton === LEFT){
    spawnFlowers(mouseX, mouseY);
 
  }

  
}