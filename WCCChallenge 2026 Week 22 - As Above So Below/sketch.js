/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 22 - "As Above So Below"
| 📅 Started      | 2025-05-29
| 📅 Completed    | 2025-05-31       
| 🕒 Taken        | 2hrs                     
| 🤯 Concept      | Cumulative spiralling columns
| 🔎 Focus        | Back to basics
| 🤖 AI-use       | To quickly add more adjustments and iterate

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Going back to basics and just drawing lots of cylinders cumulatively to the page with some noise

📃THE ALGORITHM📃
- Starting from the centre of the screen, draw a ring of cylinders that fluctuating in radius and spin the whole thing


👉INTERACTION👈
Play with the controls

📦RESOURCES📦
- Coolors.co

🤔TO IMPROVE🤔


*/

let gui, params, directionOptions, columnOptions;

const palettes = {
    "Default": "#331832, #d81e5b, #f0544f, #c6d8d3, #fdf0d5".split(", "),
    "Funky Neon": "#42047e, #07f49e".split(", "),
    "Twilight Firecracker" : "#08415c, #cc2936".split(", "),
    "Royal Blue": "#9bafd9, #103783".split(", "),
    "Navy Ivory Delight": "#083d77, #ebebd3".split(", "),
    "Dark Sorcery": "#002642, #840032".split(", ")
}

let palette = palettes.Default;
let n = 12;
let ySpeed = 0.25;
let yVal = 0;
let globalAngleVal = 0;
let localAngleVal = 0;
let columnProgressionVal = 0;
let spreadVal;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    background(0);
    noStroke();
    spreadVal = width/12;

    gui = new lil.GUI();
    params = {
        currentPalette : "Default",
        columns: 12,
        resetOnColumnChange: true,
        ySpeed: 0.25,
        reset: () => {
            background(0);
            yVal = 0;
            spreadVal = width/12;
            localAngleVal = 0;
            globalAngleVal = 0;
        },
        lightsTrackWithYVal: true,
        globalAngleFunction: getBidirectionalAngle,
        globalAngleProgRate: 0.001,
        localAngleFunction: getBidirectionalAngle,
        globalBidirectionalAngleLowerLim: -PI,
        globalBidirectionalAngleUpperLim: PI,
        uniDirectionalAngleRate: 0.005,
        systemSpread: width/4,
        columnWidthMin: width/32,
        columnWidthMax: width/64,
        spreadRate: 0.1,
        columnProgressionRate: 0.005,
    }

    gui.add(params, 'currentPalette', Object.keys(palettes)).onChange((selection) => palette = palettes[selection]);
    gui.add(params, 'resetOnColumnChange');
    gui.add(params, 'columns', 3, 15, 1).onFinishChange((val) => { 
        n = val
        if(params.resetOnColumnChange) params.reset();
    });
    gui.add(params, 'ySpeed', 0.1, 1).onFinishChange((val) => ySpeed = val);
    gui.add(params, 'reset');
    gui.add(params, 'lightsTrackWithYVal');
    
    directionOptions = gui.addFolder("Direction Options");
    directionOptions.add(params, 'globalAngleFunction', {
        "Bidirectional" : getBidirectionalAngle,
        "Unidirectional": getUniDirectionalAngle
    });
    directionOptions.add(params, 'globalAngleProgRate', 0, 0.05, 0.001).name("Global Angle Rate");
    directionOptions.add(params, 'uniDirectionalAngleRate', 0, 0.05, 0.001).name("Uni Direction Rate");
    directionOptions.add(params, 'globalBidirectionalAngleLowerLim', -TWO_PI, 0, 0.1).name("Bi Angle Lower");
    directionOptions.add(params, 'globalBidirectionalAngleUpperLim', 0, TWO_PI, 0.1).name("Bi Angle Upper");

    columnOptions = gui.addFolder("Column Options");
    columnOptions.add(params, 'spreadRate', 0, 1, 0.01);
    columnOptions.add(params, 'columnProgressionRate', 0, 0.01, 0.001).name("Progression Rate");
    columnOptions.add(params, 'columnWidthMin', 1, width / 8, 1).name("Min Width");
    columnOptions.add(params, 'columnWidthMax', 1, width / 4, 1).name("Max Width");
    columnOptions.add(params, 'systemSpread', 0, width / 2, 1).name("System Spread");

}

function draw() {
    // directionalLight(255, 0, 0, -1, 0, -1);
    yVal += ySpeed;
    globalAngleVal += params.globalAngleProgRate;
    columnProgressionVal += params.columnProgressionRate;
    spreadVal += params.spreadRate;

    if(params.lightsTrackWithYVal){
        pointLight(255, 255, 255, 0, yVal, 0);
        pointLight(255, 255, 255, 0, -yVal, 0);
    } else{
        pointLight(255, 255, 255, 0, 0, 0);
    }
    
    // global rotation
    // let a = map(noise(-1000 + frameCount * 0.001), 0, 1, -PI, PI);
    push();
    // apply
    rotateY(globalAngleVal);

    for(let i = 0; i < params.columns; i++){
        // set the radius for the column
        let r = map(noise(columnProgressionVal + 5000 * i), 0, 1, params.columnWidthMin, params.columnWidthMax);
        // get the angle offset for that column
        let a2 = i * TWO_PI/n;
        push();
        // rotate to the correct angle position
        rotateY(a2);
        // move out from the centre
        translate(spreadVal, 0, 0);
        // top bits
        fill(palette[0]);
        push();
        // move up to the current yVal
        translate(0,yVal,0);
		  // rotateX(HALF_PI);
        cylinder(r, ySpeed);
        pop();

        fill(palette[1]);
        push();
        // do the same for the below yVal
        translate(0,-yVal,0);
		  // rotateX(HALF_PI);
        cylinder(r, ySpeed);
        pop();
        pop();
    }

    pop();
   
    // pointLight()

    

}

function getBidirectionalAngle(offset){
    return map(noise(offset + globalAngleProgRate), 0, 1, params.globalBidirectionalAngleLowerLim, globalBidirectionalAngleUpperLim);
}

function getUniDirectionalAngle(val){
    val += params.uniDirectionalAngleRate
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight, WEBGL);
}

