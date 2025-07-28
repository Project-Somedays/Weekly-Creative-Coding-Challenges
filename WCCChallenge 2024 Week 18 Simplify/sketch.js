/*
Author: Project Somedays
Date: 2024-05-01
Title: #WCCChallenge "Simplify"

Made for Sableraph's weekly creative coding challenges, reviewed Sundays on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Exploring morphing shapes
Also wanting to continue to explore
*/

let captureMode = true;
 let morphArray = [];
 let r;
 var fps = 30;
 let frames = 300;
var capturer = new CCapture({
  format: 'png',
  framerate: fps
});


function setup() {
  createCanvas(1080, 1080);

  drawingContext.shadowBlur = 100;
  drawingContext.shadowColour = 'white';
  strokeWeight(2);
  noFill();
  stroke(255);
  r = width/20;
  for(let i = 0; i < 10; i ++){
    for(let j = 0; j < 10; j ++){
      morphArray.push(new Morpher(
        getPolygonVertices(r, i+3, random(TWO_PI)),
        getPolygonVertices(r, j+3, random(TWO_PI)),
        frames,
        random(TWO_PI)
      ));
    }
  }
  
  
  
}

function draw() {
  background(0);
  if(frameCount === 1 && captureMode) capturer.start();
  for(let i = 0; i < 10; i ++){
    for(let j = 0; j < 10; j ++){
      let m = morphArray[j + i*j];
      push();
      translate((i + 0.5) * width/10, (j + 0.5) * width/10);
      m.show();
      pop()
    }
  }

  if(captureMode && frameCount > frames){
      noLoop();
      console.log('finished recording.');
      capturer.stop();
      capturer.save();
      return;
  }


  if(captureMode) capturer.capture(document.getElementById('defaultCanvas0'));
  
}




// let p1, p2;

// function setup() {
//   createCanvas(1080, 1080);
//   p1 = new Polygon(width/2, height/2, 5, width/3);
//   p2 = new Polygon(width/2, height/2, 3, width/3);

// }

// function draw() {
//   background(220);
//   fill(255);
//   p1.show();
//   p2.show();
// }


// class Polygon{
//   constructor(x,y,sideCount, r){
//     this.p = createVector(x,y);
//     this.r = r;
//     this.sides = this.getSides(sideCount);
//   }
    
//   getSides(sideCount){
//     let sides = [];
//     for(let i = 0; i < sideCount; i++){
//       let currentA = i*TWO_PI/sideCount;
//       let nextA  = ((i+1)%sideCount)*TWO_PI/sideCount;
//       let currentVertex = createVector(this.r*cos(nextA), this.r*sin(nextA));
//       let nextVertex = createVector(this.r*cos(currentA), this.r*sin(currentA));
//       sides.push(p5.Vector.sub(nextVertex, currentVertex));
//     }
//     return sides;
//   }

//   getVertices(){
//     let vertices = [];
//     for(let i = 0; i < this.sides.length; i++){
//       let a = i*TWO_PI/this.sides.length;
//       vertices.push(this.r*cos(a), this.r*sin(a));
//     }
//     return vertices;
//   }

//   show(){
//     push();
//     translate(this.p.x,this.p.y);
//     beginShape();
//     for(let i = 0; i < this.sides.length; i++){
//       let a = i*TWO_PI/this.sides.length;
//       vertex(this.r*cos(a), this.r*sin(a));
//     }
//     endShape(CLOSE);
//     pop();
//   }
// }

// function createTransitionShape(polygonA, polygonB){
//   let allVertices = [...polygonA.getVertices()];

//   for(let p of polygonA.getVertices()){
//     let targetSide = null;
//     // work out which side to project onto --> the first point of PolyB that p is greater than
//     for(let i = 0; i < polygonB.getVertices().length; i++){
//       if(p5.Vector.sub(p,createVector(0,0)).heading() >= p5.Vector.sub(polygonB.getVertices()[i],createVector(0,0)).heading()){
//         targetSide = polygonB.getSides()[i];
//       }
//       break;
//     }

//     // get the scalar projection of that vertex onto side
//     allVertices.push({
//       src : createVector(p.x, p.y),
//       target : scalarProjection(p, targetSide);
//     })

//   }

//   allVertices.sort(compareVectors);
//   return TransitionShape()


  
  
// }

// class TransitionShape{
//   constructor(verticesSrcTarget){
//     this.vertices

//   }
// }


// function scalarProjection(P, AB) {
//   /**
//    * Calculate the scalar projection of point P onto vector AB.
//    * @param {p5.Vector} P - Coordinates of point P.
//    * @param {p5.Vector} AB - Coordinates of vector AB.
//    * @returns {number} - Scalar projection of point P onto vector AB.
//    */
  
//   // Vector representing AP
//   let AP = p5.Vector.sub(P, A);
  
//   // Scalar projection formula: |AP| * cos(theta), where theta is the angle between AB and AP
//   let scalarProj = p5.Vector.dot(AP, AB) / AB.mag();
  
//   return scalarProj;
// }

// function compareVectors(a, b) {
//   // Calculate polar angle of vectors a and b relative to referenceVector
//   let angleA = atan2(a.y - referenceVector.y, a.x - referenceVector.x);
//   let angleB = atan2(b.y - referenceVector.y, b.x - referenceVector.x);
  
//   // Return the comparison result
//   if (angleA < angleB) {
//     return -1;
//   } else if (angleA > angleB) {
//     return 1;
//   } else {
//     return 0;
//   }
// }
