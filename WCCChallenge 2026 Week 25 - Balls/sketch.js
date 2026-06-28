/*
| Author          | Project Somedays                    
| Title           | WCCChallenge 2026 Week 25 - "(Invisi)Balls"
| 📅 Started      | 2025-06-21
| 📅 Completed    | 2025-06-21       
| 🕒 Taken        | 1hr of tinkering             
| 🤯 Concept      | Negative space Inivisballs
| 🔎 Focus        | Keeping it simple
| 🤖 AI-use       | Investigating why onFinishChange was doing me a dirty for a while there

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b



👉INTERACTION👈
Orbit Control On

📦RESOURCES📦
- Looked up the formula for the height of the circle depending on the distance from the centre

🤔TO IMPROVE🤔
- Implement in Three.js OR using a shader
 
🎓LESSONS LEARNED🎓
- Turns out onFinishChange still live-updates the parameter so you have to decouple it to have the action happen at the end of moving the slider
*/

let pts = [];
let invisiBalls = [];
let R;

let gui, params;

let bgColours = "#76030f, #65071e, #550b2c, #440f3b, #33134a, #231758, #121b67".split(", ");
let bgColourIndex = 0;
let lerpColourAmount = 0;
let yRotation = 0;
let needsGridUpdate = false;
let gridResolution;

const getHeight = (dSqr) => sqrt(R*R - dSqr);

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(30);
    pixelDensity(1);
    stroke(255);
    noFill();

    bgColours = bgColours.map(e => color(e));
    
    gui = new lil.GUI();

    params = {
        ballCount : 2,
        colourTransitionFrames: 150,
        ballMovementRate: 0.015,
        rotateMode: true,
        trailDecayRate: 0.1,
        invisiBallRadius: width/15,
        gridResolution: 50,
        rotationRate: 0.005
    };

    gui.add(params, 'rotateMode');
    gui.add(params, 'ballCount', 1, 5, 1).onFinishChange(() => {
        spawnBalls();
        initGrid();
    });
    gui.add(params, 'colourTransitionFrames', 30, 600, 30);
    gui.add(params, 'invisiBallRadius', width/20, width/10, 1).onFinishChange((newVal) => R = newVal);
    gui.add(params, 'ballMovementRate', 0.001, 0.1, 0.001);
    gui.add(params, 'trailDecayRate', 0.001, 1, 0.001);
    gui.add(params, 'gridResolution', 10, 100, 5).onFinishChange(() => needsGridUpdate = true);
    gui.add(params, 'rotationRate', 0.001, 0.01, 0.001).onFinishChange(() => {}); // doesn't update until you've let it go

    R = params.invisiBallRadius;
    gridResolution = params.gridResolution;
    
    camera(0, -width, width);

    spawnBalls();
    
    initGrid();
}

function draw() {
    // grid update
    if(needsGridUpdate){
        gridResolution = params.gridResolution;
        initGrid();
        needsGridUpdate = false;
    }


    // increment background colour in a cycle
    if(frameCount % params.colourTransitionFrames === 0){
        bgColourIndex = (bgColourIndex + 1)%bgColours.length;
        lerpColourAmount = 0;
    }
    lerpColourAmount += 1/params.colourTransitionFrames;
    let bgColour = lerpColor(bgColours[bgColourIndex], bgColours[(bgColourIndex + 1)%bgColours.length], lerpColourAmount);
    background(bgColour);

    yRotation += params.rotationRate;
    rotateY(yRotation); 

    // move the balls around
    for(let i = 0; i < params.ballCount; i++){
        let x = map(noise(frameCount*0.015 + i * 10000), 0, 1, -width/1.5, width/1.5);
        let z = map(noise(frameCount*0.015 + (i + 1) * 10000), 0, 1, -width/1.5, width/1.5);
        if(invisiBalls[i]) invisiBalls[i].set(x,0,z);
    }

    // update pts
    for(let i = 0; i < gridResolution; i++){
        for(let j = 0; j < gridResolution; j++){
            for(let k = 0; k < invisiBalls.length; k++){
                let index = i*gridResolution + j;
                let pt = pts[index];
                if(!invisiBalls[k]) continue;
                let dSqr = (pt.x - invisiBalls[k].x)*(pt.x - invisiBalls[k].x) + (pt.z - invisiBalls[k].z)*(pt.z - invisiBalls[k].z);
                let y = dSqr < R*R ? getHeight(dSqr) : 0;
                pts[index].y = max(y, pts[index].y); // update
                // calculate spring back
                pts[index].y = constrain(pts[index].y -= params.trailDecayRate, 0, R)
            }
            
        }
    }

    // draw the gridlines one way
    for(let i = 0; i < gridResolution; i++){
        beginShape();
        for(let j = 0; j < gridResolution; j++){
            let pt = pts[i*gridResolution + j];
            vertex(pt.x, pt.y, pt.z);
        }
        endShape();
    }

    // then the other way
   for(let j = 0; j < gridResolution; j++){
        beginShape();
        for(let i = 0; i < gridResolution; i++){
            let pt = pts[i*gridResolution + j];
            vertex(pt.x, pt.y, pt.z);
        }
        endShape();
    }


    // look around if you like
    orbitControl();

}

function spawnBalls(){
    invisiBalls = [];
    for(let i = 0; i < params.ballCount; i++){
        invisiBalls.push(createVector(0,0,0));
    }
}

function initGrid(){
    pts = [];
    for(let i = 0 ; i < gridResolution; i++){
        for(let j = 0; j < gridResolution; j++){
            let x = -width/2 + i*width/gridResolution;
            let z = - width/2 + j*width/gridResolution;
            pts.push(createVector(x,0,z));
        }
    }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
