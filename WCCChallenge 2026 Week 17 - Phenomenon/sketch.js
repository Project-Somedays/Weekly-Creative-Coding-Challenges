/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 16 - "Flip"
| 📅 Started      | 2025-04-19 
| 📅 Completed    | 2025-04-19       
| 🕒 Taken        | ~45 mins of rushing                     
| 🤯 Concept      | Jump and Flip
| 🔎 Focus        | Transformations
| 🤖 AI-use       | Bug-fixes

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Very short on time this week, but I'm constantly fascinated by slight temporal offsets and easing functions.
Never gets boring for me 😊

📃The Algorithm📃
On landing, choose a random target rotation in the x,y,z axis
While in the air, lerp to the next value using the easing function to make it more interesting


👉INTERACTION👈
Sit back and enjoy

📦RESOURCES📦
- Easings.net

🤔TO IMPROVE🤔
- Add some controls to change the initial offset etc

*/

let cubeSize;
let cubes = [];
let t = 0;

let elasticProgress = 0;
let linearProgress = 0;
let currentlyRotating = "FRONT";
let rotationDirection = 1;
const perturbationAmp = Math.PI/12;
let gui, params;
let a = 0;

let relevantCubes = [];
let cols = {
    yellow: "#ffff00",
    red: "#ff0000",
    blue: "#0000ff",
    green: "#00ff00",
    orange: "#FFBF00",
    white: "#FFFFFF"
}

let colourSlots = "yellow, red, blue, green, orange, white".split(", ");

let palettes = {
    "Classic": "#ffff00, #ff0000, #0000ff, #00ff00, #ffBf00, #ffffff",
    "Summer Sunset Paradise": "#ef476f, #f78c6b, #ffd166, #06d6a0, #118ab2, #073b4c",
    "Fiery Ocean Sunset": "#fd5901, #f78104, #faab36, #249ea0, #008083, #005f60",
    "Berrylicious Night Sky": "#fd0363, #cc095d, #9c1057, #6b1650, #3b1d4a, #0a2344",
    "Deepsea Adventure": "#051720, #03273c, #003554, #004d74, #006494, #006da4"
}

const rotatingSides = ["FRONT", "BACK", "TOP", "BOTTOM", "LEFT", "RIGHT"];

function setup(){
    createCanvas(min(windowHeight, windowWidth), min(windowHeight, windowWidth), WEBGL);
    noStroke();
    rectMode(CENTER); // Centers 2D primitives like square()
    cubeSize = height * 0.15
    gui = new lil.GUI();
    params = {
        perturbationAmp: PI/12,
        palette: "Classic",
        anticipationFollowThrough: true,
        globalRotation: true,
        globalRotationRate: 0.0025,
        cycleFrames: 45,
    }

    gui.add(params, 'perturbationAmp', PI/100, QUARTER_PI);
    gui.add(params, 'palette', palettes).onChange(newPaletteString => onPaletteChange(newPaletteString));
    gui.add(params, 'anticipationFollowThrough');
    gui.add(params, 'globalRotation');
    gui.add(params, 'globalRotationRate', 0.001, 0.01);
    gui.add(params, 'cycleFrames', 30, 180, 1);


    for(let i = -1; i <= 1; i++){
        for(let j = -1; j <= 1; j++){
            for(let k = -1; k <= 1; k++){
                let newCube = new RubikCubeBlock(i, j, k);
                cubes.push(newCube);
            }
        }
    }
    stroke(0); 
    strokeWeight(4);

    console.log(cubes[0]);
}

function onPaletteChange(newPaletteString) {
    // 1. Generate the new map
    let newCols = mapPaletteToSides(newPaletteString);
    
    // 2. Overwrite the global colors
    cols = newCols; 
    
    // 3. Force all existing cubes to grab the new colors
    for (let c of cubes) {
        c.mapColour2Sides(); 
    }
}

function mapPaletteToSides(paletteString) {
    // 1. Split the incoming string into an array of hex codes
    let hexCodes = paletteString.split(", ");
    let colourMap = {};

    // 2. Loop through using the index to "zip" them together
    for (let i = 0; i < colourSlots.length; i++) {
        let slotName = colourSlots[i];      // e.g., "yellow"
        let hexValue = hexCodes[i];         // e.g., "#ffff00"
        
        colourMap[slotName] = hexValue; 
    }
    
    return colourMap;
}



