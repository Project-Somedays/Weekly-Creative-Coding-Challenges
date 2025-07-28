/*
Author: Project Somedays
Date: 2024-05-04
Title: #WCCChallenge "Simplify"

Made for Sableraph's weekly creative coding challenges, reviewed Sundays on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Building off Dan Shiffman's excellent Inverse Kinematics code: https://www.youtube.com/watch?v=hbgDqyy8bIw

Cleaned up last week's code: https://openprocessing.org/sketch/2253921 and... don't fix what aint broke? Fit the theme!
Is there some deep metaphor like "what the education system does to young minds who don't fit the mold"? I just think it looks neat.

Sound effect from Pixabay: https://pixabay.com/sound-effects/mechanicalclamp-6217/

Brains trust: how do YOU manage animations with multiple stages? Been experimenting with a couple of different methods, but how SHOULD I be doing it?

Also note: 99% sure I got my easing function backwards to how it usually goes.
*/

const captureMode = false;
let servoSound;

let n = 60;

let t;
let handMode = false;
let arm;
let maxLength;
const armSegments = 6;
let arms = [];
let startP, endP, restP;

let phases = {
  MOVE_IN :       {phaseName: "MOVE_IN",        frames: 30},
  ENGAGE_ARMS:    {phaseName: "ENGAGE_ARMS",    frames: 30},
  SIMPLIFY:       {phaseName: "SIMPLIFY",       frames: 60},
  DISENGAGE_ARMS: {phaseName: "DISENGAGE_ARMS", frames: 30},
  MOVE_OUT:       {phaseName: "MOVE_OUT",       frames: 30}
}
let avR;

let phaseOrder; 

// ---------- CONTROL -------------//
let moveShapeLerpCntrl = 0;
let engageArmsLerpCntrl = 0;
let simplifyLerpCntrl = 0;
let currentFrame = 0;
let currentPhase;
let totalFrames;
let frameCnv;


let handSize;
let hand;

// ---------- RECORDING BIZ ------------- //
const fps = 30;
let capturer;


function preload(){
  hand = loadImage("Hand.png");
  glove = loadImage("glove.png");
  servoSound = loadSound("mechanicalclamp-6217.mp3");
  
}


function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
   createCanvas(1080, 1080);

  capturer = new CCapture({
    format: 'png',
    framerate: fps
  });

	frameCnv = makeFrame();
	describe("Irregular shape moves into the middle of the screen. Robot arms deploy and push the vertices in until the shape is a circle. Circle moves on and the next moves in.");
	
 
  imageMode(CENTER);
	pixelDensity(1);
	if(!captureMode) frameRate(30);

  avR = width/5;
  

  // sorting out phase Biz
  phaseOrder = [phases.MOVE_IN, phases.ENGAGE_ARMS, phases.SIMPLIFY, phases.DISENGAGE_ARMS, phases.MOVE_OUT];
  calculateCumulativeFrames(phaseOrder);
  currentPhase = getCurrentPhase(currentFrame);
  totalFrames = phaseOrder[phaseOrder.length - 1].cumulativeFrames;
  
  // start and end position of 
  startP = createVector(-width/2, height/2);
  endP = createVector(width*1.5, height/2);
  restP = createVector(width/2, height/2);
  maxLength = 0.3*width/armSegments;
  handScaleFactor = 2*maxLength/hand.width;

  t = new Formee(-width/2, height/2, avR);
  t.updateLerpToSimple(1);
  for(let i = 0; i < n; i++){
    let a = i * TWO_PI/(n);
    let basePos = createVector(0.525*width*cos(a) + width/2, 0.525*width*sin(a) + height/2);
    arms[i] = new Arm(0.5*width*cos(a) + width/2, 0.5*width*sin(a) + height/2, basePos, basePos);
  }
  textSize(50);
  textAlign(CENTER, CENTER);
	
}

