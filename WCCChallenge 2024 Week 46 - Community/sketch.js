/*
Author: Project Somedays
Date: 2024-11-15
Title: WCCChallenge - Community

Is our community continually going down the drain or and emerging out of it? Kind of depends on your perspective... 
But also, I thought it might look neat to render some stuff on the surface of a donut 😅🍩

Enjoy!

More documentation/minor tweaking to come.
*/


// Animation settings
const ROTATION_SPEED = 0.005;  // Speed around the large circle
const SPIRAL_TURNS = 1.5;       // Number of turns around tube per major circle rotation

let rotating = false;
let rotateStartFrame = 0;
let rotateEndFrame = 60;
let rotateProgress = 0;
let rotateCumulativeAngle = 0;
let rotateAngle = 0;
let isAscending = true;

let majorRotation = 0;

let tubeLargeR, tubeSmallR;
let largeCircleObjects = 24;
let smallCircleObjects = 6;

let rotationOffset = 0;
let spiralOffset = 0;

let biz = [];

let texturedTorus;

let grassTexture;
let pineTexture;
let slateGround;
let cam;
// let rustyRoof;
let msg1, msg2;

function preload(){
  grassTexture = loadImage("Poliigon_GrassPatchyGround_4585_Preview1.png");
  pineTexture = loadImage("heap-unusual-plant-twigs.jpg");
	// slateGround = loadImage("Poliigon_WoodRoofShingle_7834_Preview1.png");
  // rustyRoof = loadImage("Poliigon_MetalRust_7642_Preview1.png");
}

// Example usage with spiral animation:
function setup() {
  // createCanvas(800, 800, WEBGL);
	// createCanvas(windowWidth, windowHeight, WEBGL);
  createCanvas(1080, 1080, WEBGL);
  pixelDensity(1);
  tubeLargeR = width/2;
  tubeSmallR = width/4;
  rectMode(CENTER);

  msg1 = createGraphics(width, height/4);
  msg2 = createGraphics(width, height/4);
  
  
	
  // texturedTorus = new TexturedTorus(tubeLargeR, tubeSmallR, 64, 32, grassTexture);
	cam = createCamera();
	cam.setPosition(0, width, width);
	cam.lookAt(0,0,0);

  for(let i = 0; i < largeCircleObjects; i++){
    for(let j = 0; j < smallCircleObjects; j++){
      biz[i*smallCircleObjects + j] = {drawTheTree: random() < 0.2, uOffset : random(PI/24), vOffset: random(PI/24)};
    }
  }

  // customTorus = createTorusGeometry(tubeLargeR, tubeSmallR, 40, 40);
}

function draw() {
	background(0);

  if(!rotating){
    if(isAscending){
      showMsg("Is society going down the drain?", msg1, 0, -height*0.75, width/2);
    } else {
      showMsg("Or emerging out of it?", msg2, 0, -height*0.75, width/2);
    }
  }
  

  rotateZ(HALF_PI);

  // handle rotation on click
  if(rotating){
    if(frameCount - rotateStartFrame <= rotateEndFrame) rotateProgress += isAscending ? 1/rotateEndFrame : -1/rotateEndFrame;
    if(frameCount - rotateStartFrame === rotateEndFrame){
      rotating = false;
      isAscending = !isAscending;
    }
  } 
  // rotating = frameCount - rotateStartFrame < rotateEndFrame;
  rotateAngle = 0.5*(sin(rotateProgress * PI - HALF_PI) + 1) * PI;
  rotateX(rotateAngle);

  
  orbitControl();
  pointLight(244, 253, 255, 0, 0, 0);
  noStroke();
  
  texture(grassTexture);
  torus(tubeLargeR, tubeSmallR);
  // texturedTorus.display();
  // showTorus(customTorus, grassTexture);
  
  // Update rotation
  majorRotation = (majorRotation + ROTATION_SPEED);// % TWO_PI;
  
  // Draw spiraling objects on torus
  drawObjectsOnTorus(
    tubeLargeR,           // Large radius
    tubeSmallR,            // Tube radius
    largeCircleObjects,            // Number of objects around large circle
    smallCircleObjects,            // Number of objects around tube
    drawHouse,      // Drawing function
    majorRotation, // Rotation around major circle
    SPIRAL_TURNS   // Number of spiral turns
  );
}

function showMsg(msg, cnv, x, y, z){
  cnv.background(0);
  cnv.fill(255);
  // cnv.noStroke();
  cnv.textSize(width/20);
  cnv.textAlign(CENTER, CENTER);
  push();
  translate(x,y,z);
  rotateX(-QUARTER_PI);
  cnv.text(msg, cnv.width/2, cnv.height/2);
  texture(cnv);
  plane(cnv.width, cnv.height);
  pop();
}

function mousePressed(){
  if(rotating) return;
  rotating = true;
  // rotateProgress = 0;
  rotateStartFrame = frameCount;
}


