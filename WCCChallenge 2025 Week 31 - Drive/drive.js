class DrivingBiz{
    constructor(x,y, driveWidth, driveLength, img, isTrailer, angularFriction = 0, startingHealth = 100){
        this.p = createVector(x, y);
        this.bodyWidth = driveWidth;
        this.bodyLength = driveLength;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = maxSpeed;
        this.turnSpeed = 0.2; // quadrupled because it was PAINFULLY understeering
        this.linearFriction = 0.98;
        this.angularFriction = angularFriction;
        this.hitchPos = createVector();
        this.hitchDistanceMultiplier = 0.6;
        this.img = img;
        this.isTrailer = isTrailer;
        this.isJackknifed = false;
        this.isAccelerating = false;
        this.health = startingHealth;
        this.isDrivingForward = true;
        this.isDestroyed = false;
        this.turningDir = 0;
    }

    calculateHitchPoint(){
    if (this.isTrailer) {
        // Trailer hitch is at the front of the trailer
        let hitchDistance = this.bodyLength / 2;
        this.hitchPos.set(
            this.p.x + hitchDistance * cos(this.angle),
            this.p.y + hitchDistance * sin(this.angle)
        );
    } else {
        // Car hitch is behind the car (negative direction)
        let hitchDistance = this.hitchDistanceMultiplier * this.bodyLength;
        this.hitchPos.set(
            this.p.x - hitchDistance * cos(this.angle),
            this.p.y - hitchDistance * sin(this.angle)
        );
    }
    return this.hitchPos;
}

checkCollision(hitbox) {
    // Calculate vehicle's bounding box (simplified rectangular collision)
    let vehicleLeft = this.p.x - this.bodyWidth * hitBoxOverlap;
    let vehicleRight = this.p.x + this.bodyWidth * hitBoxOverlap;
    let vehicleTop = this.p.y - this.bodyLength * hitBoxOverlap;
    let vehicleBottom = this.p.y + this.bodyLength * hitBoxOverlap;
    
    // Calculate hitbox bounds
    let hitboxLeft = hitbox.x - hitbox.w * hitBoxOverlap;
    let hitboxRight = hitbox.x + hitbox.w * hitBoxOverlap;
    let hitboxTop = hitbox.y - hitbox.h * hitBoxOverlap;
    let hitboxBottom = hitbox.y + hitbox.h * hitBoxOverlap;
    
    // Check for overlap (rectangles intersect if they DON'T completely miss each other)
    return !(vehicleRight < hitboxLeft ||   // vehicle is completely to the left
             vehicleLeft > hitboxRight ||   // vehicle is completely to the right
             vehicleBottom < hitboxTop ||   // vehicle is completely above
             vehicleTop > hitboxBottom);    // vehicle is completely below
}

// Check specific collisions
isOnBoatRamp() {
    return this.checkCollision(hitBoatRamp);
}

isInWater() {
    return this.checkCollision(hitWater);
}

isInTargetWater() {
    return this.checkCollision(hitTargetWater);
}


   // Fixed update method in DrivingBiz class
// Fixed update method in DrivingBiz class
// Fixed update method in DrivingBiz class
update(){
    // STEP 1: Is destroyed?
    this.isDestroyed = this.health <= 0;
    if(this.isDestroyed){
        showEndScreen(imgTooMuchDamage);
        return;
    }
    
    // STEP 2: Handle Jack-knifed Position
    if (this.isJackknifed) {
        this.speed = 0;
        showEndScreen(imgJackKnifed);
        return;
    }

    // STEP 3: Handle car movement
    if(!this.isAccelerating){
        this.speed *= this.linearFriction;
        if (Math.abs(this.speed) < 0.1) this.speed = 0;
    } else {
        let dir = this.isDrivingForward ? 1 : -1;
        let maxForwardSpeed = this.maxSpeed;
        let maxReverseSpeed = -this.maxSpeed * 0.5;
        
        // Apply acceleration
        this.speed += dir * 0.1;
        
        // Apply speed limits based on direction
        if (this.isDrivingForward) {
            this.speed = Math.min(this.speed, maxForwardSpeed);
        } else {
            this.speed = Math.max(this.speed, maxReverseSpeed);
        }
    }
    
    // STEP 4: Apply proper car steering physics (Ackermann steering)
    if (abs(this.speed) > 0.1 && this.turningDir !== 0) {
        // Distance from center to front axle (where steering happens)
        let wheelbase = 0.25 * this.bodyLength;
        
        // Calculate turning radius based on front wheel steering
        let steeringAngle = this.turnSpeed * this.turningDir;
        let turningRadius = wheelbase / tan(steeringAngle);
        
        // Calculate angular velocity based on speed and turning radius
        let angularVelocity = this.speed / turningRadius;
        
        // Reverse steering direction when backing up
        if (this.speed < 0) {
            angularVelocity *= -1;
        }
        
        this.angle += angularVelocity;
    }

    // STEP 5: Update car position
    this.p.x += this.speed * cos(this.angle);
    this.p.y += this.speed * sin(this.angle);

    // STEP 6: Keep car within canvas bounds
    this.blockDrivingOffScreen()
}

    blockDrivingOffScreen(){
        if (this.p.x < 0) this.p.x = 0;
        if (this.p.x > width) this.p.x = width;
        if (this.p.y < 0) this.p.y = 0;
        if (this.p.y > height) this.p.y = height;
    }


    show(){
        push();
        translate(this.p.x, this.p.y);
        rotate(this.angle);
        image(this.img, 0, 0, this.bodyLength, this.bodyLength * this.img.height / this.img.width);
        pop();
    }
}

