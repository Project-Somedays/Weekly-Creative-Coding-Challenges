/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 39 - Music Visualiser
| 📅 Started      | 2025-09-26      
| 📅 Completed    | 2025-09-26        
| 🕒 Taken        | 1.5hrs of tweaking/adding possible adjustments                     
| 🤯 Concept      | FFTs are neat
| 🔎 Focus        | Reliving those heady days of windows media player music visualisations

Representing the amplitude of frequency bands on a Fibonacci lattice of hexagonal columns by height and colour 🥰
Keeping it simple

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

RESOURCES
- Claude to help me with the rotations
- Royalty-free music from Pixabay🎵:
  - "Orchestral Joy" by Sonican: https://pixabay.com/music/modern-classical-orchestral-joy-403337/
  - "Dubstep Basketball Event Music" by HitsLab: https://pixabay.com/music/dubstep-dubstep-basketball-event-music-382151/
  - "Experimental Cinematic Hip-Hop" by Rockot: https://pixabay.com/music/beats-experimental-cinematic-hip-hop-315904/

*/



let music = [
  {title: "Experimental Hiphop", path: "experimental-cinematic-hip-hop-315904.mp3", sound: null},
  {title: "Dubstep", path: "dubstep-basketball-event-music-382151.mp3", sound: null},
  {title: "Orchestral", path: "orchestral-joy-403337.mp3", sound: null}
  ]

let musicOptions = {};
let fft;
let n = 2048;
let locations;
let c;
let t = 0;


function preload(){
  for(let s of music){
    s.sound = loadSound(s.path);
  }
  console.log(music);

  musicOptions = music.reduce((acc, currentItem) => {
    acc[currentItem.title] = currentItem.sound;
    return acc;
  }, {})

  console.log(musicOptions);
}

let gui, params;

function setup() {
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createCanvas(1080, 1920, WEBGL)
  c = createVector(0,0,0);

  fft = new p5.FFT(0.9, n);

  
 
 
  locations = fibonacciSphere(n);

  gui = new lil.GUI();
  params = {
    music: musicOptions["Dubstep"],
    bins: 2048,
    ampMultiplier: 4,
    sphereR: min(height, width)/4,
    columnRadius: 1,
    "easingFn": linear,
    centreSpikes: true,
    autoRotate: true,
    showCentralSphere: false,
    noiseZoom: 1,
    noiseProgRate: 0.01,
    applyBaseNoise: true,
    noiseMax: 0.5
  }

  // FFT GUI
  const fftOptions = gui.addFolder("FFT Options");
  fftOptions.add(params, 'music', musicOptions).onChange(newMusic => {
    prevMusic.stop();
    newMusic.loop()
    prevMusic = newMusic;
  })
  fftOptions.add(params, 'bins', [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192]).onChange(newBins => {
    fft = new p5.FFT(0.9, newBins);
    locations = fibonacciSphere(newBins);
  });

  // positioning GUI
  const positioningOptions = gui.addFolder("Positioning Options");
  positioningOptions.add(params, 'ampMultiplier', 1, 8, 0.01);
  positioningOptions.add(params, 'sphereR', 0, width, 1);
  positioningOptions.add(params, 'centreSpikes');
  positioningOptions.add(params, 'autoRotate');
  positioningOptions.add(params, 'showCentralSphere');

  // Fine Detail GUI
  const customizationOptions = gui.addFolder("Customization");
  customizationOptions.add(params, 'easingFn', {
    "linear": linear,
    "quadratic": quadratic,
    "sine": easeInOutSine, 
    "outAndBack": easeInOutBack, 
    "elastic": easeInOutElastic}).name("Shape Function");
  customizationOptions.add(params, 'columnRadius', 0.1, 5, 0.1); 
  customizationOptions.add(params, 'applyBaseNoise');
  customizationOptions.add(params, 'noiseProgRate', 0, 0.03, 0.001);
  customizationOptions.add(params, 'noiseMax', 0, 1);
  customizationOptions.add(params, 'noiseZoom', 0.01,2);
  
  params.music.loop();
  prevMusic = params.music;
}

function draw() {
  background(0);

  t += params.noiseProgRate;

  let spectrum = fft.analyze();
  // Add some lighting for better 3D effect.
  directionalLight(255, 255, 255, 0, 0, -1);
  ambientLight(50);
  specularMaterial(255);
  shininess(50);
  
  
  // Rotate the entire scene slowly.
  if(params.autoRotate) {
    rotateY(frameCount * 0.005);
    rotateX(-frameCount * 0.005);
    rotateZ(frameCount * 0.005);
  }

  for(let i = 0; i < params.bins; i++){
    let p = locations[i];
    let frequencyBandAmplitude = params.easingFn(map(spectrum[i], 0, 255, 0, 1)); // normalise to between 0 and 1 and apply easing

    push();
    // Calculate rotation to make the cylinder point outward from the center.
    // rotateZ() adjusts for the side-to-side angle
    let offset = params.centreSpikes ? frequencyBandAmplitude * params.sphereR * params.ampMultiplier / 2 : 0;
    let r = params.sphereR + offset;
    translate(p.x*r, p.y*r, p.z*r);
    
    
   // Align cylinder with the normal (the position vector itself)
    // Calculate the axis perpendicular to both the default cylinder axis (0,1,0) and the normal
    let defaultAxis = createVector(0, 1, 0);
    let normalV = p.copy().normalize();
    
    // Calculate rotation axis using cross product
    let rotAxis = defaultAxis.cross(normalV);
    
    // Calculate rotation angle using dot product
    let angle = acos(defaultAxis.dot(normalV));
    
    // Only rotate if there's a significant angle (avoid issues when vectors are parallel)
    if (rotAxis.mag() > 0.001) {
      rotAxis.normalize();
      rotate(angle, rotAxis);
    } else if (defaultAxis.dot(normalV) < 0) {
      // If vectors are opposite, rotate 180 degrees around any perpendicular axis
      rotate(PI, [1, 0, 0]);
    }

    // Set a fill color based on the frequency.
    
    // let saturation = map(amp, 0, 200, 50, 100);
    // let brightness = map(amp, 0, 200, 50, 100);
    colorMode(HSB, 360, 255, 255);
    fill(frequencyBandAmplitude*360, 255, 255);
    noStroke();
    let centreAdjustment = params.centreSpikes ? 0.5 : 1;
    let radius = params.columnRadius*min(height, width)/80;
    let nVal = params.applyBaseNoise ? noise(p.x/params.noiseZoom, p.y/params.noiseZoom + t, p.z/params.noiseZoom) * params.noiseMax : 0;
    let noisePert = nVal * width/2 * centreAdjustment;
    let h = frequencyBandAmplitude*params.sphereR*params.ampMultiplier * centreAdjustment + noisePert;
    const sides = 6;
    cylinder(radius, h, sides + 1);
    
    pop();
  }

  if(params.showCentralSphere){
    noStroke();
    fill(0);
    sphere(params.sphereR*0.999);
  }
  

  orbitControl();

}

/**
 * Generates an array of 3D points evenly distributed on the surface of a unit sphere
 * using the Fibonacci sphere algorithm. This method is also known as the Golden Spiral method.
 * It provides a near-uniform distribution of points without complex calculations.
 *
 * @param {number} numPoints The number of points to generate.
 * @returns {Array<Array<number>>} An array of points, where each point is an array [x, y, z].
 */
function fibonacciSphere(numPoints) {
    // Array to hold the generated points.
    const points = [];

    // The golden angle in radians, used to create the spiral.
    // This value is approximately 2.399963 radians.
    const goldenAngle = Math.PI * (3 - sqrt(5));

    for (let i = 0; i < numPoints; i++) {
        // Map the index 'i' to a value between -1 and 1 for the y-coordinate.
        // This distributes points vertically along the sphere's surface.
        const y = 1 - (i / (numPoints - 1)) * 2;

        // Calculate the radius of the circle at this 'y' level.
        // This is derived from the equation of a unit sphere: x^2 + y^2 + z^2 = 1
        const radius = sqrt(1 - y * y);

        // Calculate the angle for this point based on the golden angle.
        // This creates a spiral pattern as 'i' increases.
        const theta = goldenAngle * i;

        // Convert the cylindrical coordinates (radius, theta, y) to Cartesian coordinates (x, y, z).
        const x = cos(theta) * radius;
        const z = sin(theta) * radius;

        // Add the new point to the array.
        points.push(createVector(x,y,z));
    }

    return points;
}

function easeInOutElastic(x) {
const c5 = (2 * PI) / 4.5;

return x === 0
  ? 0
  : x === 1
  ? 1
  : x < 0.5
  ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
  : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
}

function easeInOutBack(x) {
const c1 = 1.70158;
const c2 = c1 * 1.525;

return x < 0.5
  ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
  : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

function easeInOutSine(x) {
return -(cos(PI * x) - 1) / 2;
}

function linear(x){
  return x;
}

function quadratic(x){
  return x*x;
}