/*
Author: Project Somedays
Date: 2024-08-17
Title: WCCChallenge 2024 Week 33 - Unrealistic Horse


*/

let foreforelimb, forebacklimb, backforelimb, bacbacklimb;
let params, gui;
let horseBody; 

function preload(){
  horseBody = loadImage('HorseBody.png');
  
}


function setup() {
  createCanvas(windowWidth, windowHeight);

  imageMode(CENTER);

  
  gui = new lil.GUI();
  params = {
    legBoneCount: 3,
    thighLength: height/50,
    shinLength: height/50,
    footLength: height/100
  }

  let legConstructor = [
    {
      length: height/8,
      colour: color(255),
      segweight: height/50,
      minAngle: 0,
      maxAngle: 2*TWO_PI/3
    },
    {
      length: height/8,
      colour: color(255),
      segweight: height/50,
      minAngle: -2*TWO_PI/3,
      maxAngle: 0
    },
    {
      length: height/16,
      colour: color(255),
      segweight: height/50,
      minAngle: -2*TWO_PI/3,
      maxAngle: 0
    }
  ]

  foreforelimb = new Limb(legConstructor, width/2, height/2);
 
  
  
}

function draw() {
  background(0);

  image(horseBody, width/2, height/2);

  foreforelimb.update(mouseX, mouseY);
  foreforelimb.showNormalLimb();

}

