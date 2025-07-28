/*
Author: Project Somedays
Date: 2024-06-07
Title: WCCChallenge Unsatisfying

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Keeping it simple: what if it really WAS impossible for the dvd logo to hit the corner?

I'd love to say that the slightly imperfect logo images were all part of a devious plan, but I just shifted something in photoshop. Call it a happy accident.
Also, the thing knows to reflect when the corners hit the (secretly shortened) walls by looking at the corners. 
So sometimes it unsatisfyingly bounces around weirdly. It's not a bug if it adds to the frustration, right?

NO REGERTS!!! 😅😅😅

*/

const overlap = 1;
let mover;
let walls = [];
let dir;
let dvdLogos = [];
let speed = 5;
let music;

let wallOffset = 0;

function preload(){
  for(let i = 1; i <= 6; i++){
    dvdLogos.push(loadImage(`DVD${i}.png`));
  }
  music = loadSound("a-creepy-music-115228.mp3");
}

function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  createCanvas(windowWidth, windowHeight);
  // createCanvas(720, 720);
  imageMode(CENTER);
  rectMode(CENTER);
  
  
  
  console.log(walls);
  mover = new Mover(random(dvdLogos));
  console.log(mover.getCorners())
  strokeWeight(5);
  noFill();
  stroke(255);
  
  dir = random([PI/4, PI/4 + HALF_PI, PI/4 + PI, -PI/4].map(e => p5.Vector.fromAngle(e))).setMag(speed);
  walls = generateWalls();

  describe("Classic DVD screensaver with an upsetting twist");

  music.loop();
}

function draw() {
  background(0);
  // for(w of walls){
  //   w.show();
  // }
  mover.update();
  bounce(walls, mover.getCorners());
  

  mover.show();

  
  
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
      let inBoundsOfWall = p5.Vector.dist(wall.start, cnr) <= wall.getWallLength() && p5.Vector.dist(wall.end, cnr) <= wall.getWallLength();
      if(d <= speed && inBoundsOfWall ){ // is we're inside some threshold...
        dir.reflect(reflectionVector);
        mover.updateImage();
        return;
      }
    }
    
  }
  
}




function generateWalls(){
walls = [];
let dvdw = mover.w;
let dvdh = mover.h;
walls.push(new Wall(wallOffset + dvdw*1.05,wallOffset,width-wallOffset -dvdw*1.05,wallOffset));
walls.push(new Wall(width-wallOffset,wallOffset + dvdh*1.05,width-wallOffset,height-wallOffset-dvdh*1.05));
walls.push(new Wall(width-wallOffset-dvdw*1.05,height-wallOffset,wallOffset + dvdw*1.05,height-wallOffset));
walls.push(new Wall(wallOffset,height-wallOffset-dvdh*1.05,wallOffset,wallOffset+dvdh*1.05));
return walls;
}

// function mousePressed(){
//   setup();
// }


function easeInOutSine(x){
  return -(Math.cos(PI * x) - 1) / 2;
}




