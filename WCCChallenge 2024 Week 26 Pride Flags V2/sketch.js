/*
Author: Project Somedays
Date: 2024-06-28
Title: WCCChallenge Week 26 Pride Flags

RESOURCES:
POrt of Dan Shiffman Inverse Kinematics Code: https://editor.p5js.org/codingtrain/sketches/CvGJFQPLa

*/


const prideColours = "#E40303, #FF8C00, #FFED00, #008026, #004CFF, #732982".split(", ");
const res = 10;
const flappyRate = 120;
let tentacle; 

let flagWidth, flagHeight, waveHeight, waveLength;

// let flagWidth = 400;
// let flagHeight = 240;
// let waveHeight = 40;
// let waveLength = 100;
let windSpeed = 0.1;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  flagWidth = width*0.8;
  flagHeight = flagWidth*(3/5);
  waveHeight = width*0.2;
  waveLength = width/8;
  noFill();
  noStroke();
  camera(width/3, width/3, width/3, 0, 0, 0);


  // We set up point as a p5.Vector instead of passing Segment an x and a y
  // because JavaScript does not have function overloading.
  // See segment.js for more information.
  let point = createVector()

  let current = new Segment(point, 10, 0);
  for (let i = 0; i < 20; i++) {
    let next = new Segment(current, 10, i);
    current.child = next;
    current = next;
  }
  tentacle = current;
}

function draw() {
  background(0);

  let time = frameCount * windSpeed;
  
  // for (let y = 0; y < flagHeight; y += flagHeight / 6) {
  //   beginShape(TRIANGLE_STRIP);
  //   let color = getColor(y / flagHeight);
  //   fill(color);
  //   vertex(-flagWidth/2, y - flagHeight/2 + flagHeight/6, sin(time)*waveHeight); // squaring it up
  //   for (let x = 0; x <= flagWidth; x += 10) {
  //     let wave = sin((x / waveLength + time)) * waveHeight// * (1 - y / flagHeight);
  //     vertex(x - flagWidth / 2, y - flagHeight / 2, wave);
  //     vertex(x - flagWidth / 2 + 5, y - flagHeight / 2 + flagHeight/6, wave);
  //   }
  //   vertex(flagWidth/2+5, y - flagHeight/2, sin(time + flagWidth/waveLength)*waveHeight); // squaring it up
  //   endShape();
  // }

  // orbitControl();

  tentacle.follow(mouseX, mouseY, 0.25*width*cos(frameCount * TWO_PI/60));
  tentacle.update();
  tentacle.show();

  let next = tentacle.par;
  while (next) {
    next.follow();
    next.update();
    next.show();
    next = next.par;
  }
}

function getColor(t) {
  if (t < 1 / 6) return color(255, 0, 0); // Red
  if (t < 2 / 6) return color(255, 165, 0); // Orange
  if (t < 3 / 6) return color(255, 255, 0); // Yellow
  if (t < 4 / 6) return color(0, 128, 0); // Green
  if (t < 5 / 6) return color(0, 0, 255); // Blue
  return color(75, 0, 130); // Indigo
}