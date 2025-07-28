class Car{
    constructor(x,y, carScl, headScl){
      this.p = createVector(x,y);
      this.currentP = this.p.copy();
      this.currentRot = 0;
      this.currentHeadRot = 0;
      this.headScl = headScl;
      this.carScl = carScl;
      this.carWidth = car.width*this.carScl;
      this.carHeight = car.height*this.carScl;
      this.headWidth = head.width*this.headScl;
      this.headHeight = head.height*this.headScl;
      this.arms = [];
      
      // place the arms:
      // layer is in front or behind the car
      // constructing arm: anchorX, anchorY, centre of cycleX, centre of cycle Y;
      this.arms.push({layer: 1, arm: new Arm(this.carWidth*-0.4, this.carHeight*0.08, 0,this.carHeight*0.3)}); //BACK
      this.arms.push({layer: 0, arm: new Arm(this.carWidth*-0.1, this.carHeight*0.2, this.carWidth*0.1,this.carHeight*-0.4)}); //BEHIND BACK R
      this.arms.push({layer: 0, arm: new Arm(this.carWidth*0.4, this.carHeight*0.2, this.carWidth*0.6,this.carHeight*-0.5)}); //BEHIND FRONT
      this.arms.push({layer: 1, arm: new Arm(this.carWidth*0.44, this.carHeight*0.25, this.carWidth*0.6,this.carHeight*-0.5)}); // FRONT
      this.arms.push({layer: 1, arm: new Arm(this.carWidth*0.32, this.carHeight*0.09, this.carWidth*0.8,this.carHeight*-0.3)}); // TOP
      this.arms.push({layer: 1, arm: new Arm(this.carWidth*0.24, this.carHeight*0.18, this.carWidth*0.6,this.carHeight*-0.2)}); // FRONT LEFT
      this.arms.push({layer: 1, arm: new Arm(this.carWidth*0.04, this.carHeight*0.24, this.carWidth*0.5,this.carHeight*-0.1)}); // MIDDLE LEFT
      
    }
  
    trackArmsToPoints(){   
      for(let arm of this.arms){ 
        let t = arm.arm.cycleOffset + frameCount * TWO_PI/armCycleFrames;
        let target = figureeight(arm.arm.basePos.x, arm.arm.basePos.y, width/5, t, radians(45));
        arm.arm.setTarget(target);
        arm.arm.update();
        if( abs(t%TAU - 0.25*PI) < 0.05) spawnFlowers(target.x + this.p.x, target.y+this.p.y);
      }
    }
  
    update(){
      this.currentP.y = this.p.y + map(noise(frameCount/25),0,1,-height/50, height/50);
      this.currentRot =  map(noise(frameCount/50),0,1,0, PI/50);
      this.secRot = map(noise(1000 + frameCount/100),0,1,-PI/12, PI/12);
    }
  
    showArms(layer){
      let currentArms = this.arms.filter(a => a.layer === layer);
      for(let a of currentArms){
        a.arm.show();
      }
    }
   
  
    show(){
      push();
      translate(this.currentP.x, this.currentP.y);
      
      
      rotate(this.currentRot);

      this.showArms(0);
      // drawing the head
      push();
      translate(-this.carWidth*.08, - this.carHeight/4); // locate the head
      rotate(this.secRot); // draw the head
      image(head, 0, 0, this.headWidth, this.headHeight);
      pop();
      image(car, 0, 0, this.carWidth, this.carHeight);
  
      this.showArms(1);
      pop();
    }
  }