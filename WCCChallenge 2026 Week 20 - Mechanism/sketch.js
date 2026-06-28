/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 20 - "Mechanism"
| 📅 Started      | 2025-05-17 
| 📅 Completed    | 2025-05-17       
| 🕒 Taken        | 3hrs                     
| 🤯 Concept      | The Mix Master: a wonder of domestic engineering 
| 🔎 Focus        | Doing what should really be done on a GPU on a CPU
| 🤖 AI-use       | Lots of bug hunting... and then in iterating it took over the drag mechanic

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Building off an old project from Genuary 2024 "No Colour Palettes" where I did a paint swirling kind of effect
https://openprocessing.org/@Project-Somedays/2135131 (sidenote: the new URLs are neat for OpenProcessing subscribers!)

Using a Mix Master "Mechanism" to smear pixels

📃THE ALGORITHM📃
- Start with a grid of coloured squares (set by 2D perlin noise) and the idea of mix master blades
- Measure the distance to each blade
- If close enough, drag that coloured square along in the direction of the blade
- Set the strength of that drag by the distance: close = lots of drag, far = quadratic drop-off


👉INTERACTION👈
Some controls to play with

📦RESOURCES📦
- Coolors.co
- Gemini

🤔TO IMPROVE🤔
- Fix that initial appearnace on the screen
- Implement as a shader
- Give the option to start the warp from an image




*/


let palettes = {
    "Gradient Blues": "#7400b8, #6930c3, #5e60ce, #5390d9, #4ea8de, #48bfe3, #56cfe1, #64dfdf, #72efdd, #80ffdb".split(", "),
    "Purple Raindrops": "#f72585, #b5179e, #7209b7, #560bad, #480ca8, #3a0ca3, #3f37c9, #4361ee, #4895ef, #4cc9f0".split(", "),
    "Ocean Sunset": "#001219, #005f73, #0a9396, #94d2bd, #e9d8a6, #ee9b00, #ca6702, #bb3e03, #ae2012, #9b2226".split(", "),
    "Purple Cascade": "#2d00f7, #6a00f4, #8900f2, #a100f2, #b100e8, #bc00dd, #d100d1, #db00b6, #e500a4, #f20089".split(", "),
    "Vibrant Citrus Burst": "#f56a00, #fa8b01, #ffad03, #ffc243, #ffcf70, #cea7ee, #b67be6, #9d4edd, #72369d, #461e5c".split(", "),
    "Midnight Ocean Depths": "#11151c, #151b25, #19212e, #212d40, #273246, #2c374b, #313c51, #343f54, #364156, #485265".split(", ")
}
let palette = palettes["Gradient Blues"];
let mixMaster;

let grid = [];
let s;
const res = 150;
let smearLayer;

let gui, params;


function setup() {
    createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
    pixelDensity(1);
    mixMaster = new MixMaster(width/2, height/2);
    s = width/res;
    rectMode(CENTER);
    stroke(255);
    noFill();
    
    smearLayer = createGraphics(width, height);
    smearLayer.noStroke();
    smearLayer.rectMode(CENTER);

    gui = new lil.GUI();
    params = {
        showBeaters: false,
        smearMode: true,
        beaterSpeed: 1,
        roamSpeed: 2.5,
        opacity: 0.2,
        beaterSize: width/5,
        initialNoiseSplotchSize: 100,
        gridRes: 100,
        palette: "Gradient Blues",
        changesWipesBackground: true,
    };

    gui.add(params, 'smearMode');
    gui.add(params, 'gridRes', 20, 200, 1).onFinishChange(() => {
        if(!params.changesWipesBackground) smearLayer.clear();
        grid = []; // Empty the array first!
        s = width/params.gridRes;
        setInitialGrid();
    });
    gui.add(params, 'showBeaters');
    gui.add(params, 'opacity', 0, 1, 0.1).onChange(newOpacity =>{
        for(let g of grid){
            g.col.setAlpha(int(255*newOpacity));
        }
    });
    gui.add(params, 'roamSpeed', 0.5, 5, 0.1);
    gui.add(params, 'beaterSpeed', 0.1, 6, 0.1);
    gui.add(params, 'beaterSize', width/10, width/3, 1);
 
    gui.add(params, 'initialNoiseSplotchSize', 1, 500).onFinishChange(() => {
        if(!params.changesWipesBackground); // Good idea to clear the background here too
        grid = [];     // Empty the array here as well
        setInitialGrid();
    });

    gui.add(params, 'palette', Object.keys(palettes)).onChange(() => {
        palette = palettes[params.palette];
        grid = [];
        if(!params.changesWipesBackground) smearLayer.clear();
        setInitialGrid();
    })
    gui.add(params, 'changesWipesBackground');


    // setting up the initial grid
    setInitialGrid();
}

function draw() {
    // 1. ALWAYS clear the main canvas so beaters stay crisp
    background(0);

    // 2. Clear the smear buffer ONLY if we aren't smearing
    if (!params.smearMode) {
        smearLayer.clear();
    }
    
    // 3. Do all the math and draw squares to the smear buffer
    mixMaster.update();
    mixMaster.applyDrag(grid);
    
    for (let g of grid) {
        g.show();
    }

    // 4. Paint the smear buffer onto the fresh main canvas
    image(smearLayer, 0, 0);

    // 5. Draw the beaters crisp and clean on top of everything
    if (params.showBeaters) {
        mixMaster.show();
    }

    
}

