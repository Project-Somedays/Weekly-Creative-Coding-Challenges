class Arm {
    constructor(anchorPoint, segmentCount, segmentLength, segThick) {
      this.anchorPoint = anchorPoint;
      this.segments = [];
      this.totalLength = 0;
      this.segThick = segThick;
      
      let pos = createVector(anchorPoint.x, anchorPoint.y, anchorPoint.z);
      for (let i = 0; i < segmentCount; i++) {
        this.segments.push(new Segment(pos.copy(), segmentLength, segThick));
        pos.add(p5.Vector.random3D().mult(segmentLength));
        this.totalLength += segmentLength;
      }
    }
    
    getEndPos(){
        return this.segments[this.segments.length - 1].b.copy();
      }

    reach(target) {
      let positions = this.segments.map(seg => seg.a);
      positions.push(this.segments[this.segments.length - 1].b);
      
      // Check if the target is reachable
      if (p5.Vector.dist(this.anchorPoint, target) > this.totalLength) {
        // If not reachable, extend the chain as far as possible
        let direction = p5.Vector.sub(target, this.anchorPoint).normalize();
        for (let i = 0; i < positions.length; i++) {
          positions[i] = p5.Vector.add(this.anchorPoint, p5.Vector.mult(direction, i * this.segments[0].len));
        }
      } else {
        // FABRIK algorithm
        const iterations = 10;
        for (let iteration = 0; iteration < iterations; iteration++) {
          // Forward reaching
          positions[positions.length - 1] = target;
          for (let i = positions.length - 2; i >= 0; i--) {
            let dir = p5.Vector.sub(positions[i], positions[i + 1]).normalize();
            positions[i] = p5.Vector.add(positions[i + 1], p5.Vector.mult(dir, this.segments[0].len));
          }
          
          // Backward reaching
          positions[0] = this.anchorPoint;
          for (let i = 1; i < positions.length; i++) {
            let dir = p5.Vector.sub(positions[i], positions[i - 1]).normalize();
            positions[i] = p5.Vector.add(positions[i - 1], p5.Vector.mult(dir, this.segments[0].len));
          }
        }
      }
      
      // Update segment positions
      for (let i = 0; i < this.segments.length; i++) {
        this.segments[i].setA(positions[i]);
        this.segments[i].setB(positions[i + 1]);
      }
    }
    
    show() {
      push();
      for (let segment of this.segments) {
        segment.show();
        push()
        translate(segment.b.x, segment.b.y, segment.b.z);
        sphere(this.segThick*0.75);
        pop();
      }
      pop();
      
      // Draw anchor point
      push();
      translate(this.anchorPoint.x, this.anchorPoint.y, this.anchorPoint.z);
      fill(0, 255, 0);
      noStroke();
      sphere(this.segThick*0.75);
      pop();
    }
  }