/*
Author: Project Somedays
Date: 2025-02-05
Title: WCCChallenge 2025 Week 05 - From 0 to 1

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Back to making time for the challenges for 2025! Very keen. Not all will be so literal I promise 😅

Always been really impressed with those collage artworks that look like 100% randomness from anything other than a really specific angle.
Even moreso with those that manage to be two different things from two different angles.

For this one, I just asked of a 3D grid: is this shape part of both silhouettes? 
Like many projects, this one is a start in exploring that whole kettle of fish.

For a bit of visual interest, thought I'd use 4D opensimplexnoise to set the HSB colours 🥰

RESOURCES:
 - RubikmonoOne-Regular font: https://fonts.google.com/specimen/Rubik+Mono+One
 - OpenSimplexNoise: This Coding Train sketch I found on p5.js https://editor.p5js.org/codingtrain/sketches/MPqnctIGg
 - 0 and 1 models: used Blender 🙂
 - EaseInOutElastic easing function: https://easings.net/#easeInOutElastic

*/
let canvasZero, canvasOne;
let rubikMonoOne;
const step = 50;
let pts = [];
let zeroModel, oneModel;
let cycleFrames = 90;
let phase = 0;
let noiseZoom = 300;
let noiseProgression = 0.01;
let opensimplexnoise; 


function preload(){
  rubikMonoOne = loadFont("RubikMonoOne-Regular.ttf");
  zeroModel = loadModel("0.obj", true, () => console.log("Successfully loaded 0 model! 🙂"), () => console.log("Uh oh. Error loading 0 model 😢"))
  oneModel = loadModel("1.obj", true, () => console.log("Successfully loaded 0 model! 🙂"), () => console.log("Uh oh. Error loading 0 model 😢"))
  }

function setup() {
  // createCanvas(min(windowWidth, windowHeight),min(windowWidth, windowHeight), WEBGL);
  createCanvas(1080, 1080, WEBGL);
  
  canvasZero = createGraphics(width, height);
  canvasOne = createGraphics(width, height);
  drawOnGraphic(canvasZero, '0');
  drawOnGraphic(canvasOne, '1');
  rectMode(CENTER);
  ortho();
  opensimplexnoise = new OpenSimplexNoise(Date.now());

  // stroke(0);
  noStroke();
  // fill(255);
  pts = intersectGraphics(canvasZero, canvasOne);
  noCursor();
}

function draw() {
  background(0);

  pointLight(255,255, 255, 0,0,0); // light from the center
  directionalLight(255, 255, 255, 0, -1, 0); // light from below
  directionalLight(255, 255, 255, 0, 1, 0); // light from above
  
  let progress = (frameCount % cycleFrames) / cycleFrames;
  if(progress === 0){
    phase = (phase + 1)%2;
    console.log(phase);
  } // cycle back
  let rotY = phase === 0 ? map(easeInOutElastic(progress), 0, 1, 0, HALF_PI) : map(easeInOutElastic(progress), 0, 1, HALF_PI, TWO_PI);
  rotateY(rotY);

  colorMode(HSB, 360, 100, 100);
  for(let pt of pts){
    
    let n = opensimplexnoise.noise4D(pt.p.x/noiseZoom, pt.p.y/noiseZoom, pt.p.z/noiseZoom, frameCount*0.02);
    
    fill(int(n*360), 100, 100);
    push();
    translate(pt.p.x, pt.p.y, pt.p.z);
    scale(0.25);
    rotateY(frameCount * 0.01 + pt.yOffset);
    rotateX(frameCount * 0.01 + pt.xOffset);
    rotateZ(frameCount * 0.01 + pt.zOffset);
    model(pt.m);
    pop();
  }
  colorMode(RGB, 255);

  orbitControl();
}

function drawOnGraphic(cnv, char){
  cnv.background(0);
  cnv.noStroke();
  cnv.fill(255);
  cnv.textFont(rubikMonoOne);
  cnv.textSize(cnv.height);
  cnv.textAlign(CENTER, CENTER);
  cnv.text(char, cnv.width/2, cnv.height/2);
}

function intersectGraphics(cnvA, cnvB){
  let validPoints = []
  for(let x = -width/2; x < width/2; x += step){
    for(let y = -height/2; y < height/2; y += step){
      for(let z = -width/2; z < width/2; z += step){
        // Convert to graphics coordinates (which use top-left as origin)
        let graphicsX = x + width/2;
        let graphicsY = y + height/2;

        // console.log(brightness(cnvA.get(graphicsX, graphicsY)));
        
        if(brightness(cnvA.get(graphicsX, graphicsY)) === 100 && 
           brightness(cnvB.get(z + width/2, graphicsY)) === 100) {
          validPoints.push({
            p: createVector(x, y, z), 
            m: random() < 0.5 ? zeroModel : oneModel, 
            xOffset: random(TWO_PI),
            yOffset: random(TWO_PI),
            zOffset: random(TWO_PI)
          }
          );
        }
      }
    }
  }
  return validPoints;
}

function easeInOutSine(x){
  return -(cos(PI * x) - 1) / 2;
}

function easeInOutElastic(x) {
  const c5 = (2 * PI) / 4.5;
  
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
    : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
  }