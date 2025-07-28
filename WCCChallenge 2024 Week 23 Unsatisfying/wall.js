class Wall{
    constructor(startX, startY, endX, endY){
      this.start = createVector(startX, startY);
      this.end = createVector(endX, endY);
      this.midPt = p5.Vector.lerp(this.start, this.end, 0.5);
    }
  
    getWallLength(){
      return p5.Vector.dist(this.start, this.end);
    }
  
    show(){
    //   if(this.isHit) strokeWeight(5);
      line(this.start.x, this.start.y, this.end.x, this.end.y);
      
      // text(round(this.wallLength,1), this.midPt.x, this.midPt.y)
    }
  }