class Mover{
    constructor(x,y, freqAmp, colour){
      this.p = createVector(x,y);
      this.colour = colour;
      this.v = createVector(-startingVelocity, 0);
      this.a = createVector(-acceleration,0);
      this.freqAmp = map(abs(freqAmp), 0, 1, moverSize, maxSizeMultiplier*moverSize);
    }
  
    update(){
      this.v.add(this.a);
      this.p.add(this.v);
    }
    
    show(){
      fill(this.colour);
      let perturbation = noise(this.p.x/noiseZoom, this.p.y/noiseZoom, noiseFieldOffset);
      circle(this.p.x, this.p.y, this.freqAmp*(1+perturbation));
    }
  
  }
  