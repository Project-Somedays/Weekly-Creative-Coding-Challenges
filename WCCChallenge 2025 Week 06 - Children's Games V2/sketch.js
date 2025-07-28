


let handPos;
let hands;
let sandLumps = [];
let gravity = 0.1;
let lumpRadius;
let lumpOverlap;
let castleBuildingMode = true;
let cnv;

let cam;

function preload() {
  hands = loadModel("Cupped hands with Birds on the wrists.stl", true);
}

function setup() {
  createCanvas(min(windowWidth, windowHeight),min(windowWidth, windowHeight), WEBGL);
  currentSelectionSize = width/10;
  cnv = createGraphics(width, height);
  handPos = createVector(0,-height/4, 0);
  lumpRadius = width/150;
  lumpOverlap = 0.4;

  cam = createCamera();
  cam.setPosition(0.5*width, -0.5*width, 0.5*width);
  cam.lookAt(0,0,0);

  
}

function draw() {
  background(220);

  directionalLight(255, 255, 255, 0, 1, 0);
  directionalLight(255, 255, 255, -0.5, 1, -0.5);
  handPos.x = map(mouseX, 0, width, -width/2, width/2);
  handPos.z = map(mouseY, 0, height, -height/2, height/2);
  cnv.clear();
  cnv.fill(0, 50);
  cnv.noStroke();
  cnv.circle(handPos.x, handPos.z, width/20);

  fill(255);
  push();

  rotateX(- HALF_PI);
  texture(cnv);
  plane(2*width, 2*height);
  pop();

  noStroke();
  fill(255);
  push()
  translate(handPos.x, handPos.y, handPos.z);
  // sphere(currentSelectionSize)
  rotateX(HALF_PI*0.75);
  rotateZ(PI);
  model(hands);
  pop();

  for (let sandLump of sandLumps) {
    sandLump.update();

    if (!sandLump.atRest) {
      for (let otherLump of sandLumps) {
        if (sandLump !== otherLump && otherLump.atRest) { // Only check against *stopped* lumps
          let d = p5.Vector.dist(sandLump.p, otherLump.p);
          let minDist = (1 - lumpOverlap) * lumpRadius * 2;
          if (d < minDist) {
            sandLump.stop();

            // Nudge implementation (with collision check):
            let nudgeDir = createVector(random(-1, 1), 0, random(-1, 1)).normalize();
            let nudgeAmount = lumpRadius * 0.1;

            let potentialPos = p5.Vector.add(sandLump.p, nudgeDir.copy().mult(nudgeAmount));
            let canNudge = true;
            for (let otherLump2 of sandLumps) {
              if (sandLump !== otherLump2) {
                let d2 = p5.Vector.dist(potentialPos, otherLump2.p);
                if (d2 < minDist) {
                  canNudge = false;
                  break;
                }
              }
            }

            if (canNudge) {
              sandLump.p.add(nudgeDir.mult(nudgeAmount));
            }
            break; // Stop checking against other lumps this frame
          }
        }
      }
      if(sandLump.p.y > 0){
        sandLump.p.y = 0;
        sandLump.stop();
      }
    }
    sandLump.show();
  }

  if(!castleBuildingMode) orbitControl();


}

class SandLump{
  constructor(x,z){
    this.p = createVector(x,handPos.y,z);
    this.v = createVector(0,0,0);
    this.atRest = false;
  }

  stop(){
    this.atRest = true;
    this.v.y = 0;
  }

  update(){
    if(this.atRest) return;
    this.v.y += gravity;
    this.p.add(this.v);
  }

  show(){
    push();
    translate(this.p.x, this.p.y, this.p.z);
    // texture(sandTexture);
    fill("#CCA65F");
    sphere(lumpRadius);
    pop();
  }


}



function mousePressed(){
  if(mouseButton === LEFT) sandLumps.push(new SandLump(handPos.x, handPos.z));
}
function keyPressed(){
  if(keyCode ===  32){
    castleBuildingMode = !castleBuildingMode;
  }
}