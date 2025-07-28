/*
Author: Project Somedays
Date: 2024-06-07
Title: WCCChallenge Unsatsfying



Fakeouts are pretty funny

//####### RESOURCES #######//
Sliding Sound: https://pixabay.com/sound-effects/sliding-noise-v2-83483/
Anvil Fall: https://pixabay.com/sound-effects/fall-to-splat-85744/
Tentacle Sound: https://pixabay.com/sound-effects/spaghetti-jello-combo-swish-30982/
Abduction Sound: https://pixabay.com/sound-effects/abduction-bass-78451/
Drain Sound: https://pixabay.com/sound-effects/drain-65442/

Anvil: https://www.stickpng.com/img/tools-and-parts/anvils/anvil

Easing Functions: https://easings.net/


*/

const overlap = 1;
let mover;
let walls = [];
let dir;
let dvdLogos = [];
let imageIndex = 0;
let topRightCorner;
let wallOffset = 10;
let disruptionMethods = [];
let noiseAbduction, noiseAnvil, noiseDrain, noiseSliding, noiseTentacle;
let artAnvil, artMagnet;
let disruptionIndex = 0;
let isDisrupted = false;
let currentDisruptionMethod;
let anvil;
let disruptionInProgress = false;
let magnet;

function preload(){
  for(let i = 1; i <= 6; i++){
    dvdLogos.push(loadImage(`DVD${i}.png`));
  }
  noiseAbduction = loadSound('noiseAbduction.mp3');
  noiseAnvil = loadSound("noiseAnvil.mp3");
  noiseDrain = loadSound("noiseDrain.mp3");
  noiseSliding = loadSound("noiseSliding.mp3");
  noiseTentacle = loadSound("noiseTentacle.mp3");
  artAnvil = loadImage("anvil.png");
  artMagnet = loadImage("artMagnet.png");
}


class Anvil{
  constructor(){
    this.p = createVector(width - wallOffset - mover.w/2, -height/4);
    this.v = createVector(0,0);
  }

  fall(){
    this.v.add(createVector(0,height/750));
    this.p.add(this.v);
  }

  show(){
    image(artAnvil, this.p.x, this.p.y)
  };
}

function lerpMoveTo(lerpFrames, lerpTracker, ptA, ptB, easingFunction){
  if(lerpTracker < 1) lerpTracker += 1/lerpFrames;
  return p5.Vector.lerp(ptB, ptA, easingFunction(lerpTracker));
}



function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  // createCanvas(windowWidth, windowHeight);
  createCanvas(720, 720);
  imageMode(CENTER);
  rectMode(CENTER);
  disruptionMethods = [
    retractWalls,
    grabWithArm,
    pullPlug,
    skewWalls,
    abduct,
    dropAnvil,
    flamethrower,
    magnetise
  ];
  walls = generateWalls();
  
  console.log(walls);
  mover = new Mover(random(dvdLogos));
  console.log(mover.getCorners())
  strokeWeight(5);
  noFill();
  stroke(255);
  targetPoint = createVector(width-mover.w/2-wallOffset, mover.h/2+wallOffset);
  // dir = p5.Vector.fromAngle(-HALF_PI/2);
  dir = p5.Vector.sub(targetPoint, mover.p).setMag(2);

  currentDisruptionMethod = disruptionMethods[disruptionIndex];

  console.log(`disruptionIndex = ${disruptionIndex} --> ${disruptionMethods[disruptionIndex]}`);

  anvil = new Anvil();
  magnet = new Magnet();
  console.log(magnet);
}

function draw() {
  background(0);
  for(w of walls){
    w.show();
  }
  mover.update();
  bounce(walls, mover.getCorners());
  

  if(isDisrupted){
    isDisrupted = false;
    disruptionIndex = (disruptionIndex + 1)%disruptionMethods.length;
    setup();
  }

  if(p5.Vector.dist(mover.p, targetPoint) < width/10){
    fill(255,0,0);
    rect(mover.p.x, mover.p.y,mover.w*1.1, mover.h*1.1);
    // retractWalls();
    disruptionInProgress = true;
    
  }

  if(disruptionInProgress) magnetise();

  mover.show();

  
  
}

class Mover{
  constructor(img){
    this.w = width/5;
    this.h = this.w/2;
    this.p = createVector(random(this.w, width-this.w), random(this.h, height - this.h));
    this.isFalling = false;
    this.a = createVector(0,0);
    this.img = img;
    
  }

  getCorners(){
    return[
      createVector(this.p.x - this.w/2, this.p.y - this.h/2),
      createVector(this.p.x + this.w/2, this.p.y - this.h/2),
      createVector(this.p.x + this.w/2, this.p.y + this.h/2),
      createVector(this.p.x - this.w/2, this.p.y + this.h/2)
    ];
  }
  update(){
    if(!this.isFalling){
      this.p.add(dir);
      return;
    }
  }

  show(){
    image(dvdLogos[imageIndex], this.p.x, this.p.y, this.w, this.h);
  }
   
}


function bounce(walls, corners){
  // scalar projection to get the distance to the wall
  for(let cnr of corners){
    for(let wall of walls){
      let ap = p5.Vector.sub(cnr, wall.start);
      let ab = p5.Vector.sub(wall.end, wall.start);
      ab.normalize();
      ab.mult(ap.dot(ab));
      let reflectionVector = createVector(-ab.y, ab.x); // the normal vector to the wall
      let normal = p5.Vector.add(wall.start, ab); // scalar projection point
      // circle(normal.x, normal.y,overlap);
      // line(cnr.x, cnr.y, normal.x, normal.y);
      let d = p5.Vector.dist(cnr, normal); // how far from the wall?
      let inBoundsOfWall = p5.Vector.dist(wall.start, cnr) < wall.getWallLength() && p5.Vector.dist(wall.end, cnr) < wall.getWallLength;
      if(d <= overlap && inBoundsOfWall ){ // is we're inside some threshold...
        dir.reflect(reflectionVector);
        return;
      }
    }
    
  }
  
}




function generateWalls(){
walls = [];
walls.push(new Wall(wallOffset,wallOffset,width-wallOffset,wallOffset));
walls.push(new Wall(width-wallOffset,wallOffset,width-wallOffset,height-wallOffset));
walls.push(new Wall(width-wallOffset,width-wallOffset,wallOffset,height-wallOffset));
walls.push(new Wall(wallOffset,width-wallOffset,wallOffset,wallOffset));
return walls;
}

function mousePressed(){
  setup();
}


function easeInOutSine(x){
  return -(Math.cos(PI * x) - 1) / 2;
}




