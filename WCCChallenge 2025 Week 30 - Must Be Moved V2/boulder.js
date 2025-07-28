class Boulder{
    constructor(res, r, world){
        this.pts = [];
        
        this.currentTempX = 0;
        this.currentAngle = 0;
        this.currentTempAngle = 0;
        this.r = r;
        this.easingProgress = 0;
        this.isRolling = false;
        this.startPos = null;
        this.targetPos = null;
        this.startAngle = 0;
        this.targetAngle = 0;
        
        for(let i = 0; i < res; i++){
            let a = i * TWO_PI/res;
            let nr = map(noise(cos(a), sin(a)), 0, 1, 0.9*r, 1.1*r);
            this.pts.push({x: nr*cos(a), y: nr*sin(a)});
        }
        
        this.body = Bodies.circle(0,0,r, {
            friction: 0.01,        // Much lower friction (was 0.75) - reduces resistance
            frictionAir: 0.01,      // Air resistance - lower = less drag
            restitution: 0.8,       // Higher bounce (was 0.15) - more lively
            // density: 0.1,
            mass: 10,         // Lower density = lighter = rolls easier
            isStatic: true,
        });
        
        World.add(world, this.body);
        Body.setPosition(this.body, {x: width/8, y: this.getBoulderHeight(width/8)});
        this.currentPos = {x: this.body.position.x, y: this.body.position.y};
        this.currentAngle = 0; // Initialize current angle
    }

    getBoulderHeight(x){
        return getHillY(x) - this.r + 2;
    }

    startRolling(){
        // console.log("startRolling called, isStatic:", this.body.isStatic);
        if (!this.isRolling && this.body.isStatic) {
            this.isRolling = true;
            this.easingProgress = 0;
            this.currentFrame = 0;
            
            // Calculate expected frames for this animation
            let distanceBetweenTargets = targetSize * tileSpacing;
            this.expectedFrames = Math.round(distanceBetweenTargets / currentSpeed);
            
            // Set up the easing from current position to target position
            this.startPos = {x: this.body.position.x, y: this.body.position.y};
            this.startAngle = this.currentAngle;
            
            // Calculate target position
            let targetX = this.startPos.x + step;
            let targetY = this.getBoulderHeight(targetX);
            this.targetPos = {x: targetX, y: targetY};
            this.targetAngle = this.startAngle + (step / this.r);
            
        }
    }

     update(){
        if (this.isRolling && this.body.isStatic) {
            this.currentFrame++;
            
            // Calculate progress as frame-based percentage
            this.easingProgress = constrain(this.currentFrame / this.expectedFrames, 0, 1);
            
            // console.log(`Boulder updating: frame ${this.currentFrame}/${this.expectedFrames}, progress = ${this.easingProgress.toFixed(3)}`);
            
            // Calculate eased position
            let easedProgress = easeInOutSine(this.easingProgress);
            let currentX = lerp(this.startPos.x, this.targetPos.x, easedProgress);
            let currentY = lerp(this.startPos.y, this.targetPos.y, easedProgress);
            let currentAngle = lerp(this.startAngle, this.targetAngle, easedProgress);
            
            // Update body position and angle
            Body.setPosition(this.body, {x: currentX, y: currentY});
            Body.setAngle(this.body, currentAngle);
            
            // Check if easing is complete
            if (this.easingProgress >= 1) {
                // console.log("Rolling complete!");
                // Finalize the position
                this.currentPos = {x: this.targetPos.x, y: this.targetPos.y};
                this.currentAngle = this.targetAngle;
                
                // Reset easing state
                this.easingProgress = 0;
                this.isRolling = false;
                this.currentFrame = 0;
                this.startPos = null;
                this.targetPos = null;
            }
        }
    }

    togglePhysics(){
        Body.setStatic(this.body, !this.body.isStatic);
    }

    show(){
        fill(0);
        strokeWeight(1);
        stroke("#ffc14d");
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        beginShape();
        for(let pt of this.pts){
            vertex(pt.x, pt.y);
        }
        endShape(CLOSE);
        pop();
    }
}