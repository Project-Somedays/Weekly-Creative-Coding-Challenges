
/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 46 - Tangram
| 📅 Started      | 2025-11-16      
| 📅 Completed    | 2025-11-16        
| 🕒 Taken        | Longer than I want to admit                   
| 🤯 Concept      | Replacing the viewer with a tangram grid
| 🔎 Focus        | Getting an organic feel

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Borrowing from my experiment from just over a year ago - Jumpscare: https://openprocessing.org/sketch/2426659
ml5 to detect where the viewer is in the web cam
Overlaid a grid over the mask and greedily merged cells to form the biggest shapes
Made a few recipes for making a grid out of tangram shapes 👉 fill in the grid 🥰
Grid updates whenever the mask changes by some threshold


RESOURCES
  - ml5js sample code for masking out the person from the background of the video feed: https://editor.p5js.org/ml5/sketches/h6TN8umP5
  - Colour Palette: https://coolors.co/f56a00-fa8b01-ffad03-ffc243-ffcf70-cea7ee-b67be6-9d4edd-72369d-461e5c
  - Claude to SIGNIFICANTLY speed things up
*/



let bodySegmentation;
let video;
let segmentation;
let palette = "#f56a00, #fa8b01, #ffad03, #ffc243, #ffcf70, #cea7ee, #b67be6, #9d4edd, #72369d, #461e5c".split(", ")
let cachedShapes = [];
let previousMaskData = null;
let rotations = [];
let regions = [];

let options = {
  maskType: "person",
};

let gui, params;

function preload() {
  bodySegmentation = ml5.bodySegmentation("SelfieSegmentation", options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Create the video

  rotations = [0, HALF_PI, PI, 3*HALF_PI];

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  gui = new lil.GUI()
  params = {
    tangramMethod : gridBasedDecomposition,
    gridSize: 20,
    maxRegionSize: 8,
    pixelChangeThreshold: 0.05,
    showRegions: true,
    showShapes: true,
    maskOutViewer: false
  }

  // gui.add(params, 'tangramMethod', {
  //   "grid-based decomp": gridBasedDecomposition,
  //   "contour-based decomp": gridBasedDecomposition,
  //   "chaos-based decomp": gridBasedDecomposition
  // });
  gui.add(params, 'gridSize', 5, 50, 1).onChange(() => {
  if (segmentation && segmentation.mask) {
    cachedShapes = params.tangramMethod(segmentation.mask, params.gridSize, params.showRegions, params.maxRegionSize);
    storeMaskState(segmentation.mask);
  }
});

  
  gui.add(params, 'maxRegionSize', 1, 20, 1).onChange(() => {
  if (segmentation && segmentation.mask) {
    cachedShapes = params.tangramMethod(segmentation.mask, params.gridSize, params.showRegions, params.maxRegionSize);
    storeMaskState(segmentation.mask);
  }
});
  gui.add(params, 'pixelChangeThreshold', 0.01, 0.1, 0.01);
  gui.add(params, 'showRegions');
  gui.add(params, 'showShapes');
  gui.add(params, 'maskOutViewer');

  bodySegmentation.detectStart(video, gotResults);
}

function draw() {
  background(0, 255, 0);

  if (segmentation) {
    if(params.maskOutViewer) video.mask(segmentation.mask);
    image(video, 0, 0); 
    processMask(segmentation.mask, params.tangramMethod); // Changed function name
  }
}

// callback function for body segmentation
function gotResults(result) {
  segmentation = result;
}

// Modified tangramize function
// function tangramize(mask, method) {
//   // Check if mask has changed significantly
//   if (hasMaskChanged(mask)) {
//     // Recalculate decomposition
//     switch(method) {
//       case gridBasedDecomposition:
//         cachedShapes = gridBasedDecomposition(mask, params.gridSize, params.showRegions);
//         break;
//     }
    
//     // Store current mask state
//     storeMaskState(mask);
//   }
  
//   // Always draw the cached shapes
//   drawTangramShapes(cachedShapes);
// }


// Grid-based decomposition with greedy merging from center
function gridBasedDecomposition(mask, gridSize = 20, showRegions = false, maxRegionSize = 8) {
  mask.loadPixels();
  
  // Step 1: Create grid and identify person cells
  let cols = ceil(width / gridSize);
  let rows = ceil(height / gridSize);
  let grid = Array(rows).fill(null).map(() => Array(cols).fill(false));
  let personCells = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = col * gridSize;
      let y = row * gridSize;
      if (isCellFilled(mask, x, y, gridSize)) {
        grid[row][col] = true;
        personCells.push({row, col});
      }
    }
  }
  
  if (personCells.length === 0) return [];
  
  // Step 2: Find center of mask
  let centerRow = floor(personCells.reduce((sum, c) => sum + c.row, 0) / personCells.length);
  let centerCol = floor(personCells.reduce((sum, c) => sum + c.col, 0) / personCells.length);
  
  // Step 3: Greedily merge cells into regions
  let rawRegions = greedyMergeFromCenter(grid, centerRow, centerCol, rows, cols, maxRegionSize);
  
  // Step 4: Convert to region format compatible with tangramize
  let regions = rawRegions.map(r => {
    let cx = (r.startCol + r.width/2) * gridSize;
    let cy = (r.startRow + r.height/2) * gridSize;
    let w = r.width * gridSize;
    
    return {
      c: createVector(cx, cy),
      w: w,
      shapes: [],
      showBoundary: showRegions
    };
  });
  
  // Step 5: Fill each region with tangram pieces
  for (let region of regions) {
    tangramize(region);
  }
  
  return regions;
}

