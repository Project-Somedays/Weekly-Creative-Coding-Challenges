/*
https://paulbourke.net/geometry/knots/
https://p5js.org/learn/getting-started-in-webgl-custom-geometry.html
https://en.wikipedia.org/wiki/Torus_knot

*/

let myGeometry
const evolutionRate = 1000;

function setup() {
  createCanvas(1080, 1080, WEBGL);

  
  
  describe('a greenish plane shape that is warped and lit');
}

function drawKnot(){
  beginShape();
    for(let beta = 0; beta < PI; beta += PI/1000){
      let pt = knotPt(beta);
      vertex(pt.x, pt.y, pt.z);
    }
  endShape();

}



function draw() {
  background(0);
  
  orbitControl();
  
  //set a basic light to see that normals are calculated
  pointLight(255,255,255,0,50,-50);

  pointLight(255,255,255,0,-50,50);
  
  push();
  stroke(128);
  let geoSize = width;
  
  // translate(-geoSize/2,-geoSize/2);
  scale(geoSize/20);
  normalMaterial();
  // ambientMaterial(250);
  // specularMaterial(250)
  // formKnotFromSpheres();
  push();
  translate(-4.0, -4.0, 0.0);
  rotateY(millis()/2000);
  rotateZ(millis()/2000);
  rotateX(millis()/2000);
  singleParameterKnot(trefoil, 0.5, 500);
  pop();

  push();
  translate(4.0, 4.0, 0);
  -rotateY(millis()/2000);
  -rotateZ(millis()/2000);
  -rotateX(millis()/2000);
  singleParameterKnot(twothreetorusknot, 0.5, 500);
  pop();

  push();
  translate(4.0, -4.0, 0);
  -rotateY(millis()/2000);
  rotateZ(millis()/2000);
  -rotateX(millis()/2000);
  showpqTorusknot(2,3, 0.5, 500)
  pop();

  push();
  translate(-4.0, 4.0, 0);
  rotateY(millis()/2000);
  -rotateZ(millis()/2000);
  rotateX(millis()/2000);
  showpqTorusknot(3,4, 0.5, 500)
  pop();
  
  pop();
}

function formKnotFromSpheres(detailLevel){
  for(let beta = 0; beta < TWO_PI; beta += TWO_PI/detailLevel){
    let a = 1.2;
    // let a = 1.2*(0.5*(sin(millis()/evolutionRate)+1.5));
    let b = 0.6*(0.5*(sin(millis()/evolutionRate)+1)+1)*0.5;
    // let b = 0.6;
    // let c = 0.2*(0.5*(cos(0.5*millis()/evolutionRate) + 1.5));
    let c = 0.5*(0.5*(cos(0.5*millis()/evolutionRate) + 1.5));
    // let c = 0.2;
    let pt = knotPt(beta, a, b, c);
    push();
    translate(pt.x, pt.y, pt.z);
    sphere(0.1, 24, 24);
    pop();
  }
}

function singleParameterKnot(fn, sphereSize, detailLevel){
  for(let t = 0; t < TWO_PI; t += TWO_PI/detailLevel){
    let pt = fn(t);
    push();
    translate(pt.x, pt.y, pt.z);
    sphere(sphereSize, 24, 12);
    pop();
  }
}

function showpqTorusknot(p, q, sphereSize, detailLevel){
  for(let t = 0; t < TWO_PI; t += TWO_PI/detailLevel){
    let pt = pqtorusknot(p, q, t);
    push();
    translate(pt.x, pt.y, pt.z);
    sphere(sphereSize, 24, 12);
    pop();
  }
}
