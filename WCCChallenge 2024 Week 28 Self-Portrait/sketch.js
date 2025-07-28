/*
Author: Project Somedays
Date: 2024-07-14
Title: WCCChallenge "Self-Portrait" aka The Thatcherizer

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Didn't give myself much time this week, but thanks to ml5.js and some lightly refactored ChatGPT code, pretty happy with the result as a first pass.

Hope you get as much of a chuckle of it as I did.

Raph, as one of the bearded to another, I can only apologise - the effect isn't quite as convincing with facial hair 😔

Note: this is broken in the latest build of ml5.js --> I used 0.12.2, but in 1.0 something faceApi has been replaced with faceMesh... ChatGPT didn't know about it so must be recent.

INTERACTION
 - Play with the lil-gui sliders

RESOURCES/INSPIRATION:
  - https://en.wikipedia.org/wiki/Thatcher_effect
  - lil-gui: https://github.com/georgealways/lil-gui

TODO:
  - update to use the latest version of ml5.js
  - use params.thatcherize to show the upside down version
  - tweak the bounding boxes a little bit
  - (actually learn ml5.js)
*/


let video;
let faceapi;
let detections = [];
let gui;
let params;

function setup() {
  // createCanvas(640, 480);
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Initialize the faceapi model
  const faceOptions = {
    withLandmarks: true,
    withDescriptors: false,
  };
  faceapi = ml5.faceApi(video, faceOptions, modelReady);

  params = {
    thatcherize: true,
    mouthScale: 2.0,
    eyeScale: 2.0,
    noseScale: 1.0,
    flipEyes: true,
    flipNose: false,
    flipMouth: true
  }

  gui = new lil.GUI();
  // gui.add(params, 'thatcherize');
  gui.add(params, 'mouthScale', 1.0, 5.0, 0.1);
  gui.add(params, 'eyeScale', 1.0, 5.0, 0.1);
  gui.add(params, 'noseScale', 1.0, 5.0, 0.1);
  gui.add(params, 'flipEyes');
  gui.add(params, 'flipNose');
  gui.add(params, 'flipMouth');
}

function modelReady() {
  console.log('FaceAPI model loaded!');
  faceapi.detect(gotFaces);
}

function gotFaces(error, result) {
  if (error) {
    console.error(error);
    return;
  }
  detections = result;
  faceapi.detect(gotFaces); // Continue detecting faces
}

function draw() {
  image(video, 0, 0, width, height);

  if (detections.length === 0) return;
  
  for (let i = 0; i < detections.length; i++) {
    let landmarks = detections[i].landmarks.positions;

    // Get the left eye, right eye, left eyebrow, right eyebrow, and mouth positions
    let leftEye = landmarks.slice(36, 42);
    let rightEye = landmarks.slice(42, 48);
    let leftEyebrow = landmarks.slice(17, 22);
    let rightEyebrow = landmarks.slice(22, 27);
    let mouth = landmarks.slice(48, 60);
    let nose = landmarks.slice(27, 36);
    
    // Get the bounding boxes for the eyes, eyebrows, and mouth
    let leftEyeBrowBox = getCombinedBoundingBox(leftEye, leftEyebrow);
    let rightEyeBrowBox = getCombinedBoundingBox(rightEye, rightEyebrow);
    let mouthBox = getBoundingBox(mouth);
    let noseBox = getBoundingBox(nose);

    // Flip the eyes, eyebrows, nose and mouth vertically
    flipFeature(leftEyeBrowBox, params.eyeScale, params.flipEyes);
    flipFeature(rightEyeBrowBox, params.eyeScale, params.flipEyes);
    flipFeature(noseBox, params.noseScale, params.flipNose);
    flipFeature(mouthBox, params.mouthScale, params.flipMouth);
    
  }
  
}

function getBoundingBox(points) {
  let minX = Math.min(...points.map(p => p._x));
  let maxX = Math.max(...points.map(p => p._x));
  let minY = Math.min(...points.map(p => p._y));
  let maxY = Math.max(...points.map(p => p._y));
  return { minX, maxX, minY, maxY };
}

function getCombinedBoundingBox(points1, points2) {
  let minX = Math.min(...points1.map(p => p._x), ...points2.map(p => p._x));
  let maxX = Math.max(...points1.map(p => p._x), ...points2.map(p => p._x));
  let minY = Math.min(...points1.map(p => p._y), ...points2.map(p => p._y));
  let maxY = Math.max(...points1.map(p => p._y), ...points2.map(p => p._y));
  return { minX, maxX, minY, maxY };
}

function flipFeature(boundingBox, scaleFactor, isFlipped){
  let flipFactor = isFlipped ? -1 : 1;
  let img = get(boundingBox.minX, boundingBox.minY, boundingBox.maxX - boundingBox.minX, boundingBox.maxY - boundingBox.minY)
  push();
  translate(boundingBox.minX + (boundingBox.maxX - boundingBox.minX) / 2, boundingBox.minY + (boundingBox.maxY - boundingBox.minY) / 2);
  scale(scaleFactor, flipFactor*scaleFactor); // Flip vertically
  image(img, -img.width / 2, -img.height / 2);
  pop();
}