// Greedy merging algorithm - scan systematically
function greedyMergeFromCenter(grid, centerRow, centerCol, rows, cols, maxRegionSize) {
  let regions = [];
  let visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  
  // Just scan row by row, left to right
  // This allows better merging of adjacent cells
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!grid[row][col] || visited[row][col]) continue;
      
      // Try to find largest possible square starting from this cell
      let region = findLargestRectangle(grid, visited, row, col, rows, cols, maxRegionSize);
      
      if (region) {
        regions.push(region);
        
        // Mark region as visited
        for (let r = region.startRow; r < region.startRow + region.height; r++) {
          for (let c = region.startCol; c < region.startCol + region.width; c++) {
            visited[r][c] = true;
          }
        }
      }
    }
  }
  
  return regions;
}

function processMask(mask, method) {
  // Check if mask has changed significantly
  if (hasMaskChanged(mask)) {
    // Recalculate decomposition and get regions
    cachedShapes = method(mask, params.gridSize, params.showRegions);
    
    // Store current mask state
    storeMaskState(mask);
  }
  
  // Draw the regions and their shapes
  drawRegions(cachedShapes);
  
}


// Find the largest rectangle that can be placed at this position
function findLargestRectangle(grid, visited, startRow, startCol, rows, cols) {
  let bestRegion = null;
  
  // Only try squares, from largest to smallest
  for (let size = params.maxRegionSize; size >= 1; size--) {
    if (canPlaceRectangle(grid, visited, startRow, startCol, size, size, rows, cols)) {
      bestRegion = {
        startRow: startRow,
        startCol: startCol,
        width: size,
        height: size,
        area: size * size
      };
      break; // Take the first (largest) square that fits
    }
  }
  
  return bestRegion;
}

// Check if a rectangle can be placed
function canPlaceRectangle(grid, visited, startRow, startCol, w, h, rows, cols) {
  for (let r = startRow; r < startRow + h; r++) {
    for (let c = startCol; c < startCol + w; c++) {
      if (r >= rows || c >= cols) return false;
      if (!grid[r][c]) return false;
      if (visited[r][c]) return false;
    }
  }
  return true;
}



// Helper: Check if a grid cell is mostly filled (<50% opacity)
function isCellFilled(mask, x, y, size, threshold = 0.5) {
  let filledPixels = 0;
  let totalPixels = 0;
  
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      let px = x + dx;
      let py = y + dy;
      
      if (px < width && py < height) {
        let index = (py * width + px) * 4;
        let alpha = mask.pixels[index + 3];
        
        if (alpha < 128) filledPixels++; // Person has LOW alpha
        totalPixels++;
      }
    }
  }
  
  return filledPixels / totalPixels > threshold;
}



// Check if mask has changed enough to warrant recalculation
function hasMaskChanged(mask) {
  if (!previousMaskData) return true; // First frame
  
  mask.loadPixels();
  let changeCount = 0;
  let sampleRate = 10; // Check every 10th pixel for performance
  
  for (let i = 0; i < mask.pixels.length; i += 4 * sampleRate) {
    let currentAlpha = mask.pixels[i + 3];
    let prevAlpha = previousMaskData[i + 3];
    
    if (abs(currentAlpha - prevAlpha) > 30) { // Threshold for "significant" change
      changeCount++;
    }
  }
  
  // If more than 5% of sampled pixels changed, recalculate
  let sampledPixels = mask.pixels.length / (4 * sampleRate);
  return changeCount / sampledPixels > params.pixelChangeThreshold;
}

// Store current mask state for next frame comparison
function storeMaskState(mask) {
  mask.loadPixels();
  previousMaskData = new Uint8Array(mask.pixels);
}

function drawRegions(regions) {
  for (let region of regions) {
    push();
    
    // Optional: show region boundaries
    if (region.showBoundary && params.showRegions) {
      noFill();
      stroke(255, 0, 0, 100);
      strokeWeight(2);
      rectMode(CENTER);
      rect(region.c.x, region.c.y, region.w, region.w);
    }
    
    // Draw shapes in this region
    noStroke();
    if (params.showShapes) {
      translate(region.c.x, region.c.y);
      for (let shape of region.shapes) {
        push();
        rotate(shape.angle);
        shape.show();
        pop();
      }
    }
    
    pop();
  }
}