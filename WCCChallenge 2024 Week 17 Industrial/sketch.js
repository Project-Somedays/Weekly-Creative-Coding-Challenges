/*
Author: Project Somedays
Date: 2024-04-08
Title: #WCCChallenge "Industrial"

Made for Sableraph's weekly creative coding challenges, reviewed Sundays on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Building off Dan Shiffman's excellent Inverse Kinematics code: https://www.youtube.com/watch?v=hbgDqyy8bIw

"Formee" deforms with perlin noise. Set the follow target of the "robotic arm" to some of those points.

Brains trust assemble! I'm clearly using curveVertex slightly wrong for me to get that point in the curve at the end... How to fix?!

TODO:
 - Fix curveVertex Biz
 - Sound effects
 - Puppet some fun robot arm png's
 - Refactor to make the different phases nicer
*/

let n = 26;
let minR = 20;
let t;

let phase1Frames = 90;
let phase1LerpCntrl = 0;
let phase2Frames = 90;
let phase2LerpCntrl = 0;
let phase3Frames = 300;
let phase3LerpCntrl = 0;
let phase4Frames = 90;
let totalFrames = phase1Frames + phase2Frames + phase3Frames + phase4Frames;
let currentFrame = 0;

let arm;
let progressionRate = 0.01;
let maxLength;
const armSegments = 3;
let arms = [];

function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  createCanvas(1080, 1080);
  maxLength = width/8;
  t = new Formee(width/2, height/2, width/5);
  for(let i = 0; i < n/2; i++){
    let a = i * TWO_PI/(n/2);
    let basePos = createVector(0.8*width*cos(a) + width/2, 0.8*width*sin(a) + height/2)
    // arms[i] = new Arm(0.5*width*cos(a) + width/2, 0.5*width*sin(a) + height/2, t.pts[i*2].p);
    arms[i] = new Arm(0.5*width*cos(a) + width/2, 0.5*width*sin(a) + height/2, basePos, basePos);
  }

}

function draw() {
  background(0);
  currentFrame = frameCount%totalFrames; // RESET
  if(currentFrame === 0){
    phase1LerpCntrl = 0;
    phase2LerpCntrl = 0; 
    phase3LerpCntrl = 0;
  }

  if(currentFrame <= phase1Frames){ // PHASE 1: Grwo the formee
    phase1LerpCntrl += 1/phase1Frames;
    
    t.updateLerpR();
    t.show();
    for(let i = 0; i < arms.length; i++){
      // arms[i].setTarget(t.pts[i*2].p);
      arms[i].update();
      arms[i].show();
    }
    

  } else if(currentFrame <= phase1Frames + phase2Frames){ // PHASE2: Deploy the arms
    t.show();
    phase2LerpCntrl += 1 / phase2Frames;
    
    for(let i = 0; i < arms.length; i++){
      let tempTarget = p5.Vector.lerp(arms[i].basePos, t.pts[i*2].p, phase2LerpCntrl);
      arms[i].setTarget(tempTarget);
      arms[i].update();
      arms[i].show();
    }
    // t.updateWithNoise();
    
  } else if(currentFrame <= phase1Frames + phase2Frames + phase3Frames){ // PHASE3: Form the Formee
    if(phase3LerpCntrl < 1) phase3LerpCntrl += 1/(phase3Frames/4); // ease in the warping;
    t.updateWithNoise(phase3LerpCntrl)
    t.show();
    for(let i = 0; i < arms.length; i++){
      arms[i].setTarget(t.pts[i*2].p);
      arms[i].update();
      arms[i].show();
    }
  } else if(currentFrame <= phase1Frames + phase2Frames + phase3Frames + phase4Frames){ // PHASE 4: RESET Arms and behold!
    t.show();
    phase2LerpCntrl -= 1 / phase4Frames;
    for(let i = 0; i < arms.length; i++){
      let tempTarget = p5.Vector.lerp(arms[i].basePos, t.pts[i*2].p, phase2LerpCntrl);
      arms[i].setTarget(tempTarget);
      arms[i].update();
      arms[i].show();
    }
  }

}


function easeOutElastic(x){
  const c4 = (2 * Math.PI) / 3;
  
  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
    }