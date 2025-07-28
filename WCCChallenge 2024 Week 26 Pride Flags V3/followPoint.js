
class FollowPoint{
    constructor(colour){
      this.nxOff = random(1000);
      this.nyOff = random(1000);
      this.p = createVector(mapToBounds(0,width,this.nxOff), mapToBounds(0,height,this.nyOff));
      this.colour = colour;
    }
    
    update(tlx, tly, brx, bry){
      let x = mapToBounds(tlx,brx, this.nxOff);
      let y = mapToBounds(tly,bry, this.nyOff);
      this.p.set(x,y);
    }
  
    show(){
      fill(this.colour);
      circle(this.p.x, this.p.y, 50);
    }
  }
  