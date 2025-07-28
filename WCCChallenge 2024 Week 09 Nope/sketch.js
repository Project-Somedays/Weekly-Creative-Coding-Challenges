/*
Author: Project Somedays
Date: 2024-03-03
Title: #WCCChallenge "Nope"

Building off a sketch by Daniel Shiffman, video: https://youtu.be/10st01Z0jxc
Only show inverse kinematic legs when they're close enough to the eye cluster
Move pupils in eye cluster depending on position on screen using noisefield

Background image from https://www.freepik.com/free-photo/metal-texture-grunge-effect_997785.htm#query=scary%20floor&position=33&from_view=keyword&track=ais&uuid=4ed472bb-9516-407d-a365-5332511b6a4e

Was actually MORE nope without the eyes, but I liked them
Need some sort of scuttling sound effect.
I like how it looks like it's trying to explore its environment and escape.

WIP. 
TODO: Move the tentacles inside a creature class.
TODO: Make the legs more interesting
TODO: Add scuttling sound effect?
TODO: Find a way of dynamically changing the density of legs to suit screen resolution
TODO: Dig into Shiffman's code to work out why Segment has hard-coded values
*/


let tentacles = [];
let xOff;
let yOff;
let moveRate = 0.008;
let n = 100;
let segL;
let segN = 7;
let eyeN = 10;
let scl;
let creature;
let eyeNoiseZoom = 50;
let yardstick;
let img

function preload(){
    img = loadImage("metal-texture-grunge-effect.jpg");
}



function setup() {
    createCanvas(1080, 1920, P2D);
    scl = height/img.height;
    yardstick = max(width, height);
    pos = createVector(0,0);
    xOff = random(1000);
    yOff = random(1000);
    segL = 0.2*yardstick;
    

    creature = new EyeCluster(0.02*yardstick);

    
    for (let a = 0; a < n; a ++) {
        let x = random(width);
        let y = random(height);
        tentacles.push(new Tentacle(x, y));
    }

}

function draw() {
    image(img, 0, 0, img.width*scl, img.height*scl);

    // move the creature
    let mx = width*noise(xOff);
    let my = height*noise(yOff);
    creature.update(mx,my);

    // draw the "leg" if the IK tentacle is close enough

    for (let i = 0; i < tentacles.length; i++) {
        let t = tentacles[i];
        t.update();
        if(p5.Vector.dist(creature.p, t.base) < 0.75*segL){
            t.show();
        }
        
    }

    // draw the creature on top
    creature.show();
    
    // update the noise offsets to move the creature
    xOff += moveRate;
    yOff += moveRate;
}

class EyeCluster{
    constructor(s){
        this.p = createVector(0,0);
        this.s = s;
    }

    update(x,y){
        this.p.set(x,y);
    }   

    drawEye(x,y){
        stroke(0);
        fill(255);
        circle(x, y, this.s);
        fill(0);
        let noiseVal = noise(x/eyeNoiseZoom, y/eyeNoiseZoom);
        let r = map(noiseVal, 0, 1, -0.6*this.s, 0.6*this.s);
        let a = map(noiseVal, 0, 1, 0, TWO_PI);
        circle(x + r*cos(a), y + r*sin(a), 0.4*this.s);
    }
    
    show(){
        // draw the centre eye
        this.drawEye(this.p.x, this.p.y);
       for(let i = 0; i < 6; i++){
         let a = i * TWO_PI/6;
         let r = this.s;
         this.drawEye(this.p.x + r*cos(a), this.p.y + r*sin(a));
       
       }
    }
}
