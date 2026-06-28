// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x, y, sepCol, alignCol, cohCol) {
    this.acceleration = createVector(0, 0);
    this.velocity = p5.Vector.random2D();
    this.position = createVector(x, y);
    this.r = r;
    this.maxspeed = 3;    // Maximum speed
    this.maxforce = 0.05; // Maximum steering force
	 this.desiredseparation = desiredseparation;
	 this.sepCol = sepCol;
	 this.alignCol = alignCol;
	 this.cohCol = cohCol;
  }
  
  Boid.prototype.run = function(boids) {
    this.flock(boids);
    this.update();
    // this.borders();
	  
    // this.render();
  }
  
  Boid.prototype.applyForce = function(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  }
  
  // We accumulate a new acceleration each time based on three rules
  Boid.prototype.flock = function(boids) {
    let sep = this.separate(boids);   // Separation
    let ali = this.align(boids);      // Alignment
    let coh = this.cohesion(boids);   // Cohesion
    // Arbitrarily weight these forces
    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);
    // Add the force vectors to acceleration
    // show the force vectors
    showForceVector(this.sepCol,this.position,sep);
    showForceVector(this.aliCol,this.position,ali);
    showForceVector(this.cohCol,this.position,coh);
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }
  
  // Method to update location
  Boid.prototype.update = function() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelertion to 0 each cycle
    this.acceleration.mult(0);
  }
  
  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  Boid.prototype.seek = function(target) {
    let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);  // Limit to maximum steering force
    return steer;
  }
  
  Boid.prototype.render = function() {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.velocity.heading() + radians(90);
    fill(127);
    stroke(200);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
  }
  
  // Wraparound
  Boid.prototype.borders = function() {
    if (this.position.x < -this.r)  this.position.x = width + this.r;
    if (this.position.y < -this.r)  this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
  }
  
  // Separation
  // Method checks for nearby boids and steers away
  Boid.prototype.separate = function(boids) {
    this.desiredseparation = desiredseparation*getDesiredSeparation(this.position.x, this.position.y);
    let steer = createVector(0, 0);
    let count = 0;
    // For every boid in the system, check if it's too close
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position,boids[i].position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < this.desiredseparation)) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.position, boids[i].position);
        diff.normalize();
        diff.div(d);        // Weight by distance
        steer.add(diff);
        count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }
  
    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }

    return steer;
  }
  
  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  Boid.prototype.align = function(boids) {
    let align;
    let sum = createVector(0,0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position,boids[i].position);
      if ((d > 0) && (d < los)) {
        sum.add(boids[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      align = steer;
    } else {
      align = createVector(0, 0);
    }
    return align;
  }
  
  // Cohesion
  // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
  Boid.prototype.cohesion = function(boids) {
    let coh;
    let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position,boids[i].position);
      if ((d > 0) && (d < los)) {
        sum.add(boids[i].position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      coh = this.seek(sum);  // Steer towards the location
    } else {
      coh = createVector(0, 0);
    }
    return coh;
  }