function drawObjectsOnTorus(R, r, numU, numV, drawObject, rotationU, spiralOffset) {
  // R: large radius of torus
  // r: small radius of torus (tube radius)
  // numU: number of objects around the large circle
  // numV: number of objects around the tube
  // drawObject: function(p) that draws the object at origin
  // rotationU: rotation offset around major circle (0-TWO_PI)
  // spiralOffset: number of complete rotations around tube per major circle
  
  for (let u = 0; u < numU; u ++) {
    for (let v = 0; v < numV; v ++) {
			
			let thisBiz = biz[u*smallCircleObjects + v];
			
			let u_ = u*TWO_PI/numU; // + thisBiz.uOffset;
			let v_ = v*TWO_PI/numV; // + thisBiz.zOffset;
      push();
      
      // Add rotation offsets to create spiral
      let uPos = u_ + rotationU;
      // Link v rotation to u position to create spiral
      let vPos = v_ + (uPos * spiralOffset);
      
      // Calculate position on torus surface
      let x = (R + r * cos(vPos)) * cos(uPos);
      let y = (R + r * cos(vPos)) * sin(uPos);
      let z = r * sin(vPos);
      
      // Calculate surface normal
      let nx = cos(vPos) * cos(uPos);
      let ny = cos(vPos) * sin(uPos);
      let nz = sin(vPos);
      
      // Calculate tangent vector (derivative with respect to u)
      let tx = -(R + r * cos(vPos)) * sin(uPos);
      let ty = (R + r * cos(vPos)) * cos(uPos);
      let tz = 0;
      
      // Calculate bitangent using cross product of normal and tangent
      let bx = ny * tz - nz * ty;
      let by = nz * tx - nx * tz;
      let bz = nx * ty - ny * tx;
      
      // Normalize vectors
      let tLen = sqrt(tx*tx + ty*ty + tz*tz);
      let bLen = sqrt(bx*bx + by*by + bz*bz);
      
      tx /= tLen;
      ty /= tLen;
      tz /= tLen;
      
      bx /= bLen;
      by /= bLen;
      bz /= bLen;
      
      // Create rotation matrix
      applyMatrix(
        tx, ty, tz, 0,
        bx, by, bz, 0,
        nx, ny, nz, 0,
        x,  y,  z,  1
      );
      
      // Draw the object
      if(thisBiz.drawTheTree){
        drawTree();
      } else{
        drawHouse();
      }
      // drawObject();
      
      pop();
    }
  }
}





// Define a function to draw your object
  function drawCube() {
    // scale(5);
    box(width/100);
  }


function drawHut(){
  // noStroke();
  // fill('#705641');
  push();
  rotateX(HALF_PI);
  translate(0,0,0);
  cylinder(width/50, width/50);
  push();
  translate(0,width/50);
  cone(width/40, width/50);
  pop();
  pop();
}

function drawHouse(){
	
	// draw the base
  // noStroke();
  // fill('#705641');
  push();
  rotateX(HALF_PI);
  translate(0,width/100 ,0);
  fill(255);
  box(width/25);
  
  // draw the windows
  for(let i = 0; i < 4; i++){
    push();
      rotateY(HALF_PI*i);
      for(let j of [-1, 1]){
        push();
        translate(width/62.5, 0, j*width/125);
        emissiveMaterial(252, 245, 95);
        box(width/100);
        pop();
      }
    pop();
  }
  // draw the roof
  push();
  translate(0,width/40);
  rotateY(QUARTER_PI);
  fill('#e2725b');
  // texture(rustyRoof);
  cone(width/25, width/50, 5);
  pop();
  pop();
}

function drawTree(){
  push();
  rotateX(HALF_PI);
  fill("#5f433c");
  cylinder(width/100, width/20);
  // fill("#01796f");
  texture(pineTexture);
  for(let i = 0; i < 5; i++){
    translate(0, (1 - 0.2*i) * width/30, 0)
    cone(width/20 * (1 - 0.2*i), width/20 * (1 - 0.2*i));
  }
  pop();
}

class TexturedTorus {
  constructor(outerRadius, innerRadius, segments, sides, img) {
    this.outerRadius = outerRadius;
    this.innerRadius = innerRadius;
    this.segments = segments;
    this.sides = sides;
    
    // Create geometry arrays
    this.vertices = [];
    this.uvs = [];
    this.faces = [];
    this.img = img;
    
    this.generateGeometry();
  }
  
  generateGeometry() {
    // Generate vertices and UV coordinates
    for (let i = 0; i <= this.segments; i++) {
      const u = i / this.segments;
      const phi = u * TWO_PI;
      
      for (let j = 0; j <= this.sides; j++) {
        const v = j / this.sides;
        const theta = v * TWO_PI;
        
        // Calculate vertex position
        const x = (this.outerRadius + this.innerRadius * cos(theta)) * cos(phi);
        const y = (this.outerRadius + this.innerRadius * cos(theta)) * sin(phi);
        const z = this.innerRadius * sin(theta);
        
        this.vertices.push([x, y, z]);
        this.uvs.push([u, v]);
        
        // Generate faces (triangles)
        if (i < this.segments && j < this.sides) {
          const a = i * (this.sides + 1) + j;
          const b = a + 1;
          const c = (i + 1) * (this.sides + 1) + j;
          const d = c + 1;
          
          this.faces.push([a, b, c]);
          this.faces.push([b, d, c]);
        }
      }
    }
  }
  
  display() {
    push();
    texture(this.img);
    noStroke();
    
    beginShape(TRIANGLES);
    // Draw all triangular faces with texture coordinates
    for (let face of this.faces) {
      for (let vertexIndex of face) {
        const [x, y, z] = this.vertices[vertexIndex];
        const [u, v] = this.uvs[vertexIndex];
        vertex(x, y, z, u * this.img.width, v * this.img.height);
      }
    }
    endShape();
    
    pop();
  }
}