function drawPlaneFromSide(side){
    // WebGL planes draw facing the Z-axis by default. 
    // We translate by half the cubeSize to push them to the surface, then rotate.
    let halfSize = cubeSize / 2;
    
    switch(side){
        case "FRONT":
            push(); translate(0, 0, halfSize); square(0, 0, cubeSize); pop();
            break;
        case "BACK": 
            // Don't forget the back face!
            push(); translate(0, 0, -halfSize); rotateY(PI); square(0, 0, cubeSize); pop();
            break;
        case "LEFT": 
            push(); translate(-halfSize, 0, 0); rotateY(-HALF_PI); square(0, 0, cubeSize); pop();
            break;
        case "RIGHT":
            push(); translate(halfSize, 0, 0); rotateY(HALF_PI); square(0, 0, cubeSize); pop();
            break;
        case "TOP":
            // p5.js Y-axis points down, so negative Y is up.
            push(); translate(0, -halfSize, 0); rotateX(HALF_PI); square(0, 0, cubeSize); pop();
            break;
        case "BOTTOM":
            push(); translate(0, halfSize, 0); rotateX(-HALF_PI); square(0, 0, cubeSize); pop();
            break;
    }
}


function draw(){
    background(0);
    orbitControl();
    a += params.globalRotationRate;

    if(params.globalRotation){
        rotateY(a);
        rotateX(a);
        rotateZ(a);
    }
    

    t = frameCount % params.cycleFrames;
    elasticProgress = easeInOutElastic(t/params.cycleFrames);
    linearProgress = t / params.cycleFrames;

    if(t === 0){
        remapColours(relevantCubes, currentlyRotating, rotationDirection);
        currentlyRotating = random(rotatingSides);
        relevantCubes = getRelevantCubesforRotation(currentlyRotating);
        rotationDirection = random([-1, 1]);
    }
    
    push();
    if(params.anticipationFollowThrough) applyGlobalPerturbation(currentlyRotating, rotationDirection, linearProgress);
    // draw the rotating cubes  
    for(let c of relevantCubes){
        push();
        rotateFromSideAndDir(currentlyRotating, elasticProgress, rotationDirection);
        c.show();
        pop();
    }

    // draw the rest
    let otherCubes = cubes.filter(c => !relevantCubes.includes(c));
    for(let c of otherCubes){
        c.show();
    }

    pop();

}

function applyGlobalPerturbation(currentlyRotating, rotationDirection, linearProgress){
    
    // Generates a smooth curve that dips negative, swings positive, and settles at 0
    let wobble = -sin(TWO_PI * linearProgress) * params.perturbationAmp;

    switch(currentlyRotating){
        case 'FRONT':
        case 'BACK':
            rotateZ(-rotationDirection * wobble);
            break;
        case 'LEFT':
        case 'RIGHT':
            rotateX(-rotationDirection * wobble);
            break;
        case 'TOP':
        case 'BOTTOM':
            rotateY(-rotationDirection * wobble);
            break;
    }
}

function remapColours(relevantCubes, side, dir) {
    // Deep copy the current state
    let buffer = cubes.map(c => ({
        pos: c.pos.copy(),
        sides: { ...c.sides }
    }));

    for(let c of relevantCubes) {
        let lookupX, lookupY, lookupZ, sourceCube;

        switch(side) {
            case "TOP":
            case "BOTTOM":
                // Y-Axis Rotation. Visual rotation uses -dir
                let dirY = -dir;
                
                // FIX 1: INVERTED lookup signs for correct source mapping
                lookupX = c.pos.z * -dirY; 
                lookupY = c.pos.y; 
                lookupZ = c.pos.x * dirY;
                
                sourceCube = buffer.find(b => b.pos.x === lookupX && b.pos.y === lookupY && b.pos.z === lookupZ);

                if(sourceCube){
                    c.sides["TOP"] = sourceCube.sides["TOP"];
                    c.sides["BOTTOM"] = sourceCube.sides["BOTTOM"];
                    
                    // FIX 2: REVERSED face mappings to match the visual spin
                    if (dirY === 1) { 
                        c.sides["FRONT"] = sourceCube.sides["LEFT"];
                        c.sides["RIGHT"] = sourceCube.sides["FRONT"];
                        c.sides["BACK"]  = sourceCube.sides["RIGHT"];
                        c.sides["LEFT"]  = sourceCube.sides["BACK"];
                    } else { 
                        c.sides["FRONT"] = sourceCube.sides["RIGHT"];
                        c.sides["LEFT"]  = sourceCube.sides["FRONT"];
                        c.sides["BACK"]  = sourceCube.sides["LEFT"];
                        c.sides["RIGHT"] = sourceCube.sides["BACK"];
                    }
                }
                break;

            case "FRONT":
            case "BACK":
                // Z-Axis Rotation. FRONT uses dir, BACK uses -dir in your visual logic
                let dirZ = (side === "FRONT") ? dir : -dir;
                lookupX = c.pos.y * dirZ;
                lookupY = c.pos.x * -dirZ;
                lookupZ = c.pos.z;

                sourceCube = buffer.find(b => b.pos.x === lookupX && b.pos.y === lookupY && b.pos.z === lookupZ);

                if(sourceCube){
                    c.sides["FRONT"] = sourceCube.sides["FRONT"];
                    c.sides["BACK"] = sourceCube.sides["BACK"];

                    if (dirZ === 1) { 
                        c.sides["TOP"] = sourceCube.sides["LEFT"];
                        c.sides["RIGHT"] = sourceCube.sides["TOP"];
                        c.sides["BOTTOM"] = sourceCube.sides["RIGHT"];
                        c.sides["LEFT"] = sourceCube.sides["BOTTOM"];
                    } else { 
                        c.sides["TOP"] = sourceCube.sides["RIGHT"];
                        c.sides["RIGHT"] = sourceCube.sides["BOTTOM"];
                        c.sides["BOTTOM"] = sourceCube.sides["LEFT"];
                        c.sides["LEFT"] = sourceCube.sides["TOP"];
                    }
                }
                break;

            case "LEFT":
            case "RIGHT":
                // X-Axis Rotation. Both use -dir in your visual logic
                let dirX = -dir;
                lookupX = c.pos.x;
                lookupY = c.pos.z * dirX;
                lookupZ = c.pos.y * -dirX;

                sourceCube = buffer.find(b => b.pos.x === lookupX && b.pos.y === lookupY && b.pos.z === lookupZ);

                if(sourceCube){
                    c.sides["LEFT"] = sourceCube.sides["LEFT"];
                    c.sides["RIGHT"] = sourceCube.sides["RIGHT"];

                    if (dirX === 1) { 
                        c.sides["TOP"] = sourceCube.sides["FRONT"];
                        c.sides["BACK"] = sourceCube.sides["TOP"];
                        c.sides["BOTTOM"] = sourceCube.sides["BACK"];
                        c.sides["FRONT"] = sourceCube.sides["BOTTOM"];
                    } else { 
                        c.sides["TOP"] = sourceCube.sides["BACK"];
                        c.sides["BACK"] = sourceCube.sides["BOTTOM"];
                        c.sides["BOTTOM"] = sourceCube.sides["FRONT"];
                        c.sides["FRONT"] = sourceCube.sides["TOP"];
                    }
                }
                break;
        }
    }
}

