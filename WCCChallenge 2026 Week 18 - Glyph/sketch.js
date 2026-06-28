/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 18 - "Glyph"
| 📅 Started      | 2025-05-03
| 📅 Completed    | 2025-05-03       
| 🕒 Taken        | 2hrs of mucking about                     
| 🤯 Concept      | Matching glyphs trigger biz
| 🔎 Focus        | Keeping grid and visuals separate
| 🤖 AI-use       | Bug-fixes and troubleshooting

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Trying to get into the habit of obeying The Law of Demeter i.e. the Law of Least Knowledge
Do all the updates in the grid, which knows nothing about tiles
Tiles just know which grid position to start and end at, but nothing about the rules for how they're updated
*/

const rows = 15;
const cols = 15;
const maxAttempts = 10;
let side;
let palette = "#8fbfe0, #7c77b9, #1d8a99, #0bc9cd, #14fff7".split(", ");
let grid;
let directions = [
    {x: 0, y: -1},
    {x: 0, y: 1},
    {x: 1, y: 0},
    {x: -1, y: 0}
];
let cycleFrames = 90;
let t = 0;

function setup() {
    createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
    side = width / cols;
    rectMode(CENTER);
    noStroke();
    
    // We only need to initialize the grid now!
    grid = new Grid(cols, rows);
}

function draw() {
    background(0);

    if (t === 0) {
        grid.fillHoles();
    }
    
    // The grid handles updating and showing all tiles
    grid.show();
    
    t = (t + 1) % cycleFrames;
}

class Grid {
    constructor(_cols, _rows) {    
        this.cols = _cols;
        this.rows = _rows;
        this.grid = [];

        // Initialize grid directly with Tile objects
        for (let i = 0; i < this.cols; i++) {
            let row = [];
            for (let j = 0; j < this.rows; j++) {
                let isHole = random() < 0.1; 
                row.push(new Tile(i, j, isHole));
            }
            this.grid.push(row);
        }
    }

    fillHoles() {
        // 1. Reset all chosen flags for the new cycle
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j].chosen = false;
            }
        }

        // 2. Create a shallow copy of the 2D array structure to act as our buffer
        // We copy the structure, but keep the references to the actual Tile objects
        let bufferGrid = [];
        for (let i = 0; i < this.cols; i++) {
            bufferGrid.push([...this.grid[i]]);
        }

        // 3. Process the holes
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let currentTile = this.grid[i][j];
                
                if (!currentTile.isHole) continue; 
                
                let dir = random(directions); 
                let newX = i + dir.x;
                let newY = j + dir.y;

                let attempts = 0;
                // Make sure neighbor is valid, NOT a hole, and NOT already moving
                while (attempts < maxAttempts && 
                      (newX < 0 || newX >= this.cols || newY < 0 || newY >= this.rows || 
                       this.grid[newX][newY].isHole || 
                       this.grid[newX][newY].chosen)) {
                    dir = random(directions);
                    newX = i + dir.x; 
                    newY = j + dir.y;
                    attempts++;
                }
                
                if (attempts >= maxAttempts) continue;

                let neighborTile = this.grid[newX][newY];

                // Mark the neighbor as chosen so it doesn't move twice
                neighborTile.chosen = true;

                // Swap their positions in the buffer array
                bufferGrid[i][j] = neighborTile;
                bufferGrid[newX][newY] = currentTile;

                // Tell both tiles their new logic coordinates
                neighborTile.setTarget(i, j);
                currentTile.setTarget(newX, newY); // The invisible hole object swaps places too!
            }
        }

        // 4. Overwrite the main grid with the updated buffer
        this.grid = bufferGrid;
    }

    show() {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j].update();
                this.grid[i][j].show();
            }
        }
    }
}

class Tile {
    constructor(gridX, gridY, isHole) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.newGridX = gridX;
        this.newGridY = gridY;
        
        this.isHole = isHole;
        this.chosen = false; 
        
        this.originP = createVector();
        this.targetP = createVector();
        
        this.colour = palette[int(map(noise(gridX / 5.0, gridY / 5.0), 0, 1, 0, palette.length))];
        
        // Setup movement timing variables
        this.delayFrames = 0;
        this.moveFrames = cycleFrames;
        this.framesActive = cycleFrames; // Start fully "arrived"
        
        this.getPosFromGrid();
        this.p = this.originP.copy(); 
    }

    setTarget(newGridX, newGridY) {
        this.gridX = this.newGridX;
        this.gridY = this.newGridY;
        
        this.newGridX = newGridX;
        this.newGridY = newGridY;
        
        this.getPosFromGrid();
        
        // 1. Calculate a new noise-based delay (between 0 and half a cycle)
        // Using gridX and gridY creates a flow field effect for the delay!
        this.delayFrames = map(noise(this.gridX / 10.0, this.gridY / 10.0), 0, 1, 0, cycleFrames / 2);
        
        // 2. Subtract the delay from the total cycle so it still arrives on time
        this.moveFrames = cycleFrames - this.delayFrames;
        
        // 3. Start the timer in the negative so it sits still before moving
        this.framesActive = -this.delayFrames; 
    }

    getPosFromGrid() {
        this.originP.set((this.gridX + 0.5) * side, (this.gridY + 0.5) * side);
        this.targetP.set((this.newGridX + 0.5) * side, (this.newGridY + 0.5) * side);
    }
    
    update() {
        if (this.framesActive < this.moveFrames) {
            this.framesActive++;
        }
        
        // Convert current active frames into a normalized 0.0 to 1.0 progress
        let progress = map(this.framesActive, 0, this.moveFrames, 0, 1);
        
        // Constrain prevents negative progress during the delay phase, holding the tile at 0
        progress = constrain(progress, 0, 1);
        
        this.p = p5.Vector.lerp(this.originP, this.targetP, easeOutBounce(progress));
    }

    show() {
        if (!this.isHole) {
            fill(this.colour);
            square(this.p.x, this.p.y, side * 0.99);
        }
    }
}

function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}