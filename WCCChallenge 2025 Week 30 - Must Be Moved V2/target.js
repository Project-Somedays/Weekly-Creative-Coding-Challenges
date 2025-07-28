class Target{
    constructor(targetOption, x){
        this.x = x
        this.txt = targetOption.key
        this.col = targetOption.col
        this.txtCol = this.col === color("#FBBC05") ? color(0) : color(255);
        this.isCaught = false;
        this.success = false;
    }

    update(){
        this.x -= currentSpeed;
    }
    
    show(){
        
        noStroke();
        let rectAlpha = this.isCaught ? 64 : 255; // 128 for 50% transparency, 255 for opaque
        // Create a new color object based on txtCol, but with the desired alpha
        if(this.success){
            fill("#A020F0");
            rect(this.x, UIheight, targetSize*1.1, targetSize*1.1);
        }
        let rectCol = color(red(this.col), green(this.col), blue(this.col), rectAlpha);
        fill(rectCol);
        textAlign(CENTER);
        textSize(targetSize/2);
        rect(this.x, UIheight, targetSize, targetSize);
        fill(this.txtCol);
        text(this.txt, this.x, UIheight);
    }
}

function pickTarget(){
  let targetOption = random(targetsColours.filter(e => e !== lastTarget)); // ensures no direct repeats
  lastTarget = targetOption;
  return targetOption;
}


function preloadTargets(){
    for(let i = 0; i < 5; i ++){
      targets.push(new Target(pickTarget(), width/2 + (2 + tileSpacing) * targetSize + (i*targetSize*tileSpacing)));
    }
}


