// --- QUADTREE CORE CLASSES ---

class Point {
  constructor(x, y, userData) {
    this.x = x;
    this.y = y;
    this.userData = userData; // Holds a reference to the Mover
  }
}

class Boundary {
  constructor(x, y, w, h) {
    this.x = x; // center x
    this.y = y; // center y
    this.w = w; // half width
    this.h = h; // half height
  }

  contains(point) {
    return (
      point.x >= this.x - this.w &&
      point.x <= this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y <= this.y + this.h
    );
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
}

class SearchRadius {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.rSquared = this.r * this.r;
  }

  contains(point) {
    let d = Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2);
    return d <= this.rSquared;
  }

  intersects(range) {
    let xDist = Math.abs(range.x - this.x);
    let yDist = Math.abs(range.y - this.y);

    let r = this.r;
    let w = range.w;
    let h = range.h;

    let edges = Math.pow(xDist - w, 2) + Math.pow(yDist - h, 2);

    if (xDist > r + w || yDist > r + h) return false;
    if (xDist <= w || yDist <= h) return true;

    return edges <= this.rSquared;
  }
}

class QuadTree {
  constructor(boundary, n) {
    this.boundary = boundary;
    this.capacity = n;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w;
    let h = this.boundary.h;

    let ne = new Boundary(x + w / 2, y - h / 2, w / 2, h / 2);
    this.northeast = new QuadTree(ne, this.capacity);
    let nw = new Boundary(x - w / 2, y - h / 2, w / 2, h / 2);
    this.northwest = new QuadTree(nw, this.capacity);
    let se = new Boundary(x + w / 2, y + h / 2, w / 2, h / 2);
    this.southeast = new QuadTree(se, this.capacity);
    let sw = new Boundary(x - w / 2, y + h / 2, w / 2, h / 2);
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
    } else {
      if (!this.divided) {
        this.subdivide();
      }
      if (this.northeast.insert(point)) return true;
      else if (this.northwest.insert(point)) return true;
      else if (this.southeast.insert(point)) return true;
      else if (this.southwest.insert(point)) return true;
    }
  }

  query(range, found = []) {
    if (!this.boundary.intersects(range)) {
      return found;
    } else {
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
    }
    return found;
  }

  show(cnv) {
    cnv.stroke(255, 50);
    cnv.noFill();
    cnv.strokeWeight(1);
    cnv.rectMode(CENTER); // Fixed typo
    cnv.rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
    
    if (this.divided) {
      // Pass the canvas to the children!
      this.northeast.show(cnv);
      this.northwest.show(cnv);
      this.southeast.show(cnv);
      this.southwest.show(cnv);
    }
  }
}