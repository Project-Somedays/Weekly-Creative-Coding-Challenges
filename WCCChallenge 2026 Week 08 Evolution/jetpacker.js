class Jetpacker{
    constructor(){
        this.y = height/2;
        this.x = 0;
        this.vx = random(3, 6);
        this.vy = 1;
        this.geneticSequence = [];
        for(let i = 0; i < 100; i++){
            this.geneticSequence.push(random() < 0.5); // start with a completely random sequence
        }
        this.fuel = width;
        this.isAlive = true;
        this.poseIndex = random([0,1,2]); // choose a random starting pose
        this.poseSet = poses_thrust;
        this.deathPose = pose_dead_ceiling;
    }

    update(){
        if(!this.isAlive) return;
        let sequenceStep = floor(this.x / 40) % genSequenceLength
        if(this.geneticSequence[sequenceStep]){
            this.poseSet = poses_thrust;
            this.thrust();
        } else{
            this.poseSet = poses_fall;
        }
        this.poseIndex =  (this.poseIndex + 1)%(this.poseSet.length); // increment the pose
        this.vy -= grav;
        constrain(this.vy, -10, 10);
        this.y -= this.vy;
        this.x += this.vx;
        let x = floor(this.x);
        // must be between the bounds of the cave and still on the screen
        this.isAlive = this.y > caveSystem.getY(x).y && this.y < caveSystem.getY(x).z && this.x < width ;
        if(!this.isAlive){
            deaths ++;
            if(this.y > caveSystem.getY(x).y){
                this.deathPose = pose_dead_floor;
            } else{
                this.deathPose = pose_dead_ceiling;
            }
        }
        
    }

    thrust(){
        if(this.fuel <= 0) return; // do nothing if we run out of fuel
        this.vy += thrustStrength;
        this.fuel --; // expend a fuel for each frame you're thrusting
    }

    show(){
        push();
        translate(this.x, this.y);
        // circle(0,0,10);
        if(this.isAlive){
            image(this.poseSet[this.poseIndex], 0,0, 0.075*height, 0.075*height);
        } else{
            image(this.deathPose, 0,0, 0.075*height, 0.075*height);

        }
        
        pop();
    }
}