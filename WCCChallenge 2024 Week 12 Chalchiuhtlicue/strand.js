/*
Strands are made up of:
- a big old custom lineshape that uses part of a quint easing function to curve off the main path
- a sine curve mixed with a noise-based perturbation

The problem is that the sine curve is locked to the xy and can't follow a curve... hmmmmmmmmm
*/

class Strand{
    constructor(sx, sy, span, dir = 1){
      this.start = createVector(sx, sy); 
      this.yEnd = null;
      this.span = span; // how long should the strand go for
      this.curveStart = 0.6;
      this.endShape = null;
      this.pts = null; // define the points from 0,0 - we'll push()translate()pop() later
      this.dir = dir;
      this.offset = random(1000);
      this.period = this.span / 5; // so the squiggles scale properly
      this.img = random() < 0.5 ? circ : shell;
    }
  
    update(){
      // using noise to move the sides of the river
      this.yEnd = map(noise((frameCount + this.offset)/200), 0, 1, 0.1, 0.4); 
      
      // refilling points
      this.pts = [];
      for(let x = 0; x < this.span; x+= wobbleFreq){
        if(x > this.curveStart*this.span){
          let y = this.dir*this.yEnd*height*easeInOutQuint((x - 0.5*this.span)/this.span);
          this.pts.push(createVector(x,y));
        } else{
          this.pts.push(createVector(x, 0));
        }
      }
    }
    
    show(){
      strokeWeight(sw);
      stroke(riverCol);
      noFill();

      // moving to the start of the river stran and drawing
      push();
      translate(this.start.x, this.start.y);
      beginShape();
      for(let pt of this.pts){
        vertex(pt.x, pt.y)
      }
      endShape();

      this.drawSquiggle();
      pop();

      // get orientation of the last segment
      let dir = p5.Vector.sub(this.pts[this.pts.length-1], this.pts[this.pts.length-2]).setMag(1);
      let p = p5.Vector.add(this.pts[this.pts.length-1], dir);
      push();
      translate(p.x + this.start.x, p.y + this.start.y);
      rotate(dir.heading() - QUARTER_PI);
      imageMode(CORNER);
      image(this.img, 0,0, this.img.width*shellScale, this.img.height*shellScale);

      pop();
      // 
    }
  
    drawSquiggle(){
      strokeWeight(sw/15);
      stroke(0);
      beginShape();
      noFill();
      // drawing the wobble up one way
      for(let i = 0; i < this.pts.length; i++){
        let a = i*this.period*TWO_PI/(this.span/wobbleFreq);
        let noiseVal =  noise((this.pts[i].x + a)/noiseZoom, (this.pts[i].y + a)/noiseZoom, t);
        let yPerm = map(noiseVal, 0, 1, -10, 10);
        let xPerm = map(noiseVal, 0, 1, -3, 3);
        vertex(this.pts[i].x + xPerm, this.pts[i].y + sw*0.5*0.3 + 2*sin(a) + yPerm)
      }
      // and back the other
      for(let i = this.pts.length - 1; i > 0; i --){
        let a = i*this.period*TWO_PI/(this.span/wobbleFreq);
        let noiseVal =  noise((this.pts[i].x + a)/noiseZoom, (this.pts[i].y + a)/noiseZoom, t);
        let yPerm = map(noiseVal, 0, 1, -10, 10);
        let xPerm = map(noiseVal, 0, 1, -3, 3);
        vertex(this.pts[i].x + xPerm, this.pts[i].y - sw*0.5*0.3 + 2*sin(a) + yPerm)
      }
      endShape();
    }
  }