/*
| Author          | Project Somedays                    
| Title           | WCCChallenge 2026 Week 26 - "Fluid"
| 📅 Started      | 2025-06-28
| 📅 Completed    | 2025-06-28       
| 🕒 Taken        | 1hr of tinkering             
| 🤯 Concept      | Schlieren Imaging
| 🔎 Focus        | Trying to follow along
| 🤖 AI-use       | Vibe-coding but asking it to teach me along the way

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

I've been fascinated by Schlieren imaging ever since seeing this Veritasium video: https://www.youtube.com/watch?v=4tgOyU34D44
(Omg, that was 9 years ago 🫣)
Curious to see how far I'd get to replicating it

👉INTERACTION👈
- Set the background colour how you like!

📦RESOURCES📦
- lil-gui
- Gemini
- p5.strands for the win!

🤔TO IMPROVE🤔

 
🎓LESSONS LEARNED🎓

*/

let params, gui;

let flameLayer;
let schlierenShader;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    // setting up some colour selections
    gui = new lil.GUI();
    params = {
        bgColour: '#324848',
        darkColour: '#000000'
    }

    gui.addColor(params, 'bgColour');
    gui.addColor(params, 'darkColour');

    flameLayer = createGraphics(windowWidth, windowHeight);
    rectMode(CENTER);

    schlierenShader = buildColorShader(schlierenLogic);


    
}

function draw() {
    background(params.bgColour);

    shader(schlierenShader);
    
    // Shift the WebGL origin from the center back to the top-left
    // so all your existing 2D math still works perfectly.
    
    
    fill(params.darkColour);
    // table
    rect(0, height*0.45, width, height*0.2);
    
    // candle
    rect(0, height*0.25, width/10, height*0.25);
    // wick
    rect(0, height*0.15, width/50, height/10);    
    
    // flame
    // flameLayer.clear(); // Wipe the buffer from the previous frame
    // createFlame(flameLayer); // Pass the buffer into your drawing function
    // image(flameLayer, 0, 0); // Draw the 2D buffer onto the 3D canvas
    filter(heatFilter);
}

function createFlame(g) {
    // 1. Define the core dimensions and position
    let baseX = 0;
    let baseY = height * 0.1; // Base of the flame
    let flameHeight = height * 0.15;
    let flameWidth = width * 0.1; // This is half the total width (radius)

    // 2. Calculate the wobbly tip using Perlin noise
    // We offset the tip's X position to simulate wind/flicker
    let tipWobble = map(noise(frameCount * 0.05), 0, 1, -flameWidth, flameWidth);
    let tipX = baseX + tipWobble;
    let tipY = baseY - flameHeight + tipWobble;

    
    g.noStroke();
    g.fill("#FEDE17");

    // console.log(basePathX, flameWidth, tipX, tipY, flameHeight);
    g.beginShape();
    
    // // Start at the bottom center of the flame
    g.vertex(baseX, baseY);

    // // --- LEFT SIDE OF FLAME ---
    // // We pull the bottom left out, and pull the top left straight down from the tip
    // g.vertex(-(basePathX + tipX)/2, (basePathY + tipY)/2);
    g.bezierVertex(
        baseX - flameWidth, baseY,
        tipX, tipY,
        tipX, tipY
    )
    // g.bezierVertex(
    //     basePathX - flameWidth, basePathY,           // CP1: Pull out to the bottom left
    //     tipX, tipY + (flameHeight * 0.4),            // CP2: Pull straight down from the wobbling tip
    //     tipX, tipY                                 // Anchor: The tip itself
    // );

    // // --- RIGHT SIDE OF FLAME ---
    // // We pull the top right straight down from the tip, and pull the bottom right out
    // g.vertex((basePathX + tipX)/2, (basePathY + tipY)/2);
    // g.bezierVertex(
    //     tipX, tipY + (flameHeight * 0.4),            // CP3: Pull straight down from the wobbling tip
    //     basePathX + flameWidth, basePathY,           // CP4: Pull out to the bottom right
    //     basePathX, basePathY                         // Anchor: Back to the base
    // );
    
    g.endShape(CLOSE);
    
    
    
}

function schlierenLogic() {
    // Intercept the fragment shader's output color
    finalColor.begin();
    
    // Grab the 0-1 coordinates of the current pixel on the plane
    let coord = finalColor.texCoord;
    
    // Create a time variable for continuous flow
    let time = millis() / 1000.0; 
    
    // Scale the coordinates so the noise pattern isn't too microscopic
    let scale = 15.0; 
    let x = coord.x * scale;
    // Subtract time from the Y axis so the "heat" flows upwards
    let y = (coord.y * scale) - time; 
    
    // Calculate the density (noise) at the current point
    let baseDensity = noise(x, y);
    
    // Calculate the density a tiny fraction to the right
    let epsilon = 0.05; 
    let offsetDensity = noise(x + epsilon, y);
    
    // Calculate the gradient (first derivative) 
    let delta = (offsetDensity - baseDensity) / epsilon;
    
    // Map the output. 0.5 is our baseline gray.
    // A positive gradient pushes toward white, negative toward black.
    let intensity = 1.0; // Increase this to make the contrast harsher
    let brightness = 0.5 + (delta * intensity);
    
    // Output the final grayscale color [R, G, B, Alpha]
    finalColor.set([brightness, brightness, brightness, 1.0]);
    
    finalColor.end();
}