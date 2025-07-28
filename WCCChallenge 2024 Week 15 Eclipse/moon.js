/*
Author: Project Somedays
Date: 2024-04-14
Title: #WCCChallenge 2024 Week 15 Eclipse
*/

class Moon{
    constructor(x,y, ms){
      this.p = createVector(x,y);
      this.a = p5.Vector.sub(c,this.p).heading();
      this.phase = map(this.a%TWO_PI, 0, TWO_PI, 0, 1);
      this.layer = createGraphics(s, s);
      this.ms = ms;
    }
  
    update(){
      this.phase -= phaseRate;
      if(this.phase < -this.ms) this.phase = this.ms;
  
    }
    
    show(){
      this.layer.fill(255);
      this.layer.circle(this.layer.width/2,this.layer.height/2, this.ms);
      this.layer.erase();
      this.layer.circle(this.layer.width/2 + this.phase,this.layer.height/2, this.ms);
      this.layer.noErase();
      push();
      translate(this.p.x, this.p.y);
      rotate(this.a);
      image(this.layer,0,0);
      pop();
    }
  }