class RubikCubeBlock{
    constructor(row,col,layer){
        this.pos = createVector(row, layer, col);
        this.sides = {}
        this.mapColour2Sides();
    }

    mapColour2Sides(){
        // put in left and right sides where relevant
        switch(this.pos.x){
            case -1:
                this.sides["LEFT"] = cols.yellow;
                break;
            case 0:
                break;
            case 1:
                this.sides["RIGHT"] = cols.blue;
                break
        }

        switch(this.pos.y){
            case -1:
                this.sides["TOP"] = cols.red;
                break;
            case 0:
                break;
            case 1:
                this.sides["BOTTOM"] = cols.green;
                break
        }

        switch(this.pos.z){
            case -1:
                this.sides["BACK"] = cols.orange;
                break;
            case 0:
                break;
            case 1:
                this.sides["FRONT"] = cols.white;
                break
        }
}

    show(){
        push();
        // Spaced out by the full cubeSize so they don't overlap
        translate(this.pos.x * cubeSize, this.pos.y * cubeSize, this.pos.z * cubeSize);
        
        for(let side of Object.keys(this.sides)){
            // Bracket notation for dynamic keys
            fill(this.sides[side]);
            drawPlaneFromSide(side);
        } 
        pop();
    }
}


function getRelevantCubesforRotation(side){
    switch(side){
        case "FRONT":
            // rotate all pieces
            return cubes.filter(c => c.pos.z === 1)
            break;
        case "BACK":
            return cubes.filter(c => c.pos.z === -1)
            break;
        case "LEFT":
            // rotate all pieces
            return cubes.filter(c => c.pos.x === -1)
            break;
        case "RIGHT":
            return cubes.filter(c => c.pos.x === 1)
            break;
        case "TOP":
            // rotate all pieces
            return cubes.filter(c => c.pos.y === -1)
            break;
        case "BOTTOM":
            return cubes.filter(c => c.pos.y === 1)
            break;
            
    }
}

function rotateFromSideAndDir(side, progress, dir){
    switch(side){
        case "FRONT":
            rotateZ(HALF_PI * progress * dir)
            break;
        case "BACK":
            rotateZ(HALF_PI * progress * -dir)
            break;
        case "LEFT":
           rotateX(HALF_PI * progress * -dir)
            break;
        case "RIGHT":
            rotateX(HALF_PI * progress * -dir)
            break;
        case "TOP":
            rotateY(HALF_PI * progress * -dir)
            break;
        case "BOTTOM":
            rotateY(HALF_PI * progress * -dir)
            break;
            
    }
}




function easeInOutElastic(x) {
const c5 = (2 * Math.PI) / 4.5;

return x === 0
  ? 0
  : x === 1
  ? 1
  : x < 0.5
  ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
  : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}

function windowResized(){
    resizeCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
    cubeSize = height * 0.15;
}
