// Thanks Claude.ai for the clever maths!

class Segment {
  constructor(a, len, thickness) {
    this.a = a;
    this.len = len;
    this.b = p5.Vector.add(a, p5.Vector.random3D().mult(len));
    this.thickness = thickness; // Diameter of the cylinder
  }
  
  setA(pos) {
    this.a = pos.copy();
  }
  
  setB(pos) {
    this.b = pos.copy();
  }
  
  show() {
    push();
    
    // Calculate the midpoint between a and b
    let mid = p5.Vector.add(this.a, this.b).mult(0.5);
    
    // Move to the midpoint
    translate(mid.x, mid.y, mid.z);
    
    // Calculate the rotation axis and angle
    let dir = p5.Vector.sub(this.b, this.a);
    let axis = createVector(0, 1, 0).cross(dir);
    let angle = acos(createVector(0, 1, 0).dot(dir.normalize()));
    
    // Apply the rotation
    rotate(angle, axis);
    
    // Draw the cylinder
    normalMaterial(); // or use fill() for a solid color
    // specularMaterial(255);
    cylinder(this.thickness / 2, this.len);
    
    pop();
  }
}