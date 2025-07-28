class Box {
    constructor(x, y, z, w, h, d) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      this.h = h;
      this.d = d;
    }
    
    contains(point) {
      return (point.x >= this.x - this.w &&
              point.x < this.x + this.w &&
              point.y >= this.y - this.h &&
              point.y < this.y + this.h &&
              point.z >= this.z - this.d &&
              point.z < this.z + this.d);
    }
    
    intersects(box) {
      return !(box.x - box.w > this.x + this.w ||
               box.x + box.w < this.x - this.w ||
               box.y - box.h > this.y + this.h ||
               box.y + box.h < this.y - this.h ||
               box.z - box.d > this.z + this.d ||
               box.z + box.d < this.z - this.d);
    }
  }
  
  class Octree {
    constructor(boundary, capacity = 4) {
      this.boundary = boundary;
      this.capacity = capacity;
      this.points = [];
      this.divided = false;
    }
    
    subdivide() {
      let x = this.boundary.x;
      let y = this.boundary.y;
      let z = this.boundary.z;
      let w = this.boundary.w / 2;
      let h = this.boundary.h / 2;
      let d = this.boundary.d / 2;
      
      this.northwest = new Octree(new Box(x - w, y - h, z - d, w, h, d));
      this.northeast = new Octree(new Box(x + w, y - h, z - d, w, h, d));
      this.southwest = new Octree(new Box(x - w, y + h, z - d, w, h, d));
      this.southeast = new Octree(new Box(x + w, y + h, z - d, w, h, d));
      this.northwestBack = new Octree(new Box(x - w, y - h, z + d, w, h, d));
      this.northeastBack = new Octree(new Box(x + w, y - h, z + d, w, h, d));
      this.southwestBack = new Octree(new Box(x - w, y + h, z + d, w, h, d));
      this.southeastBack = new Octree(new Box(x + w, y + h, z + d, w, h, d));
      
      this.divided = true;
    }
    
    insert(point) {
      if (!this.boundary.contains(point.position)) {
        return false;
      }
      
      if (this.points.length < this.capacity) {
        this.points.push(point);
        return true;
      }
      
      if (!this.divided) {
        this.subdivide();
      }
      
      return (this.northwest.insert(point) ||
              this.northeast.insert(point) ||
              this.southwest.insert(point) ||
              this.southeast.insert(point) ||
              this.northwestBack.insert(point) ||
              this.northeastBack.insert(point) ||
              this.southwestBack.insert(point) ||
              this.southeastBack.insert(point));
    }
    
    query(range, found = []) {
      if (!this.boundary.intersects(range)) {
        return found;
      }
      
      for (let p of this.points) {
        if (range.contains(p.position)) {
          found.push(p);
        }
      }
      
      if (this.divided) {
        this.northwest.query(range, found);
        this.northeast.query(range, found);
        this.southwest.query(range, found);
        this.southeast.query(range, found);
        this.northwestBack.query(range, found);
        this.northeastBack.query(range, found);
        this.southwestBack.query(range, found);
        this.southeastBack.query(range, found);
      }
      
      return found;
    }
  }