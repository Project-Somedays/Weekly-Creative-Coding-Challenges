class Flower{
    constructor(x,y, flowerImg){
      this.p = createVector(x,y);
      this.r = random(-PI/6, PI/6);
      this.img = flowerImg;
      this.lerpCntrl = 0;
      this.lerpSlider = 0;
      this.life = flowerLifeFrames;
      this.isDead;
      this.opacity = 255;
      this.uniqueScale = constrain(randomGaussian() + 1,0.5,2);
    }
  
    update(){
      // if it hasn't finished growing yet, grow
      if(this.lerpCntrl <= 1 && this.life > 1/flowerLerpSpeed){
        this.lerpCntrl += flowerLerpSpeed;
        // this.p.add(flowerDir);
      } 
      this.lerpSlider = easeInOutQuad(this.lerpCntrl);
      this.life --;
      
      if(this.life < 1/flowerLerpSpeed && this.lerpCntrl >= 0){
        this.lerpCntrl -= flowerLerpSpeed;
      }
      this.isDead = this.life <= 0;

      this.p.add(flowerDir);
      
    }
  
    show(){
      push();
        translate(this.p.x, this.p.y);
        rotate(this.r);
        image(this.img, 0, 0, this.lerpSlider*this.img.width*flowerScale*this.uniqueScale, this.lerpSlider*this.img.height*flowerScale*this.uniqueScale);
        
      pop();
    };
    
  }