class Baby{
    constructor(img, x, y){
      this.img = img;
      this.p = createVector(x,y);
      this.yPert = null;
      this.offset = random(1000);
      this.a = null;
    }
  
    update(){
      this.a = map(noise(this.offset + t/2),0,1,-PI/3,PI/3);
      this.yPert = map(noise(this.offset + t),0,1,-height/10, height/10);
      this.p.x += 1;
    }
  
    show(){
      push();
      translate(this.p.x + this.img.width/2, this.p.y + this.img.height/2 + this.yPert);
      rotate(this.a);
      image(this.img, 0, 0, this.img.width*babyScale, this.img.height*babyScale);
      pop();
    }
  
  }