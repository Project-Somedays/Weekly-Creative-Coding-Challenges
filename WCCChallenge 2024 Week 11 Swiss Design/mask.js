class ThoughtBubble{
    constructor(x, y, majorAxis, minorAxis, numOfCircles){
      this.circles = [];
      this.p = createVector(x,y);
      this.majorAxis = majorAxis;
      this.minorAxis = minorAxis;
      for(let i = 0; i < numOfCircles; i++){
        let angle = i * TWO_PI/numOfCircles;
      
        // Calculate random point on ellipse
        let posX = cos(angle) * majorAxis/2;
        let posY = sin(angle) * minorAxis/2;
        let off = random(1000);
        this.circles.push({
          'p' : createVector(posX, posY),
          'offset' : off,
          's' : map(noise(off + globOff), 0, 1, (width,height)/15, max(width, height)/4)
        })
      }
    }

    update(){
        for(let c of this.circles){
            c.s = map(noise(c.offset + globOff), 0, 1, (width,height)/10, max(width, height)/5);
        }
    }
  
    show(layer){
      layer.erase()
      layer.noStroke();
      layer.push();
      layer.translate(this.p.x, this.p.y);
      layer.ellipse(0, 0, this.majorAxis, this.minorAxis);
      for(let c of this.circles){
        layer.circle(c.p.x, c.p.y, c.s)
      }
      layer.pop();
      layer.noErase();
    }
  }