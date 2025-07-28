class FireFly{
    constructor(targetX, targetY, targetC){
        this.p = createVector(0,0);
        this.start = createVector(0,0);
        this.offset = random(TWO_PI);
        this.target = createVector(targetX, targetY);
        this.offset = random(TWO_PI);
        this.nXOff = random(1000);
        this.nYOff = random(1000);
        this.targetc = targetC;
        this.c = yellow;
        this.startS = random(1,sampleEvery);
        this.s = this.startS;
        this.refreshBoundingBoxes();
        
    }

    setTarget(x, y, c){
        this.targetc = c;
        this.target.set(x,y);
        
    }

    refreshBoundingBoxes(){
        this.bboxXMin = this.target.x - neighbourhood/2;
        this.bboxXMax = this.target.x + neighbourhood/2;
        this.bboxYMin = this.target.y - neighbourhood/2;
        this.bboxYMax = this.target.y + neighbourhood/2;
    }

    update(){
        // lerp the bounds of travel
        let xL = lerp(this.bboxXMin, this.target.x - 1, convergeTracker);
        let xR = lerp(this.bboxXMax, this.target.x + 1, convergeTracker);
        let yD=  lerp(this.bboxYMin, this.target.y - 1, convergeTracker);
        let yU = lerp(this.bboxYMax, this.target.y + 1, convergeTracker); 
        
        // resize
        this.s = lerp(this.startS, sampleEvery, convergeTracker);

        // locate inside bounding box
        let nx = map(noise(this.nXOff + globOffset), 0, 1, xL, xR);
        let ny = map(noise(this.nYOff + globOffset), 0, 1, yD, yU);
        this.p.set(nx, ny);

        // set colour to target colour
        this.c = lerpColor(yellow, this.targetc, convergeTracker);
    }

    show(){
        fill(this.c);
        circle(this.p.x, this.p.y, this.s);
    }
}