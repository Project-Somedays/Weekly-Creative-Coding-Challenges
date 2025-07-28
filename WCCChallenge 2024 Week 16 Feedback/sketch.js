/*
Author: Project Somedays
Date: 2024-04-18
Title: #WCCChallenge 2024 Week 15 - Feedback

Made for Sableraph's weekly creative coding challenges, reviewed Sundays on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Decided to keep it incredibly minimal this week - thought I'd take advantage of the artefacts at the edges
Call it a Bob Ross happy accident!

Thanks to Aaron Reuland (a_ soluble_fish) for the excellent tutorial https://openprocessing.org/sketch/2239520 apparently on Mastadon? Never heard of it https://mstdn.social/@AaronReuland
Drawing the canvas back to itself on a doppler spiral

Doppler spiral function comes from Wolfram Alpha: https://mathworld.wolfram.com/DopplerSpiral.html
*/

const dopplerSpiral = (a, b, t) => createVector(a * (b * t + t * cos(t)), a * t * sin(t));
const noiseProgRate = 200;
const colourProgRate = 0.2;
let dopplerA, dopplerB;
let xOff, yOff, aOff;

function setup() {
  createCanvas(1920, 1080);
  noFill();
  rectMode(CENTER);
  imageMode(CENTER);
  colorMode(HSB, 360, 100, 100, 100);
  pixelDensity(1);

  strokeWeight(20);
  background(0);
  dopplerA = random(0.1, 2);
  dopplerB = random(0.01, 0.1);
  xOff = random(1000);
  yOff = random(1000);
  aOff = random(1000);
}

function draw() {
  let g = get();
  let t = 0.5 * (sin(radians(frameCount / 10)) + 1) * 10 * TWO_PI;
  let p = dopplerSpiral(dopplerA, dopplerB, t);
  let x = map(noise(frameCount / noiseProgRate + xOff), 0, 1, 0.01 * width, 0.1 * width);
  let y = map(noise(frameCount / noiseProgRate + yOff), 0, 1, 0.01 * width, 0.1 * width);
  let a = map(noise(frameCount / noiseProgRate + aOff), 0, 1, -TWO_PI, TWO_PI);
  stroke(colourProgRate * frameCount % 360, 100, 100, 25);

  push();
  translate(width / 2, height / 2);
  image(g, p.x / 2, p.y / 2, width * 0.99, height * 0.99);
  rotate(a);
  rect(0, 0, x, y, 0.1 * x, 0.1 * x);
  pop();

}
