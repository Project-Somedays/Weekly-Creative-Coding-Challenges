function retractWalls(){
    if(!noiseSliding.isPlaying()) noiseSliding.play();
    walls[0].end.x -= width/100;
    walls[1].start.y += height/100;

}

function dropAnvil(){
    // if(!noiseAnvil.isPlaying()) noiseAnvil.play();
    // disruptionInProgress = true;
    anvil.fall();
    anvil.show();
    if(p5.Vector.dist(anvil.p, mover.p) < artAnvil.height/2 + mover.h){
        mover.isFalling = true;
        mover.p.set(mover.p.x, anvil.p.y + artAnvil.height/2 + mover.h/2);
    }
    
}


class Magnet{
    constuctor(){
        this.start = createVector( - artMagnet.width/2, height + artMagnet.height/2);
        this.target = createVector(width*0.75, height*0.75);
        this.p = createVector(this.start.x, this.start.y);
        this.lerpTracker = 0;
    }

    show(){
        image(magnet, this.p.x, this.p.y);
    }
}

function magnetise(){
    let currentMagnetPos = lerpMoveTo(120, magnet.lerpTracker, magnet.start, magnet.target, easeInOutSine);
    magnet.currentPos.set(currentMagnetPos.x, currentMagnetPos.y);
    // let currentDVDPos = lerpMoveTo(120, magnet.lerpTracker, mover.p, magnet.target, easeInOutSine);
    // mover.p.set(currentDVDPos.x, currentDVDPos.y);
}

function pullPlug(){

}


function skewWalls(){

}


function grabWithArm(){

}

function abduct(){

}

function flamethrower(){

}