function draw() {
  background(0);

  if(captureMode && frameCount === 1) capturer.start()
	
  currentFrame = frameCount%totalFrames; // RESET
  if(currentFrame === phases.MOVE_IN.cumulativeFrames) servoSound.play(0,1.2,1,0,4);
  if(currentFrame === phases.SIMPLIFY.cumulativeFrames) servoSound.play(0,1.2,1,0,1.5);
  stroke(255);
	fill(255);
  // text(`currentFrame: ${currentFrame}, phaseFrames: ${currentPhase.cumulativeFrames}`, width/2, height*0.9)


  // ------------------- DETERMINE THE CURRENT FRAME ------------------- //
  if(getCurrentPhase(currentFrame) !== currentPhase){
    currentPhase = getCurrentPhase(currentFrame);
    // console.log(currentPhase.phaseName);
  };

  // ------------------ ON RESET ----------------- //
  if(currentFrame === 0){
    moveShapeLerpCntrl = 0;
    engageArmsLerpCntrl = 0; 
    simplifyLerpCntrl = 0;
    t = new Formee(-width/2, height/2, width/5);
    t.updateLerpToSimple(1);
  }

  switch(currentPhase){

    // ---------------- MOVE IN ------------------- //
    case phases.MOVE_IN:
      moveShapeLerpCntrl += 1/phases.MOVE_IN.frames; // only need to get half way
      t.move(startP, restP, easeInOutSine(moveShapeLerpCntrl));
      t.show();
			image(frameCnv, width/2, height/2);
      for(let a of arms){
        a.update();
        a.show();
      }
      break;

    // ---------------- ENGAGE ARMS ------------------- //
    case phases.ENGAGE_ARMS:
      
      engageArmsLerpCntrl += 1/phases.ENGAGE_ARMS.frames;
      t.show();
      let targetArr = [];
      let absPoints = t.getAbsPoints();
      for(let i = 0; i < n; i++){
        targetArr[i] = p5.Vector.lerp(absPoints[i],arms[i].basePos, easeInOutSine(engageArmsLerpCntrl));
      }
			image(frameCnv, width/2, height/2);
      trackArmsToPoints(targetArr);
      break;

     // ---------------- SIMPLIFY ------------------- //

     case phases.SIMPLIFY:
      simplifyLerpCntrl += 1/phases.SIMPLIFY.frames;
      t.updateLerpToSimple(easeInOutSine(simplifyLerpCntrl));
      t.show();
			image(frameCnv, width/2, height/2);
      trackArmsToPoints(t.getAbsPoints());
      break;

     // --------------- DISENGAGE ----------------- //
     case phases.DISENGAGE_ARMS:
      
      engageArmsLerpCntrl -= 1/phases.ENGAGE_ARMS.frames;
      t.show();
      let disengageTargetArr = [];
      let disengageAbsPoints = t.getAbsPoints();
      for(let i = 0; i < n; i++){
        disengageTargetArr[i] = p5.Vector.lerp(disengageAbsPoints[i],arms[i].basePos, easeInOutSine(engageArmsLerpCntrl));
      }
			image(frameCnv, width/2, height/2);
      trackArmsToPoints(disengageTargetArr);
      break;

    
      // --------------- MOVE OUT --------------- //

    case phases.MOVE_OUT:
      moveShapeLerpCntrl += 1/phases.MOVE_OUT.frames; // only need to get half way
      t.move(endP, restP, easeInOutSine(moveShapeLerpCntrl));
      t.show();
			image(frameCnv, width/2, height/2);
      for(let a of arms){
        // a.update();
        a.show();
      }
      break;


  }

  if (captureMode && frameCount > 5*totalFrames) {
    noLoop();
    console.log('finished recording.');
    capturer.stop();
    capturer.save();
    return;
  }

  if(captureMode) capturer.capture(document.getElementById('defaultCanvas0'));
}

  // ------------------- RETARGET ALL ARMS --------------------- //

  function trackArmsToPoints(targetArr){
    if(targetArr.length !== n) throw Error("Mismatched lengths of arm array and target array");
    for(let i = 0; i < n; i++){
      arms[i].setTarget(targetArr[i]);
      arms[i].update();
      arms[i].show();
    }
  }


// ----------- WHICH PHASE WE IN? --------------- //
function getCurrentPhase(currentFrame){
  // gets the smallest phase greater than currentFrame
  let cumulativeFrames = phaseOrder.map(e => e.cumulativeFrames);
  for(let i = 0; i < cumulativeFrames.length; i++){
    if(currentFrame < cumulativeFrames[i]) return phaseOrder[i];
  }
}

// ----------- GET CUMULATIVE FRAMES --------------- //
function calculateCumulativeFrames(phaseOrder){
  for(let i = 0; i < phaseOrder.length; i++){
    // console.log
    let frameArray = phaseOrder.map(e => e.frames).slice(0,i+1);
    let total = frameArray.length > 0 ? frameArray.reduce((a,b) => a + b) : phaseOrder[0].frames;
    
    phaseOrder[i]["cumulativeFrames"] = total;
    // console.log(`frameArray: ${frameArray}, total: ${total}`);
    // phaseOrder[i]["cumulativeFrames"] = phaseOrder.slice(0,i).reduce((accumulator, currentValue) => a + b.frames);
  }
  // console.log(phaseOrder);
}



function easeInOutSine(x) {
  return 0.5*(cos(PI*x) + 1);
  }

function keyPressed(){
  if(key === ' ') handMode = !handMode;
}

function makeFrame(){
	let frameCnv = createGraphics(width, width);
	
	
	frameCnv.strokeWeight(width/10);
	frameCnv.stroke(25);
	frameCnv.noFill();
	frameCnv.circle(width/2, height/2, width);
	frameCnv.stroke(50);
	frameCnv.strokeWeight(width/80);
	frameCnv.circle(width/2, height/2, width + width/10);
	frameCnv.circle(width/2, height/2, width - width/10);
	return frameCnv;
}