function setInitialGrid(){
    s = width/params.gridRes;
    for(let i = 0; i < params.gridRes; i++){
        for(let j = 0; j < params.gridRes; j++){
            let x = (0.5 + i) * s;
            let y = (0.5 + j) * s;
            let c = int(map(noise(x/params.initialNoiseSplotchSize, y/params.initialNoiseSplotchSize), 0, 1, 0, palette.length));
            grid.push(new GridSquare(x,y, palette[c]));
        }
    }
}

function keyPressed(){
    if(key === ' ') showOverlay = !showOverlay;
}


// Change parameter from spinDirection to bladeVelocity
function dragGridSquare(gridSquare, bladePos, beaterCenter, bladeVelocity){
    
    // 1. FAST FAIL: The Bounding Box Check
    if (gridSquare.p.x < bladePos.x - params.beaterSize || 
        gridSquare.p.x > bladePos.x + params.beaterSize ||
        gridSquare.p.y < bladePos.y - params.beaterSize || 
        gridSquare.p.y > bladePos.y + params.beaterSize) {
        return; 
    }
    
    // 2. EXPENSIVE CHECK: True Distance
    let d = p5.Vector.dist(gridSquare.p, bladePos);
    if(d > params.beaterSize) return;

    let dragStrength = easeInOutQuad(map(d, 0, params.beaterSize, 1, 0));
    let radiusVec = p5.Vector.sub(gridSquare.p, beaterCenter);

    // 4. Calculate rotation using the TRUE world velocity of the blade!
    // We no longer need baseSpeed or spinDirection.
    // bladeVelocity already has the correct magnitude and sign (+/-).
    // Multiply by 0.8 to keep the "falling behind" fluid effect.
    let angleToRotate = bladeVelocity * dragStrength * 0.8; 

    // 5. Rotate the radius vector and apply the new position
    radiusVec.rotate(angleToRotate);
    gridSquare.p = p5.Vector.add(beaterCenter, radiusVec);
}


class GridSquare{
    constructor(x,y, col){
        this.p = createVector(x,y);
        this.col = color(col);
        this.col.setAlpha(50);
    }

    show(){
        smearLayer.fill(this.col);
        smearLayer.square(this.p.x, this.p.y, s);
    }
}


class MixMaster{
    constructor(x,y){
        this.p = createVector(x,y);
        this.r = 0.9 * width/4;
        this.blades = [];
        this.a = 0;

        this.assemblyAngle = 0; 
        this.leftCenter = createVector();
        this.rightCenter = createVector();

        this.nx = random(1000);
        this.ny = random(1000);
        for(let i = 0 ; i < 8; i++){
            this.blades[i] = createVector();
        }
        this.updateCenters();
        this.getBladePositions();
    }

    updateCenters() {
        let offsetDist = width / 6;
        
        // Create an offset vector and rotate it
        let offset = createVector(offsetDist, 0).rotate(this.assemblyAngle);

        // Add the offset for the right, subtract for the left
        this.rightCenter = p5.Vector.add(this.p, offset);
        this.leftCenter = p5.Vector.sub(this.p, offset);
    }

   getBladePositions() {
        for (let i = 0; i < 4; i++) {
            // Left beater blades: Add assemblyAngle so it rotates with the chassis
            this.blades[i].set(
                this.leftCenter.x + this.r * cos(this.assemblyAngle + this.a + i * HALF_PI), 
                this.leftCenter.y + this.r * sin(this.assemblyAngle + this.a + i * HALF_PI)
            );
            
            // Right beater blades: Add assemblyAngle here too!
            this.blades[i + 4].set(
                this.rightCenter.x + this.r * cos(this.assemblyAngle - this.a + QUARTER_PI - i * HALF_PI), 
                this.rightCenter.y + this.r * sin(this.assemblyAngle - this.a + QUARTER_PI - i * HALF_PI)
            );
        }
    }

    update(){
        this.a += 0.01 * params.beaterSpeed;
        
        // 1. Calculate the new noise-driven angle
        let newAngle = map(noise(0.001 * frameCount * params.roamSpeed), 0, 1, 0, PI);
        
        // 2. Calculate exactly how much the chassis twisted THIS frame
        this.deltaAssemblyAngle = newAngle - this.assemblyAngle;
        
        // 3. Apply the new angle to the chassis
        this.assemblyAngle = newAngle;
       
        this.nx += 0.001 * params.roamSpeed;
        this.ny += 0.001 * params.roamSpeed;
        this.p.set(map(noise(this.nx), 0, 1, width/4, 3*width/4), map(noise(this.ny), 0, 1, height/4, 3*height/4));
        this.updateCenters();
        this.getBladePositions();
    }

   applyDrag(gridArray) {
        // Use the TRUE frame-by-frame chassis rotation calculated in update()!
        let leftVelocity = this.deltaAssemblyAngle + (0.01 * params.beaterSpeed);
        let rightVelocity = this.deltaAssemblyAngle - (0.01 * params.beaterSpeed);

        for (let i = 0; i < this.blades.length; i++) {
            let beaterCenter = i < 4 ? this.leftCenter : this.rightCenter;
            
            let trueVelocity = i < 4 ? leftVelocity : rightVelocity;
            
            for (let g of gridArray) {
                dragGridSquare(g, this.blades[i], beaterCenter, trueVelocity);
            }
        }
    }

    show(){
        for(let b of this.blades){
            circle(b.x, b.y, width / 10);
        }
    
    }
}

function easeInOutQuad(x) {
return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}