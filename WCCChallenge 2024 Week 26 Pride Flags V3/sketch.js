/*
Author: Project Somedays
Date: 2024-06-29
Title: WCCChallenge "Pride Flags"

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Inverse Kinematic worms move around the screen with perlin noise (chasing 'followPoints')
On click, the bounding boxes shrink to force them to form the Pride flag! Or close enough.
Click again, the bounding boxes for the Perlin noise expand again

Let's be honest though, they look more like maggots. It's pleasingly upsetting to me 😅

Code focus: Strictly apply the Law of Demeter aka the principle of least knowledge (Note: Been watching ArjanCodes: https://www.youtube.com/@ArjanCodes)
My aim was to keep the IK worm class and the followpoints completely ignorant of each other for reusability.
Have done quite a few IK projects now and there's been way more fussing about than I'd like for each.

The followPoints and worms are stored together in a followWorm object and a function feeds the necessary info from one to the other.
Bounding boxes are also stored separately.
Store a reference to the relevant colour box to each followWorm object and then update the bounding box as required.

I'll keep tinkering.

RESOURCES
  - ChatGPT for the implementation of Inverse Kinematics. Pretty sure it's stolen Dan Shiffman's though hahaha Very familiar.

INTERACTION
  - LEFT CLICK: toggles flag formation
  - 'd': toggles debugMode where you can see the bounding boxes
*/

let prideColours; 
const noiseProgRate = 75; // how much should the worms move about? Higher = slower movement.
const wormSegments = 5; // costly to go higher
const wormsPerColour = 50;
let segLength;
let debugMode = false;

let followWorms;
let boundingBoxes;
const convergeFrames = 90;
let convergeCntrl = 0;
let convergeMode = false;

// proportional constants
let yardstick;
let maxWeight;
let minWeight;
let autoMode = true;

const mapToBounds = (minVal, maxVal, noiseOffset) => map(noise(frameCount/noiseProgRate + noiseOffset), 0, 1, minVal, maxVal);
const ease = (x) =>  0.5*(-cos(x * PI) + 1);

function setup() {
  // createCanvas(windowWidth, windowHeight);
  createCanvas(1080, 1080);
  pixelDensity(1);
  followWorms = [];
  boundingBoxes = [];
  yardstick = min(width, height);
  maxWeight = yardstick/25;
  minWeight = yardstick/50;
  segLength = yardstick/50;
  
  prideColours= "#E40303, #FF8C00, #FFED00, #008026, #004CFF, #732982".split(", ").map(e => color(e));

  rectMode(CORNERS);

 
  // set bounding boxes
  // flag should be width:height 5:4
  let flagWidth = 0.6*width;
  let flagHeight = 0.8*flagWidth;
  let stripThick = flagHeight/prideColours.length;

  // make the bounding boxes by colour band
  for(let i = 0; i < prideColours.length; i++){
    let tlx = 0;
    let tly = height/2 - flagHeight/2 + (i-0.5)*stripThick;
    let brx = width;
    let bry = tly + 1.5*stripThick;
    
    boundingBoxes.push({
      colour: prideColours[i],
      defaultTL: createVector(-0.2*width,0),
      defaultBR: createVector(1.2*width,height),
      targetTL: createVector(tlx, tly),
      targetBR: createVector(brx, bry),
      currentTL: createVector(-0.2*width,0),
      currentBR : createVector(1.2*width,height)
    })
    
  }

  // console.log(boundingBoxes);

  // make the worms with a reference to their relevant bounding box
  for(let i = 0; i < prideColours.length; i++){
    for(let j = 0; j < wormsPerColour; j++){
      followWorms.push(
        {
          colour: prideColours[i],
          followPoint : new FollowPoint(prideColours[i]),
          worm: new Worm(wormSegments,segLength,random(width),random(height), prideColours[i]),
          boundingBox: boundingBoxes[i]
        }
      )
    }
  }

  // randomise the order so they slither over each other in the draw order
  shuffleArray(followWorms); 

  describe("Worms move randomly around the screen. Click toggles the formation of a Pride flag out of their wriggling bodies!");
}

function draw() {
  background(0);

  if(autoMode) convergeMode = cos(frameCount * TWO_PI/(convergeFrames*4)) <= 0;

  if(convergeMode && convergeCntrl <= 1 ) convergeCntrl += 1/convergeFrames;
  if(!convergeMode && convergeCntrl >= 0) convergeCntrl -= 1/convergeFrames;
  
  // converge t
  for(let i = 0; i < boundingBoxes.length; i++){
    let b = boundingBoxes[i];
    b.currentTL = p5.Vector.lerp(b.defaultTL, b.targetTL, ease(convergeCntrl));
    b.currentBR = p5.Vector.lerp(b.defaultBR, b.targetBR, ease(convergeCntrl));
    noFill();
    stroke(b.colour);
    strokeWeight(5);
    if(debugMode) rect(b.currentTL.x, b.currentTL.y, b.currentBR.x, b.currentBR.y);
  }


  for(fw of followWorms){
    directWormWithinBounds(fw);
  }

  
}

// could be stored with the object? Meh.
function directWormWithinBounds(fw){
  fw.followPoint.update(fw.boundingBox.currentTL.x,fw.boundingBox.currentTL.y, fw.boundingBox.currentBR.x, fw.boundingBox.currentBR.y);
  fw.worm.updateAndShow(fw.followPoint.p.x, fw.followPoint.p.y);
}

// thanks ChatGPT
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

//########## INTERACTION ##########//
function mousePressed(){
  if(mouseButton === LEFT) convergeMode = !convergeMode;
  // console.log(`convergeMode: ${convergeMode}`);
}

function keyPressed(){
  switch(key.toLowerCase()){
    case 'd':
      debugMode = !debugMode;
      break;
    default:
      break
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup();
}

