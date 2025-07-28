/*
Author: Project Somedays
Started: 20230-12-17
Title: "House Spiders"
Made for the #WCCChallenge Prompt: "Improbable Architecture"

NOTE: won't currently work on phone --> I'm tired, and haven't worked out how to scale the vector graphics to the windowWidth

Vector graphics from Freepik.com
House: https://www.freepik.com/free-vector/horror-house-poster-with-neglected-building-with-night-cemetery-background-cartoon-vector-illustration_37420275.htm
Spider Legs: https://www.freepik.com/free-vector/sticker-template-with-top-view-spider-isolated_16865645.htm 

Borrowing from https://editor.p5js.org/jnsjknn/sketches/B1O8DOqZV for the CCapture Code

babySpidersNightmareFuel array is full of smaller copies of the main housespider following a 2D perlin noise field and wrapping around, but randomising x position when they do to stop them converging on lines
Spider walk cycle is biologically accurate to my best ability thanks to https://www.youtube.com/watch?v=GtHzpX0FCFY: two pairs of 2-leg cycles
Walk cycle is just a sinewave cycle from their base offset. Looks a little funny, but I've spent enough time on this already =)

To improve on next time:
- make the legs different sizes
- do inverse kinematics to make the walk cycle move forward instead of just legs wiggling back and forth
- work out a much cleaner way to doing the multiple-segment legs
- animate more segments of the spider legs
- get a better method for scaling - there must be a more elegant solution than what I have done =(

For debate: which way to house spiders walk? Is door = mouth or door = spinneretts/silk poop tubes. Discuss.

My original idea was to have the large spider rappel down, lay some eggs and then the baby spiders would burst out and escape the screen
This will do for now
*/


let mummaSpider;
let imgHouse;
let imgLegBase;
let imgLegTip;
let scaleToWindowWidthFactor; // How I've used this is VERY clunky. Any thoughts for improvements? 
// let babySpiderSpeed = 3;
let noiseZoomFactor = 300;
let noiseAOffsetSpeed = 0.005;
let babySpidersNightmareFuel = [];
let babySpiderScaleFactor = 0.05;
let babySpiders = 50; // running slow? Try dropping the number of spiders
let margin = 100;
let dangleCycleFrames = 500;
let dangleCycleSpeed;


let fps = 30;
let capturer;


let dangleMagFraction = 0.75;
let walkCycleSpeed = 0.3;

function preload(){
  imgHouse = loadImage("Creepy House.png");
  imgLegBase = loadImage("BaseSegment.png");
  imgLegTip = loadImage("TipSegment.png");
}


function setup() {
  createCanvas(1080, 1920);
  dangleCycleSpeed = TWO_PI/dangleCycleFrames;
  scaleToWindowWidthFactor = 0.25*width/imgHouse.width;
  mummaSpider = new HouseSpider(width/2, height/2, 0, 0);
  capturer = new CCapture({
    format: 'png',
    framerate: fps
  });

  // frameRate(fps);
	
  // console.log(`New House spider at (${mummaSpider.p.x},${mummaSpider.p.y})`);
  // for(let i = 0; i < babySpiders; i++){
  //   babySpidersNightmareFuel.push(new HouseSpider(random(width), random(height),0));
  // }

  pixelDensity(1);

  strokeWeight(5);
}

function draw() {
  if(frameCount === 1){
    capturer.start();
  }
  if (frameCount > dangleCycleFrames*3.5) {
    noLoop();
    console.log('finished recording.');
    capturer.stop();
    capturer.save();
    return;
  }


  background(0);
  fill(255);
  
  
  updateAndShowBabySpiders();
  // ellipse(width/2, height/2, 200, 200);
  fill(0,100);
  noStroke();
  // fade the background spiders
  rect(-5, 5, width + 10, height + 10);
  // draw the silk line
  stroke(255);
  line(mummaSpider.p.x, 0, mummaSpider.p.x, mummaSpider.p.y);
  mummaSpider.updateDangle();
  mummaSpider.show(false);
  if(mummaSpider.p.y === dangleMagFraction*height){
    spawn();
  }

  capturer.capture(document.getElementById('defaultCanvas0'));
}


function spawn(){
  // babySpidersNightmareFuel = [];
  for(let i = 0; i < babySpiders; i++){
    let speed = constrain(7*abs(randomGaussian()), 5, 10)
    babySpidersNightmareFuel.push(new HouseSpider(mummaSpider.p.x + random(-width/20, width/20) ,mummaSpider.p.y + random(-width/20, width/20),random(TWO_PI),speed));
  }
}

function updateAndShowBabySpiders(){
  for(let i = babySpidersNightmareFuel.length - 1; i > 0; i--){
    let b = babySpidersNightmareFuel[i];
    b.updatePos();
    if(b.p.x < -50 || b.p.x > width + 50 || b.p.y < - 50 || b.p.y > height + 50){
      babySpidersNightmareFuel.splice(i,1);
      continue;
    }
    // wrapping and randomizing positions
    // if(babySpidersNightmareFuel[i].p.x < -margin){
    //   babySpidersNightmareFuel[i].p.x = width + margin;
    //   babySpidersNightmareFuel[i].p.y = random(height);
    // }
    // if(babySpidersNightmareFuel[i].p.x > width + margin){
    //   babySpidersNightmareFuel[i].p.x = -margin ;
    //   babySpidersNightmareFuel[i].p.y = random(height);
    // }
    // if(babySpidersNightmareFuel[i].p.y < -margin){
    //   babySpidersNightmareFuel[i].p.y = height + margin;
    //   babySpidersNightmareFuel[i].p.x = random(width);
    // }
    // if(babySpidersNightmareFuel[i].p.y > height + margin){
    //   babySpidersNightmareFuel[i].p.y = -margin;
    //   babySpidersNightmareFuel[i].p.x = random(width);
    // }
    babySpidersNightmareFuel[i].updateWalk();
    
    push();
      translate(babySpidersNightmareFuel[i].p.x, babySpidersNightmareFuel[i].p.y);
      rotate(babySpidersNightmareFuel[i].v.heading() + HALF_PI + PI);
      scale(babySpiderScaleFactor, babySpiderScaleFactor);
      babySpidersNightmareFuel[i].show(true);
    pop();  
  }

  }


function easeInOutQuint(x){
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
  }

