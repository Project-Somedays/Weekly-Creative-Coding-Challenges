/*
Author: Project Somedays
Date: 2024-10-03
Title: WCCChallenge 2024 Week 40 - 2 Rules

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Prompt reminded me a bit of XKCD's rearrangements of Aasimov's laws of robotics: https://xkcd.com/1613

I was curious as to what would happen with switching off one of the three rules of flocking.

Moderately interesting! And most importantly, didn't take that long thanks to Patt Vira, The Coding Train and Claude.ai who clearly stole from both hahaha.

Side Quest: turn on persistance of vision mode and paint with birbs!

RESOURCES:
 - Flocking and Quadtree tutorials from Patt Vira: https://www.youtube.com/watch?v=AMugNCfP1NA
 - Coding Train tutorials on Flocking: https://www.youtube.com/watch?v=mhjuuHl6qHM, and Quad Tree: https://www.youtube.com/watch?v=OJxEcs0w_kE
// separation icon: https://www.flaticon.com/free-icon/separation_2381867?related_id=2381867&origin=pack
// cohesion icon: https://www.flaticon.com/free-icon/alignment_2381849?related_id=2381849&origin=pack
// alignment icon: https://www.flaticon.com/free-icon/shuffle-arrows_2381927?related_id=2381927&origin=pack
*/


const palettes = {
  fullSpectrum: "#f94144, #f3722c, #f8961e, #f9844a, #f9c74f, #90be6d, #43aa8b, #4d908e, #577590, #277da1".split(", "),
  purple2blue: "#7400b8, #6930c3, #5e60ce, #5390d9, #4ea8de, #48bfe3, #56cfe1, #64dfdf, #72efdd, #80ffdb".split(", "),
  brightSpectrum: "#ff0000, #ff8700, #ffd300, #deff0a, #a1ff0a, #0aff99, #0aefff, #147df5, #580aff, #be0aff".split(", "),
  slightlyMuted: "#669900, #99cc33, #ccee66, #006699, #3399cc, #990066, #cc3399, #ff6600, #ff9900, #ffcc00".split(", "),
  blues: "#9fccfa, #8ec2f9, #7eb8f8, #6daff7, #5ca5f6, #4c9bf5, #3b91f4, #2a88f3, #1a7ef2, #0974f1".split(", ")

}

let rules = {
  alignOn: true,
  separateOn: true,
  cohesionOn: false
}

let gui, params;

let iconRuleBiz;

let iconAlign, iconSeparation, iconCohesion, birbSize, perceptionRadius, birbColour;

let maxSpeed, maxForce;

function updateRules(ruleToTurnOff){
  rules.alignOn = true;
  rules.separateOn = true;
  rules.cohesionOn = true;
  rules[ruleToTurnOff] = false;
}

let flock;
let quadTree;

// New variables for responsive sizing
let minDimension;

function preload(){
  // iconAlign = loadImage("align.png");
  // iconCohesion = loadImage("cohesion.png");
  // iconSeparation = loadImage("separation.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Calculate responsive variables
  minDimension = min(width, height);

  gui = new lil.GUI();
  params = {
    applyAlignForce: true,
    applySeparationForce: true,
    applyCohesionForce: true,
    chosenPalette: palettes.fullSpectrum,
    applyPalette: true,
    birbStroke: false,
    birbOpacity: 255,
    birbSizeAsPercOfMinDimension: 0.005, 
    birbCount: 200, 
    maxSpeedFactor: 0.005,
    maxForceAsAPercOfSpeed: 0.02,
    perceptionRadiusAsPercMinDimension: 0.08,
    desiredSeparationAsPercMinDimension: 0.04,
    bgColour: "#141414",
    birbColour: "#f0ead6",
    persistenceOfVisionMode: false,
    resetAll: reset,
    clearScreen: clearScreen
  }

  
  gui.addColor(params, 'bgColour');
  gui.addColor(params, 'birbColour').onChange(() => updateAllVariables()).name("Birb Colour");
  gui.add(params, 'chosenPalette', palettes).onChange(() => flock.applyPaletteToBirbs());
  gui.add(params, 'applyPalette').onChange(() => flock.applyPaletteToBirbs());
  gui.add(params, 'persistenceOfVisionMode');
  gui.add(params, 'birbStroke');
  gui.add(params, 'birbOpacity', 0, 255, 1).onChange(() => updateAllVariables()).name("Birb Opacity");
  gui.add(params, 'applySeparationForce');
  gui.add(params, 'applyAlignForce');
  gui.add(params, 'applyCohesionForce');
  gui.add(params, 'birbSizeAsPercOfMinDimension', 0.00005, 0.05).onChange(() => updateAllVariables()).name("Birb Size");
  gui.add(params, 'birbCount', 100, 1000, 1).onChange(() => flock = spawnFlock()).name("Birb Count" );
  gui.add(params, 'maxForceAsAPercOfSpeed', 0.001, 0.1).onChange(()=> updateAllVariables()).name("Max Force");
  gui.add(params, 'maxSpeedFactor', 0.001, 0.01).onChange(() => updateAllVariables()).name("Max Speed");
  gui.add(params, 'perceptionRadiusAsPercMinDimension', 0.01, 0.5).onChange(() => updateAllVariables()).name("Vision Radius");
  gui.add(params, 'desiredSeparationAsPercMinDimension', 0.01, 0.1).onChange(() => updateAllVariables()).name("Separation");
  gui.add(params, 'resetAll').name("Reset to defauts");
  gui.add(params, 'clearScreen').name("Clear screen");
  

  // iconRuleBiz = {
  //   alignOn: {
  //     pos : createVector(width/3, height/3),
  //     show: () => {
  //       image(iconAlign, this.pos.x, this.pos.y);
  //       if(!rules.alignOn) 

  //     }
  //   }
  // }
  
  updateAllVariables();
  flock = spawnFlock();
  
  background(params.bgColour);
}



function draw() {
  if(!params.persistenceOfVisionMode) background(params.bgColour);
  
  // Update quad-tree
  quadTree = new QuadTree(new Rectangle(0, 0, width, height), 4);
  for (let birb of flock.birbs) {
    quadTree.insert(new Point(birb.position.x, birb.position.y, birb));
  }
  
  flock.run();
}


function spawnFlock(){
  flock = new Flock();
  for (let i = 0; i < params.birbCount; i++) {
    let b = new Birb(random(width), random(height));
    flock.addBirb(b);
  }
  flock.applyPaletteToBirbs();
  return flock;
}

function updateAllVariables(){
  maxSpeed =  minDimension * params.maxSpeedFactor;
  maxForce = maxSpeed * params.maxForceAsAPercOfSpeed;
  birbSize = minDimension * params.birbSizeAsPercOfMinDimension;
  perceptionRadius = minDimension * params.perceptionRadiusAsPercMinDimension;
  desiredSeparation = minDimension * params.desiredSeparationAsPercMinDimension;
  birbColour = getAlphaColour(params.birbColour, params.birbOpacity);
  flock.applyPaletteToBirbs();
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Recalculate responsive variables
  minDimension = min(width, height);
  updateAllVariables();
}

function reset(){
  flock = spawnFlock();
  gui.reset();
}

function getAlphaColour(c, opacity){
  return color(red(c), green(c), blue(c), opacity);
}

function clearScreen(){
  background(params.bgColour);
}





