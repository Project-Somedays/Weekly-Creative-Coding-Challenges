/*
Author: Project Somedays
Date: 2024-08-10
Title: WCCChallenge 2024 Week 32 - (Inteference) Pattern

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Have been playing around a lot this week on interference patterns, mostly on the outside of spheres: https://openprocessing.org/sketch/2325058
Thought I'd flatten it out so you can really see what's happening!

HOW DOES IT WORK? 
  - Field made of spheres
  - Distance mapped to each control point 0 to TWO_PI
Get the value of cosine of that angle and add it to the sphere size
Sometimes the radius is negative, sometimes positive.
The superposition of two positives or negatives is a mega sphere
The superposition of opposite signs cancels out.
Physics/Maths brain VERY satisfied.

TLDR: Interference patterns 💞

SUGGESTED EXPERIMENTS
Start at 1 control point and work up
Also try the decaying cosine function. Note: you'll have to ramp up the amplitude
Play around the with the phase also

*/

let pts = [];
let controlPoints = [];
let gui, params;
let distanceMappingModes, lightControls, generalSettings, colourBiz, debug, waveBiz;



function setup() {
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createCanvas(1080, 1080, WEBGL);
  pixelDensity(1);
  
  gui = new lil.GUI();
  params = {
    nFieldPoints: 3000,
    nControlPoints: 5,
    noiseProgRate: 0.005,
    sep: 25,
    amp: 20,
    showControlPoints: false,
    phase: 0,
    cycles: 5,
    sizeThreshold: 0,
    bgColour: color(0),
    fieldColour: color('#f94144'),
    ambientLightOn: false,
    pointLightZHeight: height/2,
    pointLightOn: true,
    decayRate: 0,
    distanceMappingFunction: decayingCosineWave
  }

  // ---------------- GENERAL SETTINGS --------------- //
  generalSettings = gui.addFolder('General Settings');
  generalSettings.add(params, 'nFieldPoints', 100, 5000, 1).onChange(value => pts = genSquarePtPlane(value));
  generalSettings.add(params, 'nControlPoints', 1, 20, 1).onChange(value => controlPoints = generateControlPoints(value));
  generalSettings.add(params, 'noiseProgRate', 0.0001, 0.01);
  generalSettings.add(params, 'sep', 1, width/50).onChange(value => pts = genSquarePtPlane(params.nFieldPoints));

  // ---------------- WAvE BIZ --------------- //
  waveBiz = gui.addFolder('Wave Biz');
  waveBiz.add(params, 'amp', 1, min(width,height)/25);
  waveBiz.add(params, 'phase', 0, TWO_PI);
  waveBiz.add(params, 'cycles', 1, 10, 1);
  waveBiz.add(params, 'sizeThreshold', 0, params.amp);

  // ---------------- COLOUR BIZ --------------- //
  colourBiz = gui.addFolder('Colour Biz');
  colourBiz.add(params, 'bgColour', {'black':color(0), 'white': color(255)});
  colourBiz.add(params,'fieldColour', {
    "Imperial red":color("#f94144"),
    "Orange (Crayola)":color("#f3722c"),
    "Carrot orange":color("#f8961e"),
    "Coral":color("#f9844a"),
    "Saffron":color("#f9c74f"),
    "Pistachio":color("#90be6d"),
    "Zomp":color("#43aa8b"),
    "Dark cyan":color("#4d908e"),
    "Payne's gray":color("#577590"),
    "Cerulean":color("#277da1")
  });
  
  //------------- LIGHT CONTROLS --------------//
  lightControls = gui.addFolder('Light Controls');
  lightControls.add(params, 'ambientLightOn');
  lightControls.add(params, 'pointLightOn');
  lightControls.add(params, 'pointLightZHeight', 0, 2*height);

  //------------- DISTANCE MAPPING MODES--------------//
  distanceMappingModes = gui.addFolder('Distance Mapping Modes');
  distanceMappingModes.add(params, 'decayRate', 0, 1);
  distanceMappingModes.add(params, 'distanceMappingFunction', {'cosineWave' : cosineWave, 'decayingCosineWave' : decayingCosineWave});
  
  //------------- DEBUG --------------//
  debug = gui.addFolder("Debug");
  debug.add(params, 'showControlPoints');

  controlPoints = generateControlPoints(params.nControlPoints);
  pts = genSquarePtPlane(params.nFieldPoints);

  noStroke();
}

function draw() {
  background(params.bgColour);
  fill(params.fieldColour);
  noStroke();

  // -------------- LIGHTS ---------------- //
  if(params.pointLightOn) pointLight(255, 255, 255, 0, 0, params.pointLightZHeight);
  if(params.ambientLightOn) ambientLight(255, 255, 255);
  
  // CAMERA


  // ACTION
  for(let cpt of controlPoints){
    cpt.update();
    if(params.showControlPoints) cpt.show();
  }

  for(let pt of pts){
    push();
    translate(pt.x, pt.y, pt.z);
    let r = 0;
    for(let cntrlPt of controlPoints){
      let d = map(p5.Vector.dist(cntrlPt.pos, pt), 0, params.sep*sqrt(params.nFieldPoints), 0, TWO_PI);
      r += params.distanceMappingFunction(d);
    }
    if(abs(r) > params.sizeThreshold) sphere(r);
    pop();
  }

  orbitControl();
}

const cosineWave = (d) => {return params.amp * sin(params.cycles*d + params.phase)}

const decayingCosineWave = (d) => {return params.amp * exp(-params.decayRate*d) * cos(params.cycles*d + params.phase)};

function generateControlPoints(n){
  let cpts = [];
  for(let i = 0; i < n; i++){
    cpts[i] = new ControlPoint();
  }
  return cpts;
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function genSquarePtPlane(n){
  let points = [];
  let s = int(sqrt(n));
  for(let x = -params.sep*s/2; x < params.sep*s/2; x += params.sep){
    for(let y = -params.sep*s/2; y < params.sep*s/2; y += params.sep){
      points.push(createVector(x,y,0));
    }
  }
  return points;
}

class ControlPoint{
  constructor(){
    this.xOff = random(1000);
    this.yOff = random(1000);
    this.pos = createVector(0,0,0);
  }

  update(){
    let x = map(noise(this.xOff + frameCount*params.noiseProgRate), 0, 1, -sqrt(params.nFieldPoints)*params.sep/2, sqrt(params.nFieldPoints)*params.sep/2);
    let y = map(noise(this.yOff + frameCount*params.noiseProgRate), 0, 1, -sqrt(params.nFieldPoints)*params.sep/2, sqrt(params.nFieldPoints)*params.sep/2);
    this.pos.set(x,y,0);
  }

  show(){
    fill(255);
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      sphere(min(width, height)/20);
    pop();
    
  }
}
