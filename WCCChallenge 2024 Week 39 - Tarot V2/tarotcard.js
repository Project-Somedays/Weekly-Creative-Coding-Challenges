// Using Claude.ai to speed up the process considerably

class TarotCard {
    constructor(img, txt) {
      this.pos = createVector(random(-boxWidth/2, boxWidth/2), boxHeight/2, random(-boxDepth/2, boxDepth/2));
      this.vel = createVector(random(-1, 1), random(-4, -2), random(-1, 1));
      this.rot = createVector(random(TWO_PI), random(TWO_PI), random(TWO_PI));
      this.angVel = createVector(random(-0.1, 0.1), random(-0.1, 0.1), random(-0.1, 0.1));
      this.w = 20;
      this.h = 30;
      this.d = 1;
      this.color = color(random(255), random(255), random(255));
      this.aOffset = random(TWO_PI);
      this.r = random(width/3, width);
      this.period = int(random(120, 600));
      this.yOffset = random(-height/3, height/3);
      this.qrCodeImage = img;
      this.txt = txt;
      
    }

    setToShow(lockedPos){
      push();
      translate(lockedPos.x, lockedPos.y, lockedPos.z + 50);
      fill(this.color);
      noStroke();
      scale(5);
      box(this.w, this.h, this.d);
      // texture(this.qrCodeImage);
      translate(0,0,this.d);
      rect(0,0,this.w*0.75, this.w*0.75);
      pop();
    }
    
    update() {
      // Apply "wind" force
      // this.vel.y += random(0.05, 0.1);
      // this.vel.x += random(-0.05, 0.05);
      // this.vel.z += random(-0.05, 0.05);
      
      // // Update position
      // this.pos.add(this.vel);
      
      // Update rotation
      this.rot.add(this.angVel);
      let a = this.aOffset + frameCount*TWO_PI/this.period;

      this.pos.set(
        this.r * cos(a),
        -height - this.yOffset,
        this.r * sin(a)
      )

      
      // // Bounce off walls
      // if (abs(this.pos.x) > boxWidth/2 - this.w/2) this.vel.x *= -0.8;
      // if (abs(this.pos.z) > boxDepth/2 - this.w/2) this.vel.z *= -0.8;
      
      // // Reset if card goes out of the box
      // if (this.pos.y > boxHeight/2 || this.pos.y < -boxHeight/2 - 50) {
      //   this.reset();
      // }
    }
    
    display() {
      push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      rotateX(this.rot.x);
      rotateY(this.rot.y);
      rotateZ(this.rot.z);
      fill(this.color);
      noStroke();
      scale(5);
      box(this.w, this.h, this.d);
      // texture(this.qrCodeImage);
      translate(0,0,this.d);
      rect(0,0,this.w*0.75, this.w*0.75);
      pop();
    }
    
    reset() {
      this.pos = createVector(random(-boxWidth/2, boxWidth/2), boxHeight/2, random(-boxDepth/2, boxDepth/2));
      this.vel = createVector(random(-1, 1), random(-4, -2), random(-1, 1));
      this.rot = createVector(random(TWO_PI), random(TWO_PI), random(TWO_PI));
    }
  }