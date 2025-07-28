class OrientationSmoother {
    constructor(smoothingFactor = 0.1) {
      this.currentRotation = createVector(0, 0, 0);
      this.targetRotation = createVector(0, 0, 0);
      this.smoothingFactor = smoothingFactor;
    }
    
    update(direction) {
      // Calculate target rotation from direction vector
      this.targetRotation.x = atan2(direction.y, sqrt(direction.x * direction.x + direction.z * direction.z));
      this.targetRotation.y = atan2(-direction.x, -direction.z);
      
      // Smooth the rotation using lerp
      this.currentRotation.x = lerp(this.currentRotation.x, this.targetRotation.x, this.smoothingFactor);
      this.currentRotation.y = lerp(this.currentRotation.y, this.targetRotation.y, this.smoothingFactor);
      
      return this.currentRotation;
    }
  }