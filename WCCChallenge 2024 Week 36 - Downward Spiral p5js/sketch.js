/*Author: Project Somedays
Date: 2024-09-04
Title: WCCChallenge 2024 Week 36 - Downward Spiral

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

This prompt reminded me a little of that tragic video where the mother duck loses all its ducklings down a sewer grate
https://www.youtube.com/watch?v=ud6l2Pcdr0s

Not a sim (though for the amount of time I spent playing with parameters, I might as well have tried to find an appropriate library)
Ducks follow a logarithmic spiral path down a modified easeOutQuint y height.
Linearly ramp up the rotation speed near the centre.
EaseOutElastic easing for the bob up into frame.

RESOURCES:
- Duck model: Pointed Pivots on Turbosquid - https://www.turbosquid.com/3d-models/3d-bathroom-duck-2156511
- Sink model: Old rusty Horror Sink Joki 3D https://www.turbosquid.com/3d-models/free-obj-model-old-rusty-sink-horror/1105321
- (Royalty-Free) Drain Sounds: "Drain Close Up" https://pixabay.com/sound-effects/drain-close-up-63159/
- (Royalty-Free) Duck Sounds: "Recording Ducks (Binaural)": https://pixabay.com/sound-effects/recording-ducks-binaural-18742/
- (Royalty-Free) Piano: "Broken Sonata - Sad Piano" by CalvinClavier: https://pixabay.com/music/modern-classical-broken-sonata-sad-piano-201839/
- Easing functions: https://easings.net/
- Logarithmic Spiral: https://mathworld.wolfram.com/LogarithmicSpiral.html

TODO:
- Fix up some minor windowsize issues
- Actually texture the sink? The original was all rusty and cool-looking

*/
let gui, params, waterBiz, floaterBiz, spiralBiz;
let floaters = [];
let sink;
let surface;
let cam;
let duck;
let duckRanges = {};
let waterRes;
let soundsDucks;
let soundsPiano;
let soundsDrain;
let soundOn = true;
let duckTexture;
let debugDuck;

function preload() {
  duckTexture = loadImage(
    "Duck_Texture.png",
    () => {
      console.log("Duck Texture locked and loaded");
    },
    (err) => console.log(`Error loading duck texture: ${err}`)
  );

  sink = loadModel(
    "Sink_Repositioned.obj",
    true,
    () => console.log("Sink model locked and loaded!"),
    (err) => console.log(`Error! ${err}`),
    ".obj"
  );

  duck = loadModel(
    "Duck_Adjusted.obj",
    true,
    () => console.log("Duck model locked and loaded!"),
    (err) => console.log(`Error! ${err}`),
    ".obj"
  );

  soundsDucks = loadSound(
    "recording-ducks-binaural-18742.mp3",
    () => {
      console.log("Duck sounds locked and loaded!");
      soundsDucks.loop();
    },
    (err) => {
      console.log(err);
    }
  );

  soundsDrain = loadSound(
    "drain-close-up-63159.mp3",
    () => {
      console.log("Drain sounds locked and loaded!");
      soundsDrain.loop();
    },
    (err) => {
      console.log(err);
    }
  );

  soundsPiano = loadSound(
    "broken-sonata-sad-piano-201839.mp3",
    () => {
      console.log("Sad piano music locked and loaded!");
      soundsPiano.loop();
    },
    (err) => {
      console.log(err);
    }
  );
}
function setup() {
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createCanvas(1080, 1080, WEBGL);
  frameRate(60);
  pixelDensity(1);
  cam = createCamera();
  duckRanges = getModelRange(duck);

  gui = new lil.GUI();

  // PARAMETERS AND DEFAULT VALUES
  params = {
    // Water Biz params
    noiseZoom: 1 / 300,
    noiseProgRate: 0.02,
    waterRes: width / 25,
    waveSize: width / 40,
    waterColour: "#020255",
    whirlpoolDepth: width / 2,
    whirlpoolSteepness: 5,

    // Duck Biz
    durationEmerge: 90,
    floaterSpawnRate: 0.035,
    duckScale: 0.45,
    duckHeightOffset: 0.15,

    // Jostle Biz
    pertXZ: width / 40,
    pertY: width / 80,
    pertXYZRate: 0.01,
    pertRollRate: 0.005,
    pertYRotRate: 0.01,
    pertRoll: PI / 3,
    pertYRot: TWO_PI,

    // Spiral Biz
    spiralRate: 0.015,
    spiralRadius: 20,
    spiralSpread: 0.1,
    revolutions: 5,

    // sink biz
    sinkColour: "#ffffff",
    sinkScale: (15 * width) / 2024,
    sinkY: (width * 650) / 1877,
    sinkX: 0,
    sinkZ: 0,

    // booleans and buttons
    showPath: false,
    showWater: true,
    showFloaters: true,
    extraWaterRandomisation: true,
    jostleDucks: true,
    showDebugDuck: false,
    showSink: true,
    savePresetButton: savePreset,
    toggleSoundButton: toggleSound,
  };

  // Setting up the folders
  waterBiz = gui.addFolder("Water Biz");
  floaterBiz = gui.addFolder("Floater Biz");
  spiralBiz = gui.addFolder("Spiral Biz");
  jostleBiz = gui.addFolder("Jostle Biz").close();
  sinkBiz = gui.addFolder("Sink Biz");

  // Adding Water Biz to the GUI
  waterBiz.addColor(params, "waterColour");
  waterBiz.add(params, "noiseZoom", 0.001, 0.1);
  waterBiz.add(params, "noiseProgRate", 0.001, 0.1);
  waterBiz.add(params, "waterRes", width / 250, width / 10, 1);
  waterBiz.add(params, "waveSize", width / 100, width / 25);

  // Adding Duck Biz to the GUI
  floaterBiz.add(params, "durationEmerge", 30, 300, 1);
  floaterBiz.add(params, "revolutions", 1, 10).onChange((value) => (test = new Floater(value * TWO_PI, color(255, 0, 0))));
  floaterBiz.add(params, "duckScale", 0, 1);
  floaterBiz.add(params, "floaterSpawnRate", 0.01, 0.5);
  floaterBiz.add(params, "duckHeightOffset", 0, 1);

  // Jostle parameters
  jostleBiz.add(params, "pertXZ", width / 100, width / 10);
  jostleBiz.add(params, "pertY", width / 100, width / 10);
  jostleBiz.add(params, "pertXYZRate", 0.001, 0.1);
  jostleBiz.add(params, "pertRoll", 0, HALF_PI);
  jostleBiz.add(params, "pertRollRate", 0.001, 0.1);
  jostleBiz.add(params, "pertYRot", 0, 2 * TWO_PI);
  jostleBiz.add(params, "pertYRotRate", 0.001, 0.1);

  // Sink parameters
  sinkBiz.addColor(params, "sinkColour");
  sinkBiz.add(params, "sinkScale", 0, 20);
  sinkBiz.add(params, "sinkX", -width / 2, width / 2);
  sinkBiz.add(params, "sinkY", -width / 2, width / 2);
  sinkBiz.add(params, "sinkZ", -width / 2, width / 2);

  // Adding Spiral Biz to the GUI
  spiralBiz.add(params, "spiralRate", 0.01, 1.0);
  spiralBiz.add(params, "spiralRadius", 0.0, 50.0);
  spiralBiz.add(params, "spiralSpread", 0.0, 50.0);
  spiralBiz.add(params, "whirlpoolDepth", 0, width);
  spiralBiz.add(params, "whirlpoolSteepness", 3, 15);

  // General things to the gui
  gui.add(params, "showWater");
  gui.add(params, "showFloaters");
  gui.add(params, "extraWaterRandomisation");
  gui.add(params, "jostleDucks");
  gui.add(params, "showDebugDuck");
  gui.add(params, "showSink");
  gui.add(params, "savePresetButton").name("Save Config");
  gui.add(params, "toggleSoundButton").name("Toggle Sound");
  // gui.add(params, "showPath");

  // make a new surface
  surface = new Whirlpool();

  // set the camera looking down a little from above
  cam.setPosition(0, -width / 2, -0.6 * width);
  cam.lookAt(0, 0, 0);

  // set up debugDuck
  debugDuck = new Floater(0, 0);
  debugDuck.setPos(0, 0, 0);
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(0.2);

  // scene lighting
  ambientLight(255, 255, 255);
  pointLight(255, 255, 255, 0, 0, 0);

  if (random(1) < params.floaterSpawnRate) floaters.push(new Floater(params.revolutions * TWO_PI, random(TWO_PI)));

  if (params.showWater) {
    fill(params.waterColour);
    surface.update();
    surface.show();
  }

  for (let floater of floaters) {
    floater.update();
    floater.jostle();
    if (params.showFloaters) floater.show();
  }

  cleanUpFloaters();

  if (params.showDebugDuck) {
    debugDuck.jostle();
    debugDuck.show();
  }

  if (params.showSink) {
    fill(params.sinkColour);
    noStroke();
    push();
    translate(params.sinkX, params.sinkY, params.sinkZ);
    scale(params.sinkScale);
    model(sink);
    pop();
  }

  orbitControl();
}

