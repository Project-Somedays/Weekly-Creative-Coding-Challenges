/*
Author: Project Somedays
Date: 2024-12-15
Title: WIP WCCChallenge - Chromatic Communication - V1

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

A behind-the-scenes into Version 1 of this project, completed here: https://openprocessing.org/sketch/2488048
*/



const n = 75;
const rotations = 4;
const spiralPoints = [];
const palette = "#ef476f, #ffd166, #06d6a0, #118ab2, #073b4c".split(", ");
const frames = 120;
const copies = 4;
let currentColour;
let w;

// hand holding phone model: https://sketchfab.com/3d-models/hand-holding-phone-6d99aa43705c44bcadde799b9a617d1c#download
// starting model: https://www.freepik.com/free-vector/phone-human-hand-3d-cartoon-style-icon-person-businessman-using-social-media-smartphone-cellphone-flat-vector-illustration-technology-communication-internet-concept_29119341.htm#fromView=keyword&page=1&position=0&uuid=674f3e2c-1ecc-4dd5-8dbf-27735780f1f5

function setup() {
  // createCanvas(1080, 1080, WEBGL);
  createCanvas(windowWidth, windowHeight, WEBGL);
  w = min(width, height);
  pixelDensity(1);
  frameRate(30);
  currentColour = random(palette);
  

  

  for(let i = 0; i <= n; i++){
    spiralPoints[i] = generateSpiral(easeInOutExpo(i/n), rotations, 0, width*0.4, -height/3, height/3); 
  }

}

function draw() {
  background(0);
  let progress = (frameCount%frames)/frames;
  if(progress === 0) currentColour = random(palette);

  push();
  let start = spiralPoints[0];
  rotateY(-frameCount*TWO_PI/600);
  translate(start.x, start.y, start.z);
  // scale(1+easeInOutElastic(constrain(4*(progress),0,1)));
  fill(currentColour);
  box(w*0.0625, w*0.0625*sqrt(2), w*0.0125);
  pop();

  pointLight(255, 255, 255, createVector(0,0,0));
  pointLight(255, 255, 255, createVector(0,height,0));
  pointLight(255, 255, 255, createVector(0,-height,0));

  
  let p = generateSpiral(progress, rotations, 0, width*0.4, -height/3, height/3);

  push();
  rotateY(-frameCount*TWO_PI/600);
  push();
  let phonePos = spiralPoints[0];
  translate(phonePos.x, phonePos.y - width*0.3, phonePos.z);
  fill(currentColour);
  // box(width*0.125, width*0.125*sqrt(2), width*0.0125);
  pop();
  for(let k = 0; k < copies; k++){
    push();
    rotateY(k*TWO_PI/copies);
    stroke(255);
    strokeWeight(10);
    noFill();
    beginShape();
    // vertex(start.x, -height/2*1.05, start.z);
    vertex(phonePos.x, phonePos.y, phonePos.z);
    for(let i = 0; i < spiralPoints.length; i++){
      let p = spiralPoints[i];
      curveVertex(p.x,p.y,p.z);
    }
    let end = spiralPoints[n-1];
    vertex(end.x, end.y, end.z);
    // vertex(end.x, height/2*1.05, end.z);
    endShape();

    noStroke();
    
    // fill(currentColour);
    
    if(progress < 0.5 && k >= 1){
      pop();
      continue;
    }

    // drawing the balls
    push();
    translate(p.x, p.y, p.z);
    // emissiveMaterial(red(currentColour), green(currentColour), blue(currentColour));
    fill(currentColour);
    sphere(width/25)
    pop();
    pop();

  }

  pop();
  

  orbitControl();
}



function generateSpiral(t, rots, rMax, rMin, yMin, yMax) {
  
  // Calculate the radius based on a dynamic curve
  let r = t <= 0.5 ? map(t, 0, 0.5, rMin, rMax) : map(t, 0.5, 1, rMax, rMin);
  
  // Calculate angle (spiral wraps multiple times)
  let a = t * TWO_PI * rots; // 4 full rotations
  
  // Calculate x and y coordinates
  let x = r * cos(a);
  let z = r * sin(a); 
  let y = yMin + t*(yMax - yMin);
  
  return createVector(x,y,z);
}

function easeInOutExpo(x) {
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2;
  }

  function easeInOutElastic(x){
    const c5 = (2 * Math.PI) / 4.5;
    
    return x === 0
      ? 0
      : x === 1
      ? 1
      : x < 0.5
      ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
    }


function showPhone(){
  
}