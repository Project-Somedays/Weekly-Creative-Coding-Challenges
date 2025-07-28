const resolution = 200;
let cp;
let midLinePoints = [];
let THIRD_PI;

function setup() {
  createCanvas(400, 400, WEBGL);
  cp = createVector(-width*1.5, 0, -width);
  THIRD_PI = PI/3;
  
}

function draw() {
  background(0);

 ambientLight(255);

  const corridorWidth = width;
  const r1 = width*4;
  const r2 = r1 - corridorWidth;
  const h = height*0.75;
  const aExtent = 2*THIRD_PI
  
  push();
  translate(cp.x, cp.y, cp.z);
  // outer wall
  noStroke();
  fill(255, 0, 0);
  beginShape(QUADS);
  for(let i = 0; i < resolution; i++){
    let a1 = -i*(aExtent)/resolution;
    let a2 = -(i+1) * aExtent / resolution;
    vertex(r1 * cos(a1), h, r1 * sin(a1)); // top left corner
    vertex(r1 * cos(a2), h, r1 * sin(a2)); // top right corner
    vertex(r1 * cos(a2), -h, r1 * sin(a2)); // bot right corner
    vertex(r1 * cos(a1), -h, r1 * sin(a1)); // bot left corner   
  }
  endShape()


  // inner wall
  fill(0, 0, 255);
  beginShape(QUADS);
  for(let i = 0; i < resolution; i++){
    let a1 = -i*(aExtent)/resolution;
    let a2 = -(i+1) * aExtent / resolution;
    vertex(r2 * cos(a1), h, r2 * sin(a1)); // top left corner
    vertex(r2 * cos(a2), h, r2 * sin(a2)); // top right corner
    vertex(r2 * cos(a2), -h, r2 * sin(a2)); // bot right corner
    vertex(r2 * cos(a1), -h, r2 * sin(a1)); // bot left corner   
  }
  endShape()
 

  // floor
  fill(0, 255, 0);
  beginShape(QUADS);
  for(let i = 0; i < resolution; i++){
    let a1 = -i*(aExtent)/resolution;
    let a2 = -(i+1) * aExtent / resolution;
    vertex(r2 * cos(a1), h, r2 * sin(a1)); // top left corner
    vertex(r2 * cos(a2), h, r2 * sin(a2)); // top right corner
    vertex(r1 * cos(a2), h, r1 * sin(a2)); // bot right corner
    vertex(r1 * cos(a1), h, r1 * sin(a1)); // bot left corner   
  }
  endShape()

  // ceiling
  fill(0, 255, 0);
  beginShape(QUADS);
  for(let i = 0; i < resolution; i++){
    let a1 = -i*(aExtent)/resolution;
    let a2 = -(i+1) * aExtent / resolution;
    vertex(r2 * cos(a1), -h, r2 * sin(a1)); // top left corner
    vertex(r2 * cos(a2), -h, r2 * sin(a2)); // top right corner
    vertex(r1 * cos(a2), -h, r1 * sin(a2)); // bot right corner
    vertex(r1 * cos(a1), -h, r1 * sin(a1)); // bot left corner   
  }
  endShape()

  pop();

  
  
  orbitControl();
}


