class QuadTree {
    constructor(boundary, capacity) {
      this.boundary = boundary;
      this.capacity = capacity;
      this.points = [];
      this.divided = false;
    }
  
    subdivide() {
      let x = this.boundary.x;
      let y = this.boundary.y;
      let w = this.boundary.w / 2;
      let h = this.boundary.h / 2;
  
      let ne = new Rectangle(x + w, y, w, h);
      this.northeast = new QuadTree(ne, this.capacity);
      let nw = new Rectangle(x, y, w, h);
      this.northwest = new QuadTree(nw, this.capacity);
      let se = new Rectangle(x + w, y + h, w, h);
      this.southeast = new QuadTree(se, this.capacity);
      let sw = new Rectangle(x, y + h, w, h);
      this.southwest = new QuadTree(sw, this.capacity);
  
      this.divided = true;
    }
  
    insert(point) {
      if (!this.boundary.contains(point)) {
        return false;
      }
  
      if (this.points.length < this.capacity) {
        this.points.push(point);
        return true;
      }
  
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
  
    query(range, found = []) {
      if (!range.intersects(this.boundary)) {
        return found;
      }
  
      for (let p of this.points) {
        if (range.contains(p)) {
          found.push(p);
        }
      }
  
      if (this.divided) {
        this.northwest.query(range, found);
        this.northeast.query(range, found);
        this.southwest.query(range, found);
        this.southeast.query(range, found);
      }
  
      return found;
    }
  }
  
  class Point {
    constructor(x, y, userData) {
      this.x = x;
      this.y = y;
      this.userData = userData;
    }
  }
  
  class Rectangle {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
  
    contains(point) {
      return (
        point.x >= this.x &&
        point.x < this.x + this.w &&
        point.y >= this.y &&
        point.y < this.y + this.h
      );
    }
  
    intersects(range) {
      return !(
        range.x > this.x + this.w ||
        range.x + range.w < this.x ||
        range.y > this.y + this.h ||
        range.y + range.h < this.y
      );
    }
  }
  
  class Circle {
    constructor(x, y, r) {
      this.x = x;
      this.y = y;
      this.r = r;
    }
  
    contains(point) {
      let d = Math.sqrt((point.x - this.x) ** 2 + (point.y - this.y) ** 2);
      return d <= this.r;
    }
  
    intersects(range) {
      let xDist = Math.abs(this.x - range.x - range.w / 2);
      let yDist = Math.abs(this.y - range.y - range.h / 2);
  
      let r = this.r;
      let w = range.w / 2;
      let h = range.h / 2;
  
      if (xDist > (r + w) || yDist > (r + h)) return false;
      if (xDist <= w || yDist <= h) return true;
  
      let cornerDist = (xDist - w) ** 2 + (yDist - h) ** 2;
      return cornerDist <= (r ** 2);
    }
  }