// Thanks Claude.ai for the clever maths!

class Segment {
    constructor(a, len, thickness, col, isNormalMaterial = true) {
      this.a = a;
      this.len = len;
      this.b = p5.Vector.add(a, p5.Vector.random3D().mult(len));
      this.thickness = thickness; // Diameter of the cylinder
      this.col = col;
      this.isNormalMaterial = isNormalMaterial;
    }
    
    setA(pos) {
      this.a = pos.copy();
    }
    
    setB(pos) {
      this.b = pos.copy();
    }

    setLength(newLength){
      this.len = newLength;
    }

    setThickness(newThickness){
      this.thickness = newThickness;
    }

    setCol(newCol){
      this.col = newCol
    }

    setNormalMaterialState(isNormalMaterialState){
      this.isNormalMaterial = isNormalMaterialState;
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
      fill(this.col);
      if(this.isNormalMaterial) normalMaterial(); 
    
      cylinder(this.thickness / 2, this.len);
      
      pop();
    }
  }