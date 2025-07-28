let ffSize;
let s;
let frostFingers = [];
const n = 30;
const noiseZoom = 15;

function setup() {
  createCanvas(windowWidth, windowHeight);
  s = min(width, height);
  ffSize = s/100;
  noStroke();
  for(let i = 0; i < n; i++){
    frostFingers.push(new FrostFinger(width/2, height/2, i*TWO_PI/n + random(-PI/50, PI/50)));
  }
  background(0);

  
}

function draw() {
  
  // circle(width/2, height/2, 100);
  for(let ff of frostFingers){
    ff.update();
    ff.show();
  }
}

class FrostFinger{
  constructor(x,y, a){
    this.p = createVector(x,y);
    this.a = a;
    this.offset = random(1000);
  }

  update(){
    let pertA = map(noise((this.p.x + this.offset)/noiseZoom, this.p.y/noiseZoom), 0, 1, -PI/6, PI/6);
    let dir = p5.Vector.fromAngle(this.a + pertA);
    this.p.add(dir);
  }

  show(){
    fill(255, 50);
    strokeWeight(5);
    circle(this.p.x, this.p.y, ffSize);
    strokeWeight(1);
    

  }
  

  
}
