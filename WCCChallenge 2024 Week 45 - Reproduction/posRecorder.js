class PosRecorder{
    constructor(name){
      this.positions = [];
      this.boomerang = [];
      this.index = 0;
      this.name = name;
    }
  
    makeBoomerang(){
      this.boomerang = [...this.positions].concat([...this.positions].reverse());
    }
  
    loopBiz(){
      this.index = (this.index + 1)%this.boomerang.length;
    }

    getCurrentCoords(){
      return this.boomerang[this.index];
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