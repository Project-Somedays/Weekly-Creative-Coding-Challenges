// from ChatGPT

class Segment {
    constructor(x, y, angle, len, colour,weight) {
      this.a = createVector(x, y);
      this.angle = angle;
      this.len = len;
      this.b = createVector();
      this.calculateB();
      this.colour = colour;
      this.weight = weight;
    }
    
    calculateB() {
      this.b.x = this.a.x + this.len * cos(this.angle);
      this.b.y = this.a.y + this.len * sin(this.angle);
    }
    
    setPosition(x, y) {
      this.a.set(x, y);
      this.calculateB();
    }
    
    follow(tx, ty) {
      let target = createVector(tx, ty);
      let dir = p5.Vector.sub(target, this.a);
      this.angle = dir.heading();
      dir.setMag(this.len);
      dir.mult(-1);
      this.a = p5.Vector.add(target, dir);
      this.calculateB();
    }
    
    update() {
      this.calculateB();
    }
    
    show() {
      stroke(this.colour);
      strokeWeight(this.weight);
      line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
  }