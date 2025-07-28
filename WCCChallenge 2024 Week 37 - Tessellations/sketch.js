/*
Author: Project Somedays
Date: 2024-09-22
Title: WCCChallenge 2024 Week 37 - Tessellation

45 degree Herringbone pattern 
Saw Hamilton and, among the rich history and incredibly lyricism that expanded the scope of rap for story-telling, I was also obsessed with the carousel in the middle of the stage and how well it was used.
Work in Progress

*/

let brickWidth, brickDepth, brickLength;

let step;
let cam;
let xzCentre;
let gui, params;

let palettes = [
  "#083d77, #ebebd3",
  "#f75c03, #d90368",
  "#044389, #fcff4b",
  "#6c17b6, #ff5e00",
  "#b80c09, #0b4f6c",
  "#3d5a80, #98c1d9",
  "#f46036, #2e294e"

].map(each => each.split(", "));




function setup(){
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createCanvas(1080, 1080, WEBGL); 

  gui = new lil.GUI();
  params = {
    bricks: 50,
    span: 0.66*width,
    paletteIndex: 0,
    innerThreshold: width/6,
    outerThreshold: width/3,
    minAngle: 0,
    maxAngle: 0,
    globalRotFrames : 900,
    aMultiplier : 4,
    yOffsetMultiplier: 5,
    manualControl: false,
    orbitRadius : width*0.7,
    cameraHeight : 0.6*width,
    waveHeight: width/3
  }

  gui.add(params, 'bricks', 10, 100, 1).onChange(value => setSizesFromSpan());
  gui.add(params, 'span', 0.1*width, 2 * width, 1).onChange(value => setSizesFromSpan());
  gui.add(params, 'paletteIndex', 0, palettes.length- 1, 1);
  gui.add(params, 'innerThreshold', 0, width);
  gui.add(params, 'outerThreshold', 0, width);
  gui.add(params, 'minAngle', 0, TWO_PI);
  gui.add(params, 'maxAngle', 0, TWO_PI);
  gui.add(params, 'globalRotFrames', 30, 1200);
  gui.add(params, 'aMultiplier',1,10);
  gui.add(params, 'yOffsetMultiplier', 1, 10);
  gui.add(params, 'manualControl');
  gui.add(params, 'orbitRadius', 0, width);
  gui.add(params, 'cameraHeight', 0, width);
  gui.add(params, 'waveHeight', 0, width);

  setSizesFromSpan();
  
  
  cam = createCamera();
  cam.setPosition(0.5*params.orbitRadius,-params.cameraHeight, 0);
  cam.lookAt(0,0,0);

  xzCentre = createVector(0,0);


  noFill();

}

function draw(){
  background(0);
  stroke(255);

  let a = frameCount * TWO_PI/ params.globalRotFrames;

  
  // rotateX(-QUARTER_PI);
  // rotateY(frameCount * TWO_PI/1200);
  // translate(0,0,-width/8);
  
  
for(let x = 0; x < params.bricks; x++){
  for(let z = 0; z < params.bricks; z++){
    let zOff = x%2 === 0 ? 0 : step/2;
    let xz = createVector(x,z);
    let dir = p5.Vector.sub(xz, xzCentre).heading(); //  this is the offset
    let yOff = -0.5*(cos(a*params.aMultiplier + dir * params.yOffsetMultiplier) + 1)* 0.5*(sin(a + PI) + 1)*params.waveHeight;//-0.5*(cos(a + dir) + 1)*width/4;
    let pt = createVector(-0.5*params.bricks*step + step * x, yOff, -0.5*params.bricks*step + z*step + zOff);
    let d2c = dist(pt.x, pt.z, 0, 0);
    if(d2c <= params.innerThreshold || d2c >= params.outerThreshold || (dir >= params.minAngle && dir <= params.maxAngle) ) continue;
    fill(x % 2 === 0 ? palettes[params.paletteIndex][0] : palettes[params.paletteIndex][1]);
    push();
    translate(pt.x, pt.y, pt.z);
    rotateY(x%2 === 0 ? QUARTER_PI : -QUARTER_PI);
    box(brickWidth, brickDepth, brickLength);
    pop();
  }
}
  
if(!params.manualControl){
  cam.setPosition(params.orbitRadius*cos(a),-params.cameraHeight, params.orbitRadius*sin(a));
  cam.lookAt(0,0,0);
} else {
  orbitControl();
}

  

}

function setSizesFromSpan(){
  brickWidth = params.span/params.bricks;
  brickLength = 2  * brickWidth;
  brickDepth = 0.5 * brickWidth;
  step = brickWidth * sqrt(2);
}