// Trailer physics function
function updateTrailer() {
    // Calculate car's hitch point
    let carHitch = car.calculateHitchPoint();
    
    // Calculate where the trailer center should be to keep its hitch at the car's hitch
    let trailerCenterX = carHitch.x - (trailer.bodyLength / 2) * cos(trailer.angle);
    let trailerCenterY = carHitch.y - (trailer.bodyLength / 2) * sin(trailer.angle);
    
    trailer.p.set(trailerCenterX, trailerCenterY);
    
    // Only update trailer angle based on the angle difference between car and trailer
    if (abs(car.speed) > 0.1) {
        // Calculate angle difference between car and trailer
        let angleDiff = car.angle - trailer.angle;
        
        // Normalize angle difference to [-PI, PI]
        while (angleDiff > PI) angleDiff -= 2 * PI;
        while (angleDiff < -PI) angleDiff += 2 * PI;
        
        // Calculate trailer angular velocity based on:
        // 1. The angle difference (more difference = more rotation)
        // 2. The car's speed (faster = more responsive)
        // 3. The trailer length (longer trailer = less responsive)
        let trailerLength = trailer.bodyLength / 2;
        let angularVelocity = (angleDiff * abs(car.speed)) / (trailerLength * 2);
        
        // Apply speed-dependent responsiveness
        let responsiveness = map(abs(car.speed), 0, car.maxSpeed, 0.1, 0.5);
        
        // Reverse the effect when backing up (backing up amplifies the effect)
        if (car.speed < 0) {
            angularVelocity *= -1.5; // Backing up makes trailer more sensitive
        }
        
        trailer.angle += angularVelocity * responsiveness;
    }
    
    // Check for jackknifing
    detectJackKnife(car, trailer);
}

function detectJackKnife(car, trailer) {
    // Calculate angle difference between car and trailer
    let carTrailerAngleDiff = car.angle - trailer.angle;
    
    // Normalize angle difference to [-PI, PI]
    if (carTrailerAngleDiff > PI) carTrailerAngleDiff -= 2 * PI;
    if (carTrailerAngleDiff < -PI) carTrailerAngleDiff += 2 * PI;
    
    // Check if jackknifed (angle difference too large)
    if (abs(carTrailerAngleDiff) > JACKKNIFE_ANGLE_THRESHOLD) {
        car.isJackknifed = true;
        trailer.isJackknifed = true;
    } else {
        car.isJackknifed = false;
        trailer.isJackknifed = false;
    }
}

// function detectJackKnife(car, trailer){
//     // 1. Vector from trailer hitch to car hitch
//     let d = p5.Vector.dist(car.p, trailer.p);
//     let angleToCarHitch = atan2(car.hitchPos.y - trailer.p.y, car.hitchPos.x - trailer.p.x);
//     let angleDiff = angleToCarHitch - trailer.angle;
    
//     // 2. Angular alignment (trailer trying to point towards the car's hitch)
//     if (angleDiff > PI) angleDiff -= 2 * Math.PI;
//     if (angleDiff < PI) angleDiff += 2 * Math.PI;

//     // --- Jack-knifing Detection ---
//     // Using the angle difference between car and trailer to detect jack-knife
//     const carTrailerAngleDiff = car.angle - trailer.angle;
//     let normalizedCarTrailerAngleDiff = carTrailerAngleDiff;
//     if (normalizedCarTrailerAngleDiff > Math.PI) normalizedCarTrailerAngleDiff -= 2 * Math.PI;
//     if (normalizedCarTrailerAngleDiff < -Math.PI) normalizedCarTrailerAngleDiff += 2 * Math.PI;
// }
