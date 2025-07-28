class JigglerBody{
    constructor(img){
      this.positions = [];
      this.boomerang = [];
      this.index = 0;
      this.img = img;
    }
  
    show(x,y){
      push();
      translate(x,y);
      // let a = map(this.boomerang[this.index])
      image(this.img, 0, 0, this.img.width*jigglerScl, this.img.height*jigglerScl);
      pop();
    }
  
    makeBoomerang(){
      this.boomerang = [...this.positions].concat([...this.positions].reverse());
    }
  
    loopBiz(){
      this.index = (this.index + 1)%this.boomerang.length
    }
      
    addPos(x,y){
      this.positions.push(createVector(x,y));
    }
    
    reset(){
      this.positions = [];
      this.boomerang = [];
      this.index = 0;
    }
  
  
    
  }