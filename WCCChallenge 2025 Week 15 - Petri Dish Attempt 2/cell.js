class Cell{
    constructor(col){
        this.colour = col;
        this.p = getPetriPoint().copy();
        this.r = random(width/60, width/30);
        this.maxStep = random(width/15, width/10);
        this.stepFrames = floor(random(30, 120));
        this.prevP = this.p.copy();
        let a = random(TWO_PI);
        this.target = createVector(this.p.x + this.maxStep * cos(a), this.p.y + this.maxStep * sin(a));
        this.interTarget = createVector();
        this.calcInterTarget();
        this.delay = floor(random(1, 120));
        this.progress = this.delay;
        this.perimeter = [];
        for(let i = 0; i < detailLevel; i++){
            this.perimeter[i] = new Pt(i, this.r, this.prevP, this.target, this.stepFrames);
        }
    }


    calcInterTarget(){
        let prevP2Target = p5.Vector.sub(this.target, this.prevP);
        let d = min(prevP2Target.mag(), this.maxStep);
        this.interTarget = p5.Vector.add(this.prevP, prevP2Target.setMag(d));
    }

    update(){
        this.progress = (this.progress + 1)%this.stepFrames;
        if(this.progress === 0){
            this.prevP = this.interTarget.copy();
            if(p5.Vector.dist(this.prevP, this.target) < 0.1) this.setNewTarget();
            this.calcInterTarget();
            for(let pt of this.perimeter){
                pt.retarget(this.interTarget);
            }
        }

        this.p = p5.Vector.lerp(this.prevP, this.interTarget, easeProgress(this.progress/this.stepFrames));
        for(let pt of this.perimeter){
            pt.update();
        }
    }

    setNewTarget(){
        let a = random(TWO_PI);
        let r = random(0, 0.45*width);
        this.target.set(r*cos(a) + width/2, r*sin(a) + height/2);
    }

    show(){
        colorMode(RGB);

        if(debug){
            
            strokeWeight(5);
            // show prevP as blue
            stroke(0,0,255);
            circle(this.prevP.x, this.prevP.y, 10);

            // show target as red
            stroke(255,0,0);
            circle(this.target.x, this.target.y, 10);

            // show intermediate target as green
            stroke(0,255, 0);
            circle(this.interTarget.x, this.interTarget.y, 10);

            // show progress
            stroke(255);
            strokeWeight(1);
            text(round(this.progress, 2), this.p.x, this.p.y);
        }

  
        // stroke(255);
        // strokeWeight(5);
        // noFill();
        noStroke();
        fill(this.colour);
        beginShape();
        for(let pt of this.perimeter){
            vertex(pt.p.x, pt.p.y);
            pt.show();
        }
        endShape(CLOSE);
    }
}


// class Pt{
//     constructor(delay, index, src, dst){
//       this.progress = -delay;
//       this.p = createVector();
//       this.index = index;
//       this.a = this.index * TWO_PI/n;
//       this.src = src.copy();
//       this.dst = dst.copy();
//       this.sep = p5.Vector.dist(this.src, this.dst);
//       this.delay = delay
//     }
    

//     update(){
//       this.progress += 2;
//       this.ezdProg = ease(min(max(0, this.progress/transitionFrames), 1));
//       this.r = prog2R(this.ezdProg);
//       this.cp = p5.Vector.lerp(this.src, this.dst, this.ezdProg);
//       stroke(300);
//       circle(this.cp.x, this.cp.y, 10);
//       this.p.set(this.cp.x + this.r * cos(this.a), this.cp.y + this.r * sin(this.a));
      
//     }
      
//     resetPt(target){
//       this.src = this.dst.copy();
//       this.dst = target.copy();
//       this.sep = p5.Vector.dist(this.dst, this.src);
//       // this.p = createVector(R*cos(this.a) + this.src.x, R*sin(this.a) + this.src.y);
//       let d = p5.Vector.dist(this.p, this.dst);
//       let newDelay = map(d, this.sep - R, this.sep+R, 0, transitionFrames/2) 
//       this.progress = -newDelay;
//     }
    
//     show(){
//       colorMode(HSB, 360, 100, 100, 100)  
//       stroke(map(this.delay, 0, transitionFrames/2, 0, 360));
      
      
//       circle(this.p.x, this.p.y, 20);
//       // text(round(this.ezdProg, 2), this.p.x, this.p.y);
//     }
//   }
    