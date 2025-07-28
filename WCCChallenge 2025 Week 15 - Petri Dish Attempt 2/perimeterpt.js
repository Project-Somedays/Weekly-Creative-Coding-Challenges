class Pt{
    constructor(index, maxR, src, dst, transitionFrames){
        this.progress = 0;
        this.transitionFrames = transitionFrames;
        this.maxR = maxR;
        this.p = createVector();
        this.index = index;
        this.newDelay = 0;
        this.a = this.index * TWO_PI/detailLevel;
        this.src = createVector();
        this.target = src.copy(); //awkardness from resetPt
        this.sep = p5.Vector.dist(this.src, this.target);
        this.retarget(dst);
    }
    
    update(){
      this.progress += 2;
      this.ezdProg = easeProgress(min(max(0, this.progress/this.transitionFrames), 1));
      this.r = prog2R(this.maxR, this.ezdProg);
      this.cp = p5.Vector.lerp(this.src, this.target, this.ezdProg);
      stroke(300);
    //   circle(this.cp.x, this.cp.y, 10);
      this.p.set(this.cp.x + this.r * cos(this.a), this.cp.y + this.r * sin(this.a));
      
    }
      
    retarget(target){
      this.src = this.target.copy();
      this.target = target.copy();
      this.sep = p5.Vector.dist(this.target, this.src);
      // this.p = createVector(R*cos(this.a) + this.src.x, R*sin(this.a) + this.src.y);
      let d = p5.Vector.dist(this.p, this.target);
      this.newDelay = map(d, this.sep - this.maxR, this.sep+ this.maxR, 0, this.transitionFrames/2) 
      this.progress = -this.newDelay;
    }
    
    show(){
    //   colorMode(HSB, 360, 100, 100, 100)  
    //   stroke(map(this.delay, 0, this.transitionFrames/2, 0, 360));
    stroke(255);
      
      
      circle(this.p.x, this.p.y, 5);
      // text(round(this.ezdProg, 2), this.p.x, this.p.y);
    }
  }