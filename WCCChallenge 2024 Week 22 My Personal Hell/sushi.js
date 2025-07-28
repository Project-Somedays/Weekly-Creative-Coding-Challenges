class Sushi{
    constructor(sushiImg){
      this.sushiImg = sushiImg;
      this.p = createVector(-width/10, sushiTrainHeight);
      this.offset = sushi.indexOf(this.sushiImg)*TWO_PI/sushi.length;
      this.isSelected = false;
      this.topRow = true;
    }
  
    follow(toFollow){
        if(this.isSelected) this.p.set(toFollow.x, toFollow.y);
    }

    moveToBottomRow(){
        this.topRow = false;
        this.p = createVector(this.p.x, sushiTrainHeight*1.3);
    }
  
    update(){
      if(!this.isSelected){
        let step = this.topRow ? trainRate : -trainRate;
        this.p.x += step;
      }
    }
  
    show(){
    //   if(this.isSelected){
    //     fill(255);
    //     circle(this.p.x, this.p.y, width/10);
    //   }
      image(this.sushiImg, 
        this.p.x, 
        this.p.y + 0.0125*height*sin(frameCount*TWO_PI/sushiCycleFrames+this.offset), 
        this.sushiImg.width*sushiScale, 
        this.sushiImg.height*sushiScale
      );
    }
  }