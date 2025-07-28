/*
Author: Project Somedays
Date: 2024-04-14
Title: #WCCChallenge 2024 Week 15: Eclipse

Made for Sableraph's weekly creative coding challenges, reviewed Sundays on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Inpsired by https://www.instagram.com/reel/C5ksSxQOitJ/ by @lejeunerenard

Using erase() noErase(), a feature of p5.js I learned from Steve's Makerspace: https://www.youtube.com/watch?v=zDlfsdT7WG8

Spiral function from WolframAlpha:https://www.wolframalpha.com/input/?i=Archimedes%27+spiral
*/

const phaseRate = 0.25;
const rotationDivisor = 750;
let s;
let starfield;
let moons = [];
let c;

const archimedesSpiral = (a,b,t) => createVector(a*cos(t)*(t)**(1/b),a*sin(t)*(t)**(1/b));

function setup() {
	createCanvas(1080, 1080);
  pixelDensity(1);
  
  c = createVector(width/2, height/2);
  s = width/5;
  starfield = createGraphics(width*sqrt(2), height*sqrt(2));
  starfield.fill(255);

  for(let i = 0; i < width*height/1000; i++){
    starfield.circle(random(starfield.width), random(starfield.height), randomGaussian()*3);
  }

  let a = 0;
  for(let i = 0; i < 100 ; i ++){
    let centre = archimedesSpiral(20,1, a);
    let ms = map(p5.Vector.dist(centre, createVector(0,0)), 0, width*sqrt(2), 5, s);
    moons.push(new Moon(width/2 + centre.x, height/2 + centre.y, ms));
    a += radians(20);
  }
}

function draw() {
  background(0);
	
  // draw star field
  imageMode(CENTER);
  push();
  translate(width/2, height/2);
  rotate(frameCount/rotationDivisor);
  image(starfield,0,0);
  pop();
 
  for(let m of moons){
    m.update();
    m.show();
  }
  
}