function cleanUpFloaters() {
  for (let i = floaters.length - 1; i >= 0; i--) {
    if (floaters[i].isFinished) {
      floaters.splice(i, 1);
    }
  }
}

function easeOutElastic(x) {
  const c4 = (2 * Math.PI) / 3;

  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

const cubicOrSteeperEasing = (x, z, cX, cY) => {
  let normd = 1.0 - dist(x, z, cX, cY) / (width / 2);
  return Math.pow(normd, params.whirlpoolSteepness);
};

function map3DNoise(xPos, zPos, rate, minVal, maxVal) {
  let x = xPos * params.noiseZoom;
  let z = zPos * params.noiseZoom;
  let nVal = noise(x, z, frameCount * rate);
  return map(nVal, 0, 1, minVal, maxVal);
}

function map2DNoise(x, rate, minVal, maxVal) {
  return map(noise(x, frameCount * rate), 0, 1, minVal, maxVal);
}

function savePreset() {
  const preset = gui.save(); // Save the preset state (as JSON)
  const presetJSON = JSON.stringify(preset); // Convert to a JSON string

  // Trigger download of the JSON file
  const blob = new Blob([presetJSON], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "preset.json";
  link.click();
}

function getModelRange(modelToInspect) {
  // Initialize min and max values for each axis
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;

  // Loop through the vertices of the model and find min/max for each axis
  for (let i = 0; i < modelToInspect.vertices.length; i += 3) {
    let x = modelToInspect.vertices[i].x;
    let y = modelToInspect.vertices[i].y;
    let z = modelToInspect.vertices[i].z;

    // Update min/max values for X axis
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;

    // Update min/max values for Y axis
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;

    // Update min/max values for Z axis
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  // Return an object with the ranges for each axis
  return {
    minX: minX,
    minY: minY,
    minZ: minZ,
    maxX: maxX,
    maxY: maxY,
    maxZ: maxZ,
    xRange: abs(maxX - minX),
    yRange: abs(maxY - minY),
    zRange: abs(maxZ - minZ),
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight, WEBGL);
}

function toggleSound() {
  soundOn = !soundOn;
  if (soundOn) {
    soundsDrain.loop();
    soundsDucks.loop();
    soundsPiano.loop();
  } else {
    soundsDrain.stop();
    soundsDucks.stop();
    soundsPiano.stop();
  }
}
