/* 
Author: Project Somedays
Date: 2024-08-24
Title: WCCChallenge 2024 Week 34 - Rewind

Taking cues from The Coding Train on wrapping Matter.js rectangles in a p5.js class
https://www.youtube.com/playlist?list=PLRqwX-V7Uu6bLh3T_4wtrmVHOrOEM1ig_
*/


class Box{
    constructor(x,y,colour, boxSize){
        this.initPos = {x: x, y: y};
        this.angle = 0;
        this.colour = colour;
        this.boxSize = boxSize;
        this.body = Bodies.rectangle(x,y,boxSize, boxSize);
    }

    reset(){
        this.body.position.x = this.initPos.x;
        this.body.position.y = this.initPos.y;
        this.body.angle = 0;
        Body.setVelocity(this.body, {x: 0, y: 0});
        Body.setAngularVelocity(this.body, 0);
    }

    show(){
        fill(this.colour);
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        square(0,0, this.boxSize);
        pop();
    }
}