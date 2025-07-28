// Quadtree implementation for spatial partitioning
class Quadtree {
    constructor(boundary, capacity) {
      this.boundary = boundary;
      this.capacity = capacity;
      this.points = [];
      this.divided = false;
    }
    
    // Subdivide this quadtree into four children
    subdivide() {
      const x = this.boundary.x;
      const y = this.boundary.y;
      const w = this.boundary.w / 2;
      const h = this.boundary.h / 2;
      
      const ne = {x: x + w, y: y - h, w: w, h: h};
      const nw = {x: x - w, y: y - h, w: w, h: h};
      const se = {x: x + w, y: y + h, w: w, h: h};
      const sw = {x: x - w, y: y + h, w: w, h: h};
      
      this.northeast = new Quadtree(ne, this.capacity);
      this.northwest = new Quadtree(nw, this.capacity);
      this.southeast = new Quadtree(se, this.capacity);
      this.southwest = new Quadtree(sw, this.capacity);
      
      this.divided = true;
      
      // Redistribute points to children
      for (let p of this.points) {
        this.northeast.insert(p) ||
        this.northwest.insert(p) ||
        this.southeast.insert(p) ||
        this.southwest.insert(p);
      }
      
      this.points = [];
    }
    
    // Insert a point into the quadtree
    insert(point) {
      // Check if point is within boundary
      if (!this.contains(point)) {
        return false;
      }
      
      // If capacity not reached, add the point
      if (this.points.length < this.capacity && !this.divided) {
        this.points.push(point);
        return true;
      }
      
      // Otherwise, subdivide if needed and insert into children
      if (!this.divided) {
        this.subdivide();
      }
      
      return (
        this.northeast.insert(point) ||
        this.northwest.insert(point) ||
        this.southeast.insert(point) ||
        this.southwest.insert(point)
      );
    }
    
    // Check if a point is within this quadtree's boundary
    contains(point) {
      return (
        point.position.x >= this.boundary.x - this.boundary.w &&
        point.position.x <= this.boundary.x + this.boundary.w &&
        point.position.y >= this.boundary.y - this.boundary.h &&
        point.position.y <= this.boundary.y + this.boundary.h
      );
    }
    
    // Query all points within a circular range
    query(range, found = []) {
      // Skip if the range doesn't intersect the boundary
      if (!this.intersects(range)) {
        return found;
      }
      
      // Check all points at this level
      for (let p of this.points) {
        if (this.inCircle(range, p)) {
          found.push(p);
        }
      }
      
      // If subdivided, check children
      if (this.divided) {
        this.northwest.query(range, found);
        this.northeast.query(range, found);
        this.southwest.query(range, found);
        this.southeast.query(range, found);
      }
      
      return found;
    }
    
    // Check if range intersects boundary
    intersects(range) {
      const dx = Math.abs(range.x - this.boundary.x);
      const dy = Math.abs(range.y - this.boundary.y);
      
      // Outside the boundary plus radius
      if (dx > this.boundary.w + range.r) return false;
      if (dy > this.boundary.h + range.r) return false;
      
      // Inside the boundary
      if (dx <= this.boundary.w) return true;
      if (dy <= this.boundary.h) return true;
      
      // Check corner distance
      const cornerDistSq = Math.pow(dx - this.boundary.w, 2) + 
                           Math.pow(dy - this.boundary.h, 2);
      
      return cornerDistSq <= Math.pow(range.r, 2);
    }
    
    // Check if point is within circle
    inCircle(range, point) {
      const d = dist(range.x, range.y, point.position.x, point.position.y);
      return d <= range.r;
    }
    
    // Display the quadtree (for debugging)
    display() {
      stroke(255);
      noFill();
      rectMode(CENTER);
      rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
      
      if (this.divided) {
        this.northwest.display();
        this.northeast.display();
        this.southwest.display();
        this.southeast.display();
      }
    }
  }