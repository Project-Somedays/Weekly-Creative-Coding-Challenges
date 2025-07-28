class Boid {
    constructor(type) {
      this.position = createVector(
        random(-worldSize/2, worldSize/2),
        random(-worldSize/2, worldSize/2),
        random(-worldSize/2, worldSize/2)
      );
      this.velocity = p5.Vector.random3D();
      this.velocity.setMag(random(2, 4)); 
      this.acceleration = createVector();
      this.maxForce = worldSize * 0.0005;
      this.maxSpeed = worldSize * 0.005;
      this.size = worldSize * 0.0075;
      this.type = type;
      this.color = COLORS[type];
      this.conversionCooldown = 0;  // Cooldown timer for conversions
      this.currentRotation = createVector(0,0,0);
      this.targetRotation = createVector(0,0,0);
    }

    updateRotation(){
      let direction = this.velocity.copy().normalize();
      this.targetRotation.x = atan2(direction.y, sqrt(direction.x**2 + direction.z**2));
      this.targetRotation.y = atan2(-direction.x, -direction.z);
    
      // Smooth the rotation using lerp
      this.currentRotation.x = lerp(this.currentRotation.x, this.targetRotation.x, smoothingFactor);
      this.currentRotation.y = lerp(this.currentRotation.y, this.targetRotation.y, smoothingFactor);

    }
    
    checkConversion(octree) {
      if (this.conversionCooldown > 0) {
        this.conversionCooldown--;
        return;
      }
      
      let conversionRadius = this.size * 5;  // Distance needed for conversion
      let nearby = octree.query(new Box(
        this.position.x - conversionRadius,
        this.position.y - conversionRadius,
        this.position.z - conversionRadius,
        conversionRadius * 2,
        conversionRadius * 2,
        conversionRadius * 2
      ));
      
      for (let other of nearby) {
        if (other !== this && HUNTS[this.type].includes(other.type)) {
          let d = dist(
            this.position.x, this.position.y, this.position.z,
            other.position.x, other.position.y, other.position.z
          );
          
          if (d < conversionRadius) {
            // Convert the prey to predator's type
            other.convert(this.type);
            this.conversionCooldown = postConversionCooldownFrames;  // Add cooldown before next conversion
            break;  // Only convert one at a time
          }
        }
      }
    }
    
    convert(newType) {
      this.type = newType;
      this.color = COLORS[newType];
      // Add a small "boost" when converted to help it join its new group
      // this.velocity.add(p5.Vector.random3D().mult(this.maxSpeed * 0.5));
    }
    
    edges() {
      let halfWorld = worldSize / 2;
      if (this.position.x > halfWorld) this.position.x = -halfWorld;
      else if (this.position.x < -halfWorld) this.position.x = halfWorld;
      if (this.position.y > halfWorld) this.position.y = -halfWorld;
      else if (this.position.y < -halfWorld) this.position.y = halfWorld;
      if (this.position.z > halfWorld) this.position.z = -halfWorld;
      else if (this.position.z < -halfWorld) this.position.z = halfWorld;
    }
    
    adjustToNewWorldSize() {
      this.position.mult(worldSize / (min(windowWidth, windowHeight) * 0.8));
      this.maxForce = worldSize * 0.0005;
      this.maxSpeed = worldSize * 0.01;
      this.size = worldSize * 0.005;
    }
    
    hunt(boids) {
      let perceptionRadius = worldSize * 0.15;
      let steering = createVector();
      let total = 0;
      let closestDist = perceptionRadius;
      let closestBoid = null;
      
      for (let other of boids) {
        if (HUNTS[this.type].includes(other.type)) {
          let d = dist(
            this.position.x, this.position.y, this.position.z,
            other.position.x, other.position.y, other.position.z
          );
          if (d < perceptionRadius && d < closestDist) {
            closestDist = d;
            closestBoid = other;
          }
        }
      }
      
      if (closestBoid) {
        let diff = p5.Vector.sub(closestBoid.position, this.position);
        diff.normalize();
        steering = diff.mult(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce * 2);
      }
      
      return steering;
    }
    
    flee(boids) {
      let perceptionRadius = worldSize * 0.15;
      let steering = createVector();
      let total = 0;
      
      for (let other of boids) {
        if (FLEES_FROM[this.type].includes(other.type)) {
          let d = dist(
            this.position.x, this.position.y, this.position.z,
            other.position.x, other.position.y, other.position.z
          );
          if (d < perceptionRadius) {
            let diff = p5.Vector.sub(this.position, other.position);
            diff.div(d);  // Weight by distance
            steering.add(diff);
            total++;
          }
        }
      }
      
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce * 2);
      }
      return steering;
    }
    
    align(boids) {
      let perceptionRadius = worldSize * 0.1;
      let steering = createVector();
      let total = 0;
      for (let other of boids) {
        if (other.type === this.type) { //own type only
          let d = dist(
            this.position.x, this.position.y, this.position.z,
            other.position.x, other.position.y, other.position.z
          );
          if (other != this && d < perceptionRadius) {
            steering.add(other.velocity);
            total++;
          }
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      return steering;
    }
    
    cohesion(boids) {
      let perceptionRadius = worldSize * 0.1;
      let steering = createVector();
      let total = 0;
      for (let other of boids) {
        if (other.type === this.type) {
          let d = dist(
            this.position.x, this.position.y, this.position.z,
            other.position.x, other.position.y, other.position.z
          );
          if (other != this && d < perceptionRadius) {
            steering.add(other.position);
            total++;
          }
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.sub(this.position);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      return steering;
    }
    
    separation(boids) {
      let perceptionRadius = worldSize * 0.1;
      let steering = createVector();
      let total = 0;
      for (let other of boids) {
        let d = dist(
          this.position.x, this.position.y, this.position.z,
          other.position.x, other.position.y, other.position.z
        );
        if (other != this && d < perceptionRadius) {
          let diff = p5.Vector.sub(this.position, other.position);
          diff.div(d * d);
          steering.add(diff);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      return steering;
    }
    
    flock(octree) {
      let nearby = octree.query(new Box(
        this.position.x - worldSize * 0.15,
        this.position.y - worldSize * 0.15,
        this.position.z - worldSize * 0.15,
        worldSize * 0.3,
        worldSize * 0.3,
        worldSize * 0.3
      ));
      
      let alignment = this.align(nearby);
      let cohesion = this.cohesion(nearby);
      let separation = this.separation(nearby);
      let hunting = this.hunt(nearby);
      let fleeing = this.flee(nearby);
      
      alignment.mult(1.0);
      cohesion.mult(1.0);
      separation.mult(1.2);
      hunting.mult(1.5);
      fleeing.mult(2.0);
      
      this.acceleration.add(alignment);
      this.acceleration.add(cohesion);
      this.acceleration.add(separation);
      this.acceleration.add(hunting);
      this.acceleration.add(fleeing);
    }
    
    update() {
      // let currentRotation = createVector(this.rotation.x, this.rotation.y, this.rotation.z);
      
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.acceleration.mult(0);
      this.updateRotation();
    }
    
    show() {
      push();
      translate(this.position.x, this.position.y, this.position.z);
      rotateZ(PI);
      // rotateY(PI);
      rotateX(this.currentRotation.x);
      rotateY(this.currentRotation.y);
      rotateZ(this.currentRotation.z);
      fill(this.color);
      model(MODEL2TYPE[this.type]);
      pop();
    }
  }