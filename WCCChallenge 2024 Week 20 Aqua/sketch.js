/*
Author: Project Somedays
Date: 2024-05-19
Title: #WCCCChallenge Aqua

Made for Sableraph's weekly creative coding challenges, reviewed Sundays on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Didn't have much time this week, but I read the prompt and had a vision of a hamster in a Bathosphere Hamster Wheel. Enough said. Sometimes, less is more...
Night Cafe AI Art for the win: https://creator.nightcafe.studio/creation/5DHzISTzReHWcKUHeJft#comment-AepxrklTqwnnz78fnzCj

Used Dan Shiffman's flocking example code straight out of p5.js, just changed the boid rendering to a circle.

Opportunities:
 - Animating the hamsters
 - Introducing some deep sea creatures
 - A torch beam that only illuminates some of the scene
*/

let lSide =[];
let rSide =[];
let maxDiff;
const noiseZoom = 300;
let handMode = false
let bubbleMode = false;

let bubbles = [];

let fgflock;
let bgflock;

let bubbleAscendRate = 2;

let hamsterPos;
let maxLength;
let armSegments;


let hamster;
let hamsterImg;
let hamsterScl;

function preload(){
  hamsterImg = loadImage("hamster.png");
}


function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  createCanvas(1080,1920);
  maxDiff = 0.2*width;
  for(let i = 0; i < height; i++){
    lSide[i] = map(noise(0.2*width/noiseZoom, i/noiseZoom, frameCount/noiseZoom),0,1,-maxDiff,maxDiff);
    rSide[i] = map(noise(0.8*width/noiseZoom, i/noiseZoom, frameCount/noiseZoom),0,1,-maxDiff,maxDiff);
  }
  stroke(255);
  imageMode(CENTER);
  noFill();

  armSegments = 3;
  maxLength = width/6;

  hamsterScl = 0.5*width/hamsterImg.width;

  hamster = new Hamster(0,0);

  fgflock = new Flock();
  for (let i = 0; i < 25; i++) {
    fgflock.addBoid(new Boid(width / 4,height / 4));
    fgflock.addBoid(new Boid(width*0.75,height*0.75));
  }

  bgflock = new Flock();
  for (let i = 0; i < 25; i++) {
    bgflock.addBoid(new Boid(width * 0.75, height / 4));
    bgflock.addBoid(new Boid(width * 0.25, height* 0.75));
  }
 
}



function draw() {
  // background('#141e38');
  background(0);
  
  // update the biz
  updateSides();

  // show the biz
  showSides();

  bgflock.run();

  hamster.update();
  hamster.show();

  fgflock.run();
}

function updateSides(){
  lSide.splice(0,1);
  lSide.push(map(noise(0.25*width/noiseZoom, height/noiseZoom, frameCount/noiseZoom),0,1,-maxDiff,maxDiff));
  rSide.splice(0,1);
  rSide.push(map(noise(0.75*width/noiseZoom, height/noiseZoom, frameCount/noiseZoom),0,1,-maxDiff,maxDiff));
}

function showSides(){
  beginShape();
  for(let i = 0; i < height; i++){
    vertex(width*0.1 + lSide[i], i);
  }
  endShape();
  beginShape();
  for(let i = 0; i < height; i++){
    vertex(width*0.9 + rSide[i], i);
  }
  endShape();
}

function updateAndShowBubble(){
  if(random(1) < 0.025){
    bubbles.push({p: createVector(width/2, height/2 - hamsterImg.height*hamsterScl/2), d: random(width/100, width/50)});
  }

  for(let b of bubbles){
    b.p.y -= bubbleAscendRate;
    b.p.x = width/2 + map(noise(b.p.y/noiseZoom, frameCount/noiseZoom),0,1,-width/10, width/10);
    circle(b.p.x, b.p.y, b.d);
  }

  // cleaning up bubbles that are now off the screen
  for(i = bubbles.length - 1; i >= 0; i--){
    if(bubbles[i].p.y < -0.1*height) bubbles.splice(i,1);
  }
}
