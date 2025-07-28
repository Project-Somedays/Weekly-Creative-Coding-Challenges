class GameSpace{
    constructor(x, y, player, isEndZone){
      this.p = createVector(x,y,0);
      this.player = player;
      this.isEndZone = isEndZone
      this.rocks = isEndZone ? 0 : startingRocks;
      this.col = player ? color(255, 0, 0) : color(0,0,255);
      this.mouseOver = false;
    }
  
    addRock(n){
      this.rocks += n;
    }
  
    removeRocks(){
      this.rocks = 0;
    }
  
    setMouseOver(x,y){
      this.mouseOver = dist(x, y, this.p.x, this.p.y) < rockSize*1.5;
      if(this.mouseOver) selectedSpace = this;
    }
  
    showSpace(){
      stroke(this.col);
      fill(0);
      strokeWeight(this.mouseOver ? 5 : 2);
      push();
        translate(this.p.x, this.p.y, this.p.z);
        let ySizeMultiplier = this.isEndZone ? 5 : 1;
        plane(rockSize*6, rockSize*6 * ySizeMultiplier);10000
      pop();
    }

    highlight(){
        push();
        translate(this.p.x, this.p.y, this.p.z);
        fill("#00FF00");
        noStroke();
        plane(rockSize*5, rockSize*5);
        pop()
    }
  
    showRocks(){
      push();
      translate(this.p.x, this.p.y, this.p.z);
      for(let i = 0; i < this.rocks; i++){
        let a = i*TWO_PI/this.rocks;
        noStroke();
        fill("#FFFFFF");
        push();
        translate(1.5*rockSize*cos(a), 1.5*rockSize*sin(a), 0);
        sphere(rockSize)
        pop();
      }
      pop();
  
    }
  
    show(){
      this.showSpace();
      this.showRocks();     
    }
  }
  