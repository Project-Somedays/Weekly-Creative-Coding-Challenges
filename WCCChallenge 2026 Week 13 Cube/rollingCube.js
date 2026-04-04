class RollingCube {
  constructor(zOff, startIndex, delay) {
    this.colour = random(currentPalette);
    this.steps = 0;
    this.zOff = zOff * sSize;
    this.startIndex = startIndex; // This is their starting spot on the track
    this.delay = delay; 
    this.a = 0; 
    
    this.offset = ((stepLim - 1) * sSize) / 2;
  }
  
  update() {
    let localFrame = frameCount - this.delay;

    if (localFrame >= 0) {
      let localT = (localFrame % frames) / frames;

      if (localFrame % frames === 0 && localFrame > 0) {
        this.steps++;
      }
      
      this.a = params.easingFn(localT) * HALF_PI;
    }
  }

  
  show() {
    push();
    
    // THE MAGIC MATH:
    // 1. Where are we on the global wrap-around track?
    let currentPos = this.startIndex + this.steps;
    
    // 2. Which side of the 4 faces are we currently on?
    let side = floor(currentPos / (stepLim - 1)) % 4;
    
    // 3. Where are we relative to the start of THAT specific side?
    let localXIndex = currentPos % (stepLim - 1);
    
    // Rotate the world to the correct face
    rotateZ(side * HALF_PI);
    translate(0, -this.offset, 0);
    
    // Move to the local X position on this face
    let currentX = -this.offset + (localXIndex * sSize);
    translate(currentX, 0, this.zOff); 
    
    // Execute the bounce roll!
    translate(sSize / 2, sSize / 2, 0);
    rotateZ(this.a);
    translate(-sSize / 2, -sSize / 2, 0);
    
    fill(this.colour);
    box(sSize * 0.9);
    
    pop();
  }
}