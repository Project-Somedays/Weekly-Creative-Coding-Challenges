class Mover{
    constructor(img){
      this.w = width/3;
      this.h = this.w/2;
      this.p = createVector(random(this.w, width-this.w), random(this.h, height - this.h));
      this.isFalling = false;
      this.a = createVector(0,0);
      this.img = img;
      this.imageIndex = 0;
      
    }
  
    getCorners(){
      return[
        createVector(this.p.x - this.w/2, this.p.y - this.h/2),
        createVector(this.p.x + this.w/2, this.p.y - this.h/2),
        createVector(this.p.x + this.w/2, this.p.y + this.h/2),
        createVector(this.p.x - this.w/2, this.p.y + this.h/2)
      ];
    }
    update(){
      this.p.add(dir);
    }

    updateImage(){
        this.imageIndex = (this.imageIndex + 1)%dvdLogos.length;
    }
  
    show(){
      image(dvdLogos[this.imageIndex], this.p.x, this.p.y, this.w, this.h);
    }
     
  }