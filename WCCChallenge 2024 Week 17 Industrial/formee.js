class Formee{
    constructor(x, y, avR){
      this.p = createVector(x,y);
      this.avR = avR;
      this.pts = [];
      for(let i = 0; i < n; i++){
        let a = i*TWO_PI/n;
        this.pts[i] = {
          p : createVector(this.p.x + this.avR*cos(a), this.p.y + this.avR*sin(a)),
          a : a,
          r: 0,
          offset : random(1000)
        }
      }
    }
    updateWithNoise(noiseStrength){
      for(let i = 0; i < n; i++){
        let pt = this.pts[i];
        pt.r = this.avR + noiseStrength*map(noise(pt.offset + frameCount * progressionRate),0,1, -this.avR/4, this.avR/4);
        pt.p.set(this.p.x + pt.r*cos(pt.a), this.p.y + pt.r*sin(pt.a));
      }
    }
  
    updateLerpR(){
      for(let i = 0; i < n; i++){
        let pt = this.pts[i];
        pt.r = easeOutElastic(phase1LerpCntrl)*t.avR; // set r
        pt.p.set(this.p.x + pt.r*cos(pt.a), this.p.y + pt.r*sin(pt.a));
      }
    }
    
  
  
  
    show(){
      
      noStroke();
      beginShape();
      for(let pt of this.pts){
        curveVertex(pt.p.x, pt.p.y);
      }
      endShape(CLOSE);
      
  }
  }