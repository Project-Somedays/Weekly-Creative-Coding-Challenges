class Mover {
  constructor(x, y, col) {
    this.p = createVector(x, y);
    this.v = createVector(random(-2, 2), random(-2, 2));
    this.a = createVector(0, 0); // Acceleration
    this.highlight = false;
    this.color = col;
  }

  update(bounceOn, repulsionOn) {
    if (repulsionOn) {
      this.v.add(this.a);
      this.v.limit(6); 
    }
    
    this.p.add(this.v);
    this.a.mult(0); 

    if(!bounceOn) return;
    
    // Bounce off walls (using dynamic diameter so they don't sink into walls)
    let r = params.moverDiameter / 2;
    if (this.p.x < r || this.p.x > width - r) this.v.x *= -1;
    if (this.p.y < r || this.p.y > height - r) this.v.y *= -1;
  }

  intersects(other) {
    let d = p5.Vector.dist(this.p, other.p);
    
    // The sum of two identical radii (d/2 + d/2) is just the diameter!
    let minDist = params.moverDiameter; 
    
    if (d < minDist + 2) { 
      if (d > 0) { 
        let strength = map(d, 0, minDist + 2, params.repulsionStrength, 0, true); 
        let force = p5.Vector.sub(this.p, other.p).normalize().mult(strength);
        this.a.add(force);
      }
      return true; 
    }
    return false;
  }

  show(cnv) {
    cnv.noFill();
    cnv.stroke(200, 50); 
    cnv.circle(this.p.x, this.p.y, params.moverDiameter);
  }
}