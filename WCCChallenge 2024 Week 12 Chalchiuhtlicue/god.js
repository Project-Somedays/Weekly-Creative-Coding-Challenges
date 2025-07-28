class God{
    constructor(x,y){
        this.p = createVector(x,y);
        this.upperArmOffset = random(1000);
        this.lowerArmOffset = random(1000);
        this.uppperArmAngle = null;
        this.lowerArmAngle = null;
    }

    update(){
        this.uppperArmAngle = map(noise(this.upperArmOffset + frameCount/5), 0, 1, -PI/12, PI/12);
        this.lowerArmAngle = map(noise(this.lowerArmOffset + frameCount/5), 0, 1, -PI/12, PI/12);
    }
    
    show(){
        // drawing the upper arm
        imageMode(CORNER);
        push();
        translate(width/4 + godImg.width*godscale*0.1, height*0.35);
        rotate(-QUARTER_PI + this.uppperArmAngle); // because I imported the image diagonal so the corner would be at the shoulder
        image(upperArm, 0, 0, upperArm.width*godscale, upperArm.height*godscale);
        pop();
        
        // drawing the lower arm
        push();
        translate(width/4 + godImg.width*godscale*0.1, height*0.51);
        rotate(radians(-30) + this.lowerArmAngle); // because I imported the image diagonal so the corner would be at the shoulder
        image(lowerArm, 0, 0, lowerArm.width*godscale, lowerArm.height*godscale);
        pop();
        imageMode(CENTER);

        // drawing the god
        image(godImg, this.p.x, this.p.y, godImg.width*godscale, godImg.height*godscale);
    }
}

