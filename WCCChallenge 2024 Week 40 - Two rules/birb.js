class Birb {
    constructor(x, y) {
      this.acceleration = createVector(0, 0);
      this.velocity = p5.Vector.random2D();
      this.position = createVector(x, y);
      this.colorOverride = color(255);
    //   this.maxspeed = maxSpeed;
    //   this.maxforce = maxForce;
      this.perceptionRadius = perceptionRadius;
    }
  
    run(birbs) {
      this.flock(birbs);
      this.update();
      this.borders();
      this.render();
    }

    applyColour(c){
      this.colorOverride = c;
    }
  
    applyForce(force) {
      this.acceleration.add(force);
    }
  
    flock(birbs) {
      let range = new Circle(this.position.x, this.position.y, this.perceptionRadius);
      let points = quadTree.query(range);
      let localBoids = points.map(p => p.userData);
  
      let sep = this.separate(localBoids);
      let ali = this.align(localBoids);
      let coh = this.cohesion(localBoids);
  
      sep.mult(2.5);
      ali.mult(1.0);
      coh.mult(1.0);
  
      if(params.applySeparationForce) this.applyForce(sep);
      if(params.applyAlignForce) this.applyForce(ali);
      if(params.applyCohesionForce) this.applyForce(coh);
    }
  
    update() {
      this.velocity.add(this.acceleration);
      this.velocity.limit(maxSpeed);
      this.position.add(this.velocity);
      this.acceleration.mult(0);
    }
  
    seek(target) {
      let desired = p5.Vector.sub(target, this.position);
      desired.normalize();
      desired.mult(maxSpeed);
      let steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(maxForce);
      return steer;
    }
  
    render() {
      let theta = this.velocity.heading() + radians(90);
      fill(params.applyPalette ? this.colorOverride : birbColour);
      noStroke();
      if(params.birbStroke) stroke(200);
      push();
      translate(this.position.x, this.position.y);
      rotate(theta);
      beginShape();
      vertex(0, -birbSize * 2);
      vertex(-birbSize, birbSize * 2);
      vertex(birbSize, birbSize* 2);
      endShape(CLOSE);
      pop();
    }
  
    borders() {
      if (this.position.x < -birbSize) this.position.x = width + birbSize;
      if (this.position.y < -birbSize) this.position.y = height + birbSize;
      if (this.position.x > width + birbSize) this.position.x = -birbSize;
      if (this.position.y > height + birbSize) this.position.y = -birbSize;
    }
  
    separate(birbs) {
      let steer = createVector(0, 0);
      let count = 0;
      for (let other of birbs) {
        let d = p5.Vector.dist(this.position, other.position);
        if ((d > 0) && (d < desiredSeparation)) {
          let diff = p5.Vector.sub(this.position, other.position);
          diff.normalize();
          diff.div(d);
          steer.add(diff);
          count++;
        }
      }
      if (count > 0) {
        steer.div(count);
      }
      if (steer.mag() > 0) {
        steer.normalize();
        steer.mult(maxSpeed);
        steer.sub(this.velocity);
        steer.limit(maxForce);
      }
      return steer;
    }
  
    align(birbs) {
      let sum = createVector(0, 0);
      let count = 0;
      for (let other of birbs) {
        let d = p5.Vector.dist(this.position, other.position);
        if ((d > 0) && (d < perceptionRadius)) {
          sum.add(other.velocity);
          count++;
        }
      }
      if (count > 0) {
        sum.div(count);
        sum.normalize();
        sum.mult(maxSpeed);
        let steer = p5.Vector.sub(sum, this.velocity);
        steer.limit(maxForce);
        return steer;
      } else {
        return createVector(0, 0);
      }
    }
  
    cohesion(birbs) {
      let sum = createVector(0, 0);
      let count = 0;
      for (let other of birbs) {
        let d = p5.Vector.dist(this.position, other.position);
        if ((d > 0) && (d < perceptionRadius)) {
          sum.add(other.position);
          count++;
        }
      }
      if (count > 0) {
        sum.div(count);
        return this.seek(sum);
      } else {
        return createVector(0, 0);
      }
    }
  }