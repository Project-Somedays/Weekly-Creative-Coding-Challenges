// from ChatGPT

class Segment {
  constructor(x, y, z, len, weight) {
    this.a = createVector(x, y, z);  // Start point
    this.len = len;               // Length of the segment
    this.b = createVector(x + len, y+len, z);      // End point, initially empty
    this.update();                // Calculate initial position of b
    this.weight = weight;
  }
  
  setPosition(x,y, z){
    this.a.set(x,y, z);
  }

  update() {
    // Recalculate the end point `b` based on `a` and `dir`
    let dir = p5.Vector.sub(this.b, this.a).normalize().mult(this.len);
    this.b = p5.Vector.add(this.a, dir);
  }

  follow(target) {
    // Calculate the direction from the start point `a` to the target
    let dir = p5.Vector.sub(target, this.a).normalize().mult(this.len);

    // Set the new start point `a` by subtracting the scaled direction vector from the target
    this.a = p5.Vector.sub(target, dir);
    
    // The end point `b` is directly at the target in this follow mode
    this.b = target.copy();
  }

  show() {
    // stroke(255);
    strokeWeight(this.weight);
    line(this.a.x, this.a.y, this.a.z, this.b.x, this.b.y, this.b.z);
    // let middle = p5.Vector.lerp(this.a, this.b, 0.5);
    // push();
    //   translate(middle.x, middle.y, middle.z);
    //   sphere(this.weight);
    // pop();
  }
}