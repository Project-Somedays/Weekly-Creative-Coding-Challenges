class HouseSpider{
    constructor(x,y,a, speed){
        this.p = createVector(x,y);
        this.speed = speed;
        this.a = a;
        this.v = p5.Vector.fromAngle(this.a).setMag(this.speed);
        this.dirOffset = random(10000);
        this.yA = -HALF_PI;
        this.houseImg = imgHouse;
        this.walkAOffset = random(1000);
        this.tipOffsets = [];
        
        for(let i = 0; i < 8; i ++){
            this.tipOffsets.push(random(1000));
        }
        
        // angular spacing of the legs
        this.legOffsets = [];
        for(let i = 0; i < 4; i ++){
            this.legOffsets.push(-0.8*PI/3 + i*0.8*PI/4);
        }
        
        // randomness of the legs
        this.noiseAOffsets = [];
        for(let i = 0; i < 4; i ++){
            this.noiseAOffsets.push(random(1000));
        }
    }

    updatePos(){
        let newTravelAngle = map(noise(this.dirOffset + frameCount),0,1,-PI/50, PI/50) + this.v.heading();
        this.v = p5.Vector.fromAngle(newTravelAngle).setMag(this.speed);
        
        this.p.add(this.v);
    }

    updateWalk(){
        this.walkAOffset += walkCycleSpeed;
    }

    updateDangle(){
        // move the legs along
        this.yA += dangleCycleSpeed;
        this.p.y = dangleMagFraction*height*easeInOutQuint(sin(this.yA));
        for(let i = 0; i < 4; i++){
            this.noiseAOffsets[i] += noiseAOffsetSpeed*2;
        }
        for(let i = 0; i < 8; i++){
            this.tipOffsets[i] += noiseAOffsetSpeed*2;
        }
    }
    

    show(isWalking){
        // draw legs
        if(isWalking){
            this.drawLegsWalking()
        } else{
            this.drawLegsDangling()
        }
        // draw body
        push();
            translate(this.p.x, this.p.y);
            // if(isWalking) rotate(-HALF_PI);
            image(this.houseImg, -scaleToWindowWidthFactor*this.houseImg.width/2,-scaleToWindowWidthFactor*this.houseImg.height/2, scaleToWindowWidthFactor*this.houseImg.width, scaleToWindowWidthFactor*this.houseImg.height);
        pop();  
    }

    drawLeg(baseOffset,tipOffset, isFlippedX){
        push();
            translate(this.p.x, this.p.y);
            // rotate(this.a + baseOffset);
            rotate(baseOffset);
            if(isFlippedX) scale(-1,1);
            translate(0.95*scaleToWindowWidthFactor*imgLegBase.width, 10*scaleToWindowWidthFactor); // go to the end of the leg, correting for misalignment
            rotate(tipOffset); // rotate at the end of the base segment
            image(imgLegTip,0,0,scaleToWindowWidthFactor*imgLegTip.width, scaleToWindowWidthFactor*imgLegTip.height); // draw tip
            rotate(-tipOffset); // rotate back
            translate(-0.95*scaleToWindowWidthFactor*imgLegBase.width, -10*scaleToWindowWidthFactor); // go back to the base of the base segment
            image(imgLegBase,0,0,scaleToWindowWidthFactor*imgLegBase.width, scaleToWindowWidthFactor*imgLegBase.height); // draw the base
        pop();        
    }

    drawLegsWalking(){
        for(let i = 0; i < 4; i++){
            // if even
            let rightLegOffset = this.legOffsets[i];
            let leftLegOffset = this.legOffsets[i];
            if(i % 2 === 0){
                rightLegOffset -= PI/12*abs(sin(this.walkAOffset));
                leftLegOffset -= PI/12*abs(sin(this.walkAOffset + HALF_PI));
                
            } else {
                rightLegOffset -=  PI/12*abs(sin(this.walkAOffset  + HALF_PI));
                leftLegOffset -= PI/12*abs(sin(this.walkAOffset));
            }
            this.drawLeg(rightLegOffset,PI/12/2, false);
            this.drawLeg(leftLegOffset, PI/12/2, true);
        }
    }

    drawLegsDangling(){
        for(let i = 0; i < 4; i++){
            let noiseA = map(noise(this.noiseAOffsets[i]),0,1,-PI/12,PI/12);
            let baseOffset = this.legOffsets[i] + noiseA;
            let tipROffset = map(noise(this.tipOffsets[2*i]),0,1,0,PI/3);
            let tipLOffset = map(noise(this.tipOffsets[2*i+1]),0,1,0,PI/3);
            
            push();
                this.drawLeg(baseOffset, tipROffset, false);
                this.drawLeg(baseOffset, tipLOffset, true);
            pop();
        }
    }
}