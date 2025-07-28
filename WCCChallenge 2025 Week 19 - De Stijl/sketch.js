/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 19 - De Stijl 
| 📅 Started      | 2025-05-05        
| 📅 Completed    | 2025-05-10        
| 🕒 Taken        | ~3hrs                                  
| 🤯 Concept      | Reverse Engineering the style       
| 🔎 Focus        | Partitioning algorithm    

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph

See other submissions here: https://openprocessing.org/curation/78544](https://openprocessing.org/curation/78544

Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Full write-up here: https://project-somedays.github.io/coding/WCCChallenge-2025-Week-19-De-Stijl/

📔 NOTES 📔

Started in 3D then realised I'd bitten off more than I could chew and switched back to sweet sweet familiar ground: p5js 🥰
(Mostly) Worked out an algorithm for partitioning the grid by exluding potential starter corner points
Hope the warp doesn't give you as much sea-sickness as it does me 😅

*/


const palette = "#1584bf,#de3728,#fae41e,#1584bf,#de3728,#fae41e, #000000,#ffffff,#ffffff,#ffffff,#ffffff,#ffffff".split(",");
let allCols = [];
const n= 51;
let res;
let noiseZoom = 0.03;
let noiseProgRate = 0.005;
let allIntersectionPoints = [];
let destijlator;
const skipProb = 0.4;
const debug = true;

function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  createCanvas(1080, 1080);
  res =  width/n;
  rectMode(CORNERS);
  stroke(0);
  strokeWeight(3);

  for(let i = 0; i < n*n; i++){
    allCols.push(random(palette));
  }

  destijlator = new DeStijlator(n);




}

function draw() {
  background(220);
  fill(255);
  rect(0, 0, width, height);
  push();
  translate(res/2, res/2);
  destijlator.update();
  destijlator.show();
  pop();
  

  }
  
  class DeStijlator{
    constructor(cols){
      this.n = cols;
      this.res = width/(cols-1);
      this.grid = [];
      this.update();
      this.activeBoxes = [];
      this.getActiveBoxes();
    }

    getActiveBoxes(){
      let removed = [];
      this.activeBoxes = [];
      for(let i = 0 ; i < this.n; i++){
        for(let j = 0; j < this.n; j++){
          let x0 = j;
          let y0 = i;
          if(debug) console.log(`Checking starting point (${x0}, ${y0})`)
          if(removed.some(rmv => rmv.x === x0 && rmv.y === y0)){
            if(debug) console.log("Yep! this is already in the list! Skipping...");
            continue; // check to see if it's been removed already
          } else{
            console.log("Yep that's all good. Rolling dice...");
          }
          let xStep = x0 + 2 >= this.n ? 1 : random() < skipProb ? 2 : 1;
          let yStep = y0 + 2 >= this.n ? 1 :  random() < skipProb ? 2: 1;
          if(debug) console.log(`xStep: ${xStep}, yStep: ${yStep}`)
          // if(i + xStep > this.n) xStep = 1;
          // if(j + yStep > this.n) yStep = 1;
          if(j + xStep >= this.n || i + yStep >= this.n) continue; // Ensure we don't go out of bounds
          if(xStep === 2){
            removed.push({x: j+1, y: i});
            if(debug) console.log(`xStep of ${xStep}. Removing (${j+1},${i}) from the list of starting points`);
          } //if we move two away in the x direction, eliminate the point in the middle
          if(yStep === 2){
            removed.push({x: j, y: i+1}); //if we move two away in the y direction, eliminate the point in the middle
            if(debug) console.log(`yStep of ${yStep}. Removing (${j},${i+1}) from the list of starting points`)
          }
          if(xStep === 2 && yStep === 2){
            removed.push({x:j+1, y: i+1});
            if(debug) console.log(`Big square! Removing (${j+1},${i+1}) from the list of starting points`)
          }
          this.activeBoxes.push({x0: x0, y0: y0, x1: x0 + xStep, y1: y0 + yStep, col: random(palette)});
      }
    }
  }

    update(){
      for(let i = 0 ; i < this.n; i++){
        let row = [];
        for(let j = 0; j < this.n; j++){
        let xOffset = map(noise((i+0.5)*res*noiseZoom, frameCount*noiseProgRate + i*10), 0, 1, -res/4, res/4);
        let yOffset = map(noise((j+0.5)*res*noiseZoom, frameCount*noiseProgRate + j*10), 0, 1, -res/4, res/4);
        row[j] = createVector(xOffset + i*res - 2.5, yOffset + j*res - 2.5);
        // line( + xOffset, 0, i*res - 2.5 + xOffset, height);
        // line(0, j*res - 2.5 + yOffset, width, j*res-2.5+yOffset);
        }
        this.grid[i] = row;
      }
    }

    show(){
      for(let b of this.activeBoxes){
        fill(b.col);
        let x1 = this.grid[b.x0][b.y0].x;
        let y1 = this.grid[b.x0][b.y0].y;
        let x2 = this.grid[b.x1][b.y1].x;
        let y2 = this.grid[b.x1][b.y1].y;
        rect(x1, y1, x2, y2);
      }
    //   for(let i = 0 ; i < this.n; i++){
    //     for(let j = 0; j < this.n; j++){
    //     let p = this.grid[i][j];
    //     point(p.x, p.y);
    //     // line( + xOffset, 0, i*res - 2.5 + xOffset, height);
    //     // line(0, j*res - 2.5 + yOffset, width, j*res-2.5+yOffset);
    //     }
    //   }
    // }
  }
}
