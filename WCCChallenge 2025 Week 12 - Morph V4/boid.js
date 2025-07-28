class Boid {
    constructor(x, y) {
      this.position = createVector(x, y);
      this.velocity = p5.Vector.random2D();
      this.velocity.setMag(random(1, 3));
      this.acceleration = createVector();
      this.hue = random(255);
      this.size = random(2, 4);
      this.alpha = random(180, 255);
      this.target = createVector(width/2, height/2);
      this.id = random();
    }
    
    flock(boids) {
      let alignment = this.align(boids);
      let cohesion = this.cohesion(boids);
      let separation = this.separation(boids);
      
      // Apply flocking forces
      alignment.mult(alignStrength);
      cohesion.mult(cohesionStrength);
      separation.mult(separationStrength);
      
      this.acceleration.add(alignment);
      this.acceleration.add(cohesion);
      this.acceleration.add(separation);
    }
    
    align(boids) {
      let steering = createVector();
      let total = 0;
      
      for (let other of boids) {
        let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
        if (other != this && d < perceptionRadius) {
          steering.add(other.velocity);
          total++;
        }
      }
      
      if (total > 0) {
        steering.div(total);
        steering.setMag(maxSpeed);
        steering.sub(this.velocity);
        steering.limit(maxForce);
      }
      
      return steering;
    }
    
    cohesion(boids) {
      let steering = createVector();
      let total = 0;
      
      for (let other of boids) {
        let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
        if (other != this && d < perceptionRadius) {
          steering.add(other.position);
          total++;
        }
      }
      
      if (total > 0) {
        steering.div(total);
        steering.sub(this.position);
        steering.setMag(maxSpeed);
        steering.sub(this.velocity);
        steering.limit(maxForce);
      }
      
      return steering;
    }
    
    separation(boids) {
      let steering = createVector();
      let total = 0;
      
      for (let other of boids) {
        let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
        if (other != this && d < perceptionRadius) {
          let diff = p5.Vector.sub(this.position, other.position);
          diff.div(d * d); // Weight by inverse square of distance
          steering.add(diff);
          total++;
        }
      }
      
      if (total > 0) {
        steering.div(total);
        steering.setMag(maxSpeed);
        steering.sub(this.velocity);
        steering.limit(maxForce);
      }
      
      return steering;
    }
    
    attractToTarget() {
      
      // Vector from boid to center of rectangle
      let force = p5.Vector.sub(this.target, this.position);
      
      // Scale force based on distance
      let distance = force.mag();
      force.normalize();
      force.mult(attractionStrength);
      
      this.acceleration.add(force);
    }
    
    update() {
      this.velocity.add(this.acceleration);
      this.velocity.limit(maxSpeed);
      this.position.add(this.velocity);
      this.acceleration.mult(0);
      this.wrapEdges();
    }
    
    wrapEdges() {
      if (this.position.x > width) {
        this.position.x = 0;
      } else if (this.position.x < 0) {
        this.position.x = width;
      }
      
      if (this.position.y > height) {
        this.position.y = 0;
      } else if (this.position.y < 0) {
        this.position.y = height;
      }
    }
    
    display() {
      // Calculate display color based on attraction state
      let displayHue = this.hue;
      
      if (attractionActive) {
        let inRect = this.position.x > attractionRect.x && 
                     this.position.x < attractionRect.x + attractionRect.width && 
                     this.position.y > attractionRect.y && 
                     this.position.y < attractionRect.y + attractionRect.height;
        
        if (inRect) {
          displayHue = (this.hue + 40) % 255; // Shift hue for boids in rectangle
        }
      }
      
      // Draw boid as a small triangle in the direction of movement
      push();
      translate(this.position.x, this.position.y);
      rotate(this.velocity.heading() + PI/2);
      
      fill(displayHue, 255, 255, this.alpha);
      noStroke();
      
      // Triangle shape pointing in direction of movement
      beginShape();
      vertex(0, -this.size * 2);
      vertex(-this.size, this.size * 2);
      vertex(this.size, this.size * 2);
      endShape(CLOSE);
      
      pop();
    }
  }