/*
Author: Project Somedays
Date: 2024-11-02
Title: WCCChallenge - Jumpscare

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

The bathroom mirror jumpscare is such a classic.
Using ml5 to remove the background from the camera feed - what an incredible resource.
Also recently found a Mortal Kombat announcer text to speech ai so... obviously that got chucked in the pot also
NightCafe used to generate all the images
Claude.ai gave me some code to sample randomly but but lower the frequency of repeats

RESOURCES (all royalty-free and/or personally generated from NightCafe):
  - ml5js sample code for masking off the background of the video feed: https://editor.p5js.org/ml5/sketches/KNsdeNhrp
  - Tension Cinematic Trailer, OpenMusicList: https://pixabay.com/music/build-up-scenes-tension-cinematic-trailer-187689/
  - Jumpscare_Sound, Pixabay: https://pixabay.com/sound-effects/jumpscare-sound-39630/
  - Jehova's Witnesses: https://creator.nightcafe.studio/creation/xbYY49FGGt1WDX4Q1bhV?ru=projectsomedays
  - Lizard Person: https://creator.nightcafe.studio/creation/Q8TFf8O0kCFQe4PBuMH9?ru=projectsomedays
  - The Fly: https://creator.nightcafe.studio/creation/OYQqVPpZkRZUyMMq3Eqh?ru=projectsomedays
  - Overly-zealous Charity Workers: https://creator.nightcafe.studio/creation/GHulYoJPawHMYcJwBWDr?ru=projectsomedays
  - Parking Inspector: https://creator.nightcafe.studio/creation/vvVjEnMXZfQToCAjmhnc?ru=projectsomedays
  - Girl Scout: https://creator.nightcafe.studio/creation/8kMNRA80lCTJoe1hL5Kq?ru=projectsomedays
  - Tax Auditors: https://creator.nightcafe.studio/creation/VwVnrB871Z2gcD01s8cd?ru=projectsomedays
  - Filthy bathroom: https://creator.nightcafe.studio/creation/qrUaBvaJiFZMwyi4ZQ4S?ru=projectsomedays
  - Mortal kombat announcer text to speech AI: https://www.101soundboards.com/tts/73775-mortal-kombat-announcer-netherealm-tts-computer-ai-voice#goog_rewarded
*/


let gui, params;
let jehovaswitnesses, mirrorFront, mirror;
let jumpscareSound;
let lizardPerson, flyman, volunteers, parkinginspector, taxmen, girlScout;
let sJehova, sLizard, sParkingInspector, sTaxAuditors, sCharityWorkers, sFlyMan, sGirlScout

let music;

let loadingProgress = 0;
let resetFrame = 0;
let weightedSampler;

let scl;

// timing
let startFrame = 0;
let scareFrame;
let playAnnouncementFrame;

// ml5/video stuff
let bodySegmentation;
let video;
let segmentation;
const options = {
  maskType: "background",
};


let currentScaryThing = null;
let isLoading;
let currentlyLoaded = 0;
let totalToLoad;

let scaryThings = [
  {imgFile:"Jehova's Witnesses.png", soundFile: "jehovas-witnesses-101soundboards.mp3", img: null, sound: null},
  {imgFile:"LizardPerson.jpg", soundFile: "lizard-people-101soundboards.mp3", img: null, sound: null},
  {imgFile:"Volunteers.jpg", soundFile: "overly-zealous-charity-workers-at-shopping-centers-101soundboards.mp3", img: null, sound: null},
  {imgFile:"Fly.jpg", soundFile: "whatever-this-thing-is-101soundboards.mp3",  img: null, sound: null},
  {imgFile:"Parking Inspector.png", soundFile: "parking-inspectors-101soundboards.mp3", img: null, sound: null},
  {imgFile:"Tax Auditors.png", soundFile: "tax-auditors-101soundboards.mp3", img: null, sound: null},
  {imgFile: "Girl Scout.png", soundFile: "girl-scouts-needing-exact-change-101soundboards.mp3", img: null, sound: null},
]

function preload(){
  bodySegmentation = ml5.bodySegmentation("SelfieSegmentation", options);
}

function setup() {
  createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  frameRate(30);
  pixelDensity(1); 
  scl = height / 1024;//currentScaryThing.img.height;

	// variables and defaults
  params = {
    'Show Video' : true,
    'Play Music' : true,
    'Play Announcements' : true,
    'Play JumpSound': true,
    'Music Volume' : 0.25,
    'Announcement Volume': 1,
    'Announcement Delay': 30,
    'Jumpsound Volume': 1,
    'Show Mirror': true,
    framesOnScreen: 10,
    blinkLikelihood: 0.03,
    minWait: 60,
    maxWait: 300,
    videoScale: 0.66,
    blinkMode: true
  }

  function incrementLoaded(){
    currentlyLoaded ++
    isLoading = currentlyLoaded < totalToLoad;
    if(!isLoading) windowResized();
  }
  
  function logErr(err){
    console.log(err);
  }

  // load stuff we need
  mirror = loadImage("Mirror.jpg", incrementLoaded, err => logErr(err));
  mirrorFront = loadImage("Mirror Front.png", incrementLoaded, err => logErr(err));
  music = loadSound("tension-cinematic-trailer-187689.mp3", () => {
    music.setVolume(params['Music Volume']);
    music.loop();
    incrementLoaded();
  } , err => logErr(err));
  jumpscareSound = loadSound("jumpscare_sound-39630.mp3", incrementLoaded, err => logErr(err));
  
  totalToLoad = 4 + scaryThings.length*2;
  // establish how many things to load firs

  for(let scaryThing of scaryThings){
    scaryThing.img = loadImage(scaryThing.imgFile, incrementLoaded, err => logErr(err));
    scaryThing.sound = loadSound(scaryThing.soundFile, incrementLoaded, err => logErr(err)); 
  }
  
  
// setting up the gui
  gui = new lil.GUI();
  gui.add(params, 'Show Video');
  gui.add(params, 'videoScale', 0, 2);
  gui.add(params, 'Play Music').onChange(_ => {
    if(music.isPlaying()){
      music.stop();
    } else{
      music.loop();
    }
  });
  gui.add(params, 'Play Announcements');
  gui.add(params, 'Play JumpSound');
  gui.add(params, 'Music Volume', 0, 1).onChange(value => music.setVolume(value));
  gui.add(params, 'Announcement Volume', 0, 1);
  gui.add(params, 'Announcement Delay', 0, 120, 1);
  gui.add(params, 'Jumpsound Volume', 0, 1);
  gui.add(params, 'framesOnScreen', 1, 120, 1);
  gui.add(params, 'blinkLikelihood', 0, 0.1);
  gui.add(params, 'minWait', 10, 120, 1);
  gui.add(params, 'maxWait', 60, 600, 1);
  gui.add(params, 'Show Mirror');
  gui.add(params, 'blinkMode');

  // createCanvas(1080, 1080);
  scl = height / mirror.height;
  video = createCapture(VIDEO);
  video.hide();
  // video.size(width, height);
  imageMode(CENTER);
 
  
  bodySegmentation.detectStart(video, gotResults);
  
  weightedSampler = new WeightedSampler(scaryThings, 0.75);

  resetJumpFrame();
}


function draw() {
  // draw the back wall

  if(isLoading) {
    
    background(0);
    stroke(255);
    noFill(0);

    rect(0.1*width, height*(0.5 - 0.05), width*0.8, height*0.1);
    fill(255);
    noStroke();
    rect(0.1*width, height*(0.5 - 0.05), width * 0.8 * (currentlyLoaded/totalToLoad), height*0.1);
	
		const r = width/4;
		const d = width/25;
		const revFrames = 300;
		push();
		translate(width/2, height/2);
		for(let i = 0; i < 10; i++){
      let offset = i *TWO_PI/20;
			circle(r * cos(-frameCount * TWO_PI/revFrames + offset), r*sin(-frameCount * TWO_PI/revFrames + offset), d * (1 - i*0.05));
		}
		pop();
		
    return;
  }

  // draw the backdrop
  image(mirror, width/2, height/2, mirror.width * scl, mirror.height * scl);
  
  // play the scary sound!
  if(params["Play JumpSound"] && frameCount === scareFrame){
    jumpscareSound.setVolume(params["Jumpsound Volume"]);
    jumpscareSound.play();
  } 
  
  // show the image for a bit
  if(frameCount >= scareFrame && frameCount <= scareFrame + params.framesOnScreen) image(currentScaryThing.img, width/2, height/2, currentScaryThing.img.width * scl, currentScaryThing.img.height * scl);
  
  // show you
  if (params["Show Video"] && segmentation) {
    video.mask(segmentation.mask);
    image(video, width/2, height/2 - params.videoScale *video.height/4, video.width * params.videoScale, video.height * params.videoScale);
  }

  // reset -> announce and reset the jump stuff
  if(frameCount === playAnnouncementFrame){
    currentScaryThing.sound.setVolume(params["Announcement Volume"]);
    currentScaryThing.sound.play();
  }

  if(frameCount === resetFrame) resetJumpFrame();
  
  // show the mirror front with the cutout
  if(params["Show Mirror"]) image(mirrorFront, width/2, height/2, mirrorFront.width * scl, mirrorFront.height * scl);

  if(params.blinkMode && random() < params.blinkLikelihood) background(0);
}

function gotResults(result) {
  segmentation = result;
}

function resetJumpFrame(){
  startFrame = frameCount;
  scareFrame = startFrame + int(random(params.minWait, params.maxWait));
  playAnnouncementFrame = scareFrame + params["Announcement Delay"];
  resetFrame = scareFrame + 3 * params.framesOnScreen;
  currentScaryThing = weightedSampler.sample();
  scl = height / currentScaryThing.img.height;
}

class WeightedSampler {
  constructor(items, historyWeight = 0.5) {
    this.items = items;
    this.historyWeight = historyWeight;
    this.history = new Array(items.length).fill(0);
    this.currentIndex = 0;
  }
  
  // Get weights based on how recently items were chosen
  getWeights() {
    const weights = new Array(this.items.length).fill(1);
    
    // Reduce weight based on recency in history
    for (let i = 0; i < this.items.length; i++) {
      const recency = this.history[i];
      if (recency > 0) {
        weights[i] *= Math.pow(this.historyWeight, recency);
      }
    }
    
    return weights;
  }
  
  // Sample an item using the weighted probabilities
  sample() {
    const weights = this.getWeights();
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    let r = Math.random() * totalWeight;
    for (let i = 0; i < this.items.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        // Update history
        this.updateHistory(i);
        return this.items[i];
      }
    }
    
    // Fallback in case of floating point errors
    return this.items[this.items.length - 1];
  }
  
  // Update history tracking for all items
  updateHistory(chosenIndex) {
    for (let i = 0; i < this.history.length; i++) {
      if (i === chosenIndex) {
        this.history[i] = this.items.length; // Max recency
      } else if (this.history[i] > 0) {
        this.history[i]--; // Decrease recency for other items
      }
    }
  }
}

function windowResized(){
  resizeCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  scl = height / currentScaryThing.img.height;
}
