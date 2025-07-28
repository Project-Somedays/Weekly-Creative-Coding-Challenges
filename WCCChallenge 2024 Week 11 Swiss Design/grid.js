class BahausGrid{
    constructor(){
      this.tiles = [];
      for(let y = 0; y < height; y+= s){
        for(let x = 0; x < width; x+= s){
          
            if(random() < 0.4){
                this.tiles.push(new RectangleTile(x,y));
            } else{
                this.tiles.push(new CircleTile(x,y));
            }
            
          
        }
      }
    }

    show(){
        for(let y = 0; y < height/s; y++){
            for(let x = 0; x < width/s; x++){
              this.tiles[int(x + y*width/s)]    .show();
            }
          }
    }
  }