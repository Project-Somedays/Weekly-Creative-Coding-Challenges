/*
Author: Project Somedays
Date: 2024-08-17
Title: WCCChallenge 2024 Week 33 - Unrealistic Horse

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Forward Kinematics this time!

*/

let segments = [];


function setup(){
  createCanvas(windowWidth, windowHeight);

  segments.push(new Segment(width/2, height/2, height/5, 0, 2*TWO_PI/3));

}

function draw(){
  background(0);

  stroke(255);
  strokeWeight(10);
  segments[0].update(width/2, height/2, 0.5*(sin(frameCount/300) + 1));

  




}

class Segment{
  constructor(aX, aY, len, minA, maxA){
    this.a = createVector(aX,aY);
    this.angle = 0;
    this.len = len;
    this.minAngle = minA;
    this.maxAngle = maxA;
  }

  update(aX, aY, lerpVal){
    this.a.set(aX, aY);
    this.angle = lerp(this.minAngle, this.maxAngle, lerpVal);
  }

  calculateB(){
    this.b = createVector(this.a.x + this.len*cos(this.angle), this.a.y + this.len*sin(this.angle));
  }

  show(){
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }

}
