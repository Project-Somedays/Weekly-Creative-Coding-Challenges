class FireFly{
    constructor(targetX, targetY, targetColour){
        this.p = createVector(targetX,targetY);
        this.start = createVector(0,0);
        this.offset = random(TWO_PI);
        this.target = createVector(targetX, targetY);
        this.startTarget = this.target.copy();
        this.offset = random(TWO_PI);
        this.nXOff = random(1000);
        this.nYoff = random(1000);
        this.targetColour = targetColour;
        this.c = yellow;
        this.startS = random(1,sampleEvery);
        this.s = this.startS;
        this.boundingBoxSize = neighbourhood;
    }

    setTarget(x, y, c){
        this.targetColour = c;
        this.target.set(x,y);
        this.startTarget.set(x,y);
    }

    

    update(newTarget){
        // lerp the bounds of travel

        this.boundingBoxSize = lerp(neighbourhood, 1, convergeTracker)
        this.target.set(
            lerp(this.startTarget.x, newTarget.x, transitionTracker),
            lerp(this.startTarget.y, newTarget.y, transitionTracker));
        // resize
        this.s = lerp(this.startS, sampleEvery, convergeTracker);

        // locate inside bounding radius
        let nx = map(noise(this.nXOff + globOffset), 0, 1, -this.boundingBoxSize/2, this.boundingBoxSize/2);
        let ny = map(noise(this.nYoff + globOffset), 0, 1, -this.boundingBoxSize/2, this.boundingBoxSize/2);
        this.p.set(this.target.x + nx, this.target.y + ny);

        // set colour to target colour
        this.c = lerpColor(yellow, this.targetColour, convergeTracker);
    }

    show(){
        fill(this.c);
        circle(this.p.x, this.p.y, this.s);
    }
}