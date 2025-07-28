class Formee{
    constructor(x, y, avR){
      this.p = createVector(x,y);
      this.avR = avR;
      this.pts = [];

      for(let i = 0; i < n; i++){
        let a = i*TWO_PI/n;
        this.pts[i] = {
          target_p : createVector(this.avR*cos(a), this.avR*sin(a)),
          src_p : createVector(random(1.1,2)*this.avR*cos(a), random(1.1,2)*this.avR*sin(a)),
          p : createVector(0,0),
          a : a,
          r: 0,
          offset : random(1000)
        }
      }
    }

    updateLerpToSimple(lerpCntrl){
      for(let i = 0; i < n; i++){
        let pt = this.pts[i];
        pt.p = p5.Vector.lerp(pt.target_p, pt.src_p, lerpCntrl);
      }
    }

    getAbsPoints(){
      let absPts = [];
      for(let i = 0; i < this.pts.length; i++){
        absPts[i] = p5.Vector.add(this.p, this.pts[i].p);
      }
      return absPts;
    }

    move(start, end, lerpVal){
      this.p = p5.Vector.lerp(start, end, easeInOutSine(lerpVal));
    }
    
  
  
  
    show(){
      
      noStroke();
      beginShape();
      for(let pt of this.pts){
        // curveVertex(pt.p.x, pt.p.y);
        vertex(this.p.x + pt.p.x, this.p.y + pt.p.y);
      }
      endShape(CLOSE);
      
  }
  }