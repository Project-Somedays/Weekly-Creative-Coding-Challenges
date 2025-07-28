/*
Author: Project Somedays
Date: 2024-07-28
Title: WCCChallenge Draggable

I remember some game from way back when where you could make a looping little dancing character.
That and Adventure time dances with the Jiggler.

Recording tne positions during record mode and then boomeranging them back

INTERACTION

MUSIC
 - "The Dance Music" by moodmode: https://pixabay.com/music/upbeat-the-dance-music-211276/
 - "Upbeat Pop Dance" by Vivaleum: https://pixabay.com/music/pop-upbeat-pop-dance-186805/
 - "AMALGAM" by Rockot: https://pixabay.com/music/future-bass-amalgam-217007/

IMAGES
 - Jiggler: https://static.wikia.nocookie.net/adventuretimewithfinnandjake/images/c/cc/The_Jiggler.png/revision/latest?cb=20120620191026


*/

let params, gui;
let recordingMode;
let song1, song2, song3;
let maxLength = 200;
let armSegments = 10;

let positions = [];
let startFrame = 0;
let jiggler;
let jigglerScl;

let boomerang = [];
let songs;
let selectedSong;
let isRecording = false;
let body, armLeft, leftLeg, rightArm, rightLeg;
let debug;


function preload(){
  song1 = loadSound("the-dance-music-211276.mp3");
  song2 = loadSound("upbeat-pop-dance-186805.mp3");
  song3 = loadSound("amalgam-217007.mp3");
  jiggler = loadImage("The_Jiggler.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight); 
  gui = new lil.GUI();
  imageMode(CENTER);
  debug = createVector(mouseX, mouseY);
  armLeft = new Limb(width/2, height/2, createVector(0,0), createVector(mouseX, mouseY));
  armRight = new Limb(width/2, height/2, createVector(0,0), createVector(mouseX, mouseY));
  leftLeg = new Limb(width/2, height/2, createVector(0,0), createVector(mouseX, mouseY));
  rightLeg = new Limb(width/2, height/2, createVector(0,0), createVector(mouseX, mouseY));
  selectedSong = song1;
  jigglerScl = 0.6*height/1080;

  body = new JigglerBody(jiggler);
  
  frameRate(60);

  params = {
    followPathMode: false,
    song: song1,
    currentlyAnimating: body
  }
  
  gui.add(params, 'selectedSong', {"The Dance Music": song1, "Upbeat Pop Dance": song2, "AMALGAM": song3})
     .onChange(value => {
      selectedSong.stop();
      selectedSong = value;
      selectedSong.loop();
     });
  
  gui.add(params, 'followPathMode')
     .onChange(value => {
      if(value) startLoop();
     })

  gui.add(params, 'currentlyAnimating', {'debug': debug, 'body': body, 'left arm': armLeft, 'right arm': armRight});
}

function startLoop(){
  startFrame = 0
}

function draw() {
  background(0);

  fill(255);
  
  switch(params.currentlyAnimating){
    case debug:
      if(!params.followPathMode){
        circle(mouseX, mouseY, 500);
      } else {
        let p = boomerang[(frameCount - startFrame)%boomerang.length];
        if(boomerang.length === 0) circle(width/2, height/2, 500);
        circle(p.x, p.y, 500);
      }
      break;
    case body:
      if(!params.followPathMode){
        body.show(mouseX, mouseY);
      } else{
        let p = body.boomerang[body.index];
        body.show(p.x, p.y);
        body.loopBiz();
      }
      break;
    default:
      break;
  }
}

function mouseDragged(){
  isRecording = true;
  if(!params.followPathMode) params.currentlyAnimating.addPos(mouseX, mouseY);
}

function keyPressed(){
  switch(key.toLowerCase()){
    case ' ':
      if(selectedSong.isPlaying()){
        selectedSong.stop();
      }else {
        selectedSong.loop();
      }
      break;
    case 'r':
      params.currentlyAnimating.reset() 
      break;
    default:
      break;
  }
  
}

function mouseReleased(){
  if(isRecording){
    params.currentlyAnimating.makeBoomerang();
    isRecording = false;
  }
}






