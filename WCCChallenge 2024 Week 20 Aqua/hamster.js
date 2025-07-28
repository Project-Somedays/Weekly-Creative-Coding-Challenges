class Hamster{
    constructor(x,y){
      this.basePos = createVector(width/2, height/2),
      this.noiseOffsetR = random(1000),
      this.noiseOffsetA = random(1000),
      this.currentPos = createVector(x,y);
    }
  
    update(){
      let r = map(noise(this.noiseOffsetR + frameCount/300), 0, 1, -0.05*width, 0.05*width);
      let a = map(noise(this.noiseOffsetA + frameCount/300), 0, 1, -PI, PI);
      this.currentPos.set(this.basePos.x + r*cos(a), this.basePos.y + r*sin(a));
    //   for(let i = 0; i < this.arms.length; i++){
    //     let a = map(noise(i*1000 + frameCount/300),0,1,-PI/3, PI/3) + i*PI; // for the RHS make it different
    //     let r = width*0.5;
    //     // let armPos = createVector(this.currentPos.x + r*cos(a),this.currentPos.y + r*cos(a));
    //     let armPos = createVector(r*cos(a) - this.arms[i].relativeAnchorPt.x,r*sin(a)-this.arms[i].relativeAnchorPt.y);
    //     this.arms[i].setTarget(armPos);
    //     // circle(armPos.x + this.currentPos.x, armPos.y + this.currentPos.y, 50);
    //   }
    }
  
    show(){
      push();
      translate(this.currentPos.x, this.currentPos.y);
      image(hamsterImg,0,0, hamsterImg.width*hamsterScl, hamsterImg.height*hamsterScl);
    //   for(let a of this.arms){
    //     a.show();
    //   }
      pop();
    }
  }
  
  function updateHamsterPos(){
    hamsterPos.currentPos.set(hamsterPos.basePos.x + 0.1*width*noise(frameCount/300 + hamsterImg))
  }