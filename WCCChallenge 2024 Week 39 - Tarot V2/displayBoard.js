class DisplayBoard{
    constructor(textSize){
      this.screen = createGraphics(cardRatio*min(width, height), min(width, height));
      // this.screen.background(0);
      this.screen.textAlign(CENTER, CENTER);
      this.screen.fill(255);
      this.screen.textSize(min(width, height)*0.15);
      this.startText = "A.C.M.E\nTarotron\n9000";
      this.writeTextToScreen(this.startText);
      this.emojiIndex = 0;
      this.screen.textSize(textSize);
      this.screen.textFont(emojiFont);
      this.cycleStart = 0;
      this.slotMachineStartFrame = 0;
      this.slotMachineMode = false;
      
    }


    startSlotMachine(){
      this.slotMachineStartFrame = frameCount;
      this.slotMachineMode = true;
    }
  
    slotMachine(){
      function easeOutQuad(x){
          return 1 - (1 - x) * (1 - x);
        }
      let slotmachineProgress = (frameCount - this.slotMachineStartFrame)/slotmachineFrames;
      
      let everyXFrames = int(20*easeOutQuad(slotmachineProgress));
      if(frameCount % everyXFrames === 0) this.emojiIndex = (this.emojiIndex + 1)%emoji.length;
      this.writeTextToScreen(emoji[this.emojiIndex]);
      this.slotMachineMode = (frameCount - this.slotMachineStartFrame) < slotmachineFrames;
    }
  
    pick(){
      // console.log("Picking another thing")
      this.emojiIndex = int(random(emoji.length));
      this.writeTextToScreen(emoji[this.emojiIndex]);
    }
  
    writeTextToScreen(txt){
      this.screen.fill(0);
      this.screen.rect(0,0,this.screen.width, this.screen.height);
      this.screen.fill(255);
      this.screen.text(txt,this.screen.width/2, this.screen.height/2);
    }
  
    shuffle(array) {
      let currentIndex = array.length;
      let randomIndex;
    
      // While there remain elements to shuffle...
      while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }
    
      return array;
    }
  
    show(){
      push();
      texture(this.screen);
      // rotateY(frameCount * TWO_PI/600);
      rect(0, brainY - height*0.75, min(width, height), min(width, height));
      // box(cardRatio*min(width, height), min(width, height), 10);
      pop();
    }
  
    
  }