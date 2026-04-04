/*

My own implementation of Tyler Hobbe's Watercolour biz: https://www.tylerxhobbs.com/words/a-guide-to-simulating-watercolor-paint-with-generative-art
https://youtu.be/5R9eywArFTE?si=PBz5eNMzZP3RGjBo&t=647

Test for implementing polygon deformation: https://editor.p5js.org/projectsomedays/sketches/B9kOgi7ae

INTERACTION
- Hit Space to manually progress through the algorithm

*/

let blot;
let gui;
let params;

function setup() {
  createCanvas(400, 400);
  blot = new Blot(width/2, height/2, 8, 0, width/6);
  textAlign(CENTER, CENTER);
  gui = new lil.GUI();
  params = {
    deformationDepth: 7,
    preservationDepth: 3,
    midPointPosSD: 0.125,
    pertRadiusSD: 0.125,
    blotLayers: 30,
    paintColour: '#ff0000',
    layerOpacity: 0.04
  }

  gui.add(params, 'deformationDepth', 1, 8, 1);
  gui.add(params, 'preservationDepth', 1, 8, 1)
  gui.add(params, 'midPointPosSD', 0, 0.5, 0.01);
  gui.add(params, 'pertRadiusSD', 0, 0.5, 0.01);
  gui.add(params, 'blotLayers', 30, 100, 1);
  gui.add(params, 'layerOpacity', 0, 1, 0.01);
  gui.addColor(params, 'paintColour');
}

function draw() {
  background(0);
  fill(255, 0, 0);
  if(blot.progress <= params.deformationDepth){
    blot.show(blot.boundaryPts);
  } else {
    blot.drawBlotLayers();
    noLoop();
  }
  fill(255);
  noStroke();
  text(`Progression level: ${blot.progress <= params.deformationDepth ? blot.progress : "Show blotting"}`, width/2, 10);
}

function keyPressed(){
  if(key === ' ') blot.advance();
}




  
 
