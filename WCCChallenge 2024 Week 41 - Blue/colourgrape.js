class ColourGrape{
    constructor(x, y, col){
      this.body = Bodies.circle(x,y,ballRadius, {friction: systemFriction, frictionStatic: systemStaticFriction});
      this.col = col;
    }
  
    update(){
      if(this.body.position.y > height/2){
        this.col = currentColour;
      }
    }
  
    show(){
      fill(this.col);
      circle(this.body.position.x, this.body.position.y, ballRadius*2);
    }
  
}