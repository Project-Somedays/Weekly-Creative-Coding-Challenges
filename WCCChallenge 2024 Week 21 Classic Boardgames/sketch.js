/*
Author: Project Somedays
Date: 2024-05-25
Title: Classic Boardgames - Mancala
*/

let players;

let red, blue;
let w;
let spacing;

let playerTurn;

let board;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  spacing = width/50;
  w = (width-9*spacing)/8;
  textAlign(CENTER, CENTER);

  players = {
    PLAYER1 : color(255, 0, 0),
    PLAYER2: color(0,0,255)
  }


  board = new Board();

  playerTurn = players.PLAYER1;

}

function draw() {
  background(0);
  board.show();
}

function distributeSeeds(){}

function capture(){

}

class Board{
  constructor(){
    this.cells = [];

    

    // player 2 endZone
    this.cells.push(new Cell(players.PLAYER2, w/2, height/2, true));

    // player 1 cells
    for(let i = 0; i < 6; i++){
      this.cells.push(new Cell(players.PLAYER1, (i+2)*w + i*spacing, 0.5*height+w, false));
    }

    

    // player 1 endZone
    this.cells.push(new Cell(players.PLAYER1, width - w/2, height/2, true));

    // player 2 cells
    for(let i = 0; i < 6; i++){
      this.cells.push(new Cell(players.PLAYER2, width - (i+1)*w + i*spacing, 0.25*height, false));
    }


    
  }

  show(){
    for(let c of this.cells){
      c.show();
    }
  }
}



class Cell{
  constructor(sideColour, px, py, isEndZone){
    this.sideColour = sideColour;
    this.seeds = 4;
    this.p = createVector(px, py);
    this.isEndZone = isEndZone;
  }

  show(){
    fill(this.sideColour);
    
    if(this.isEndZone){
      
      rect(this.p.x, this.p.y, w, 2*w, w/8, w/8);
      fill(255);
      text(this.seeds, this.p.x, this.p.y);
    } else{
      rect(this.p.x, this.p.y, w, w, w/8, w/8);
      fill(255);
      text(this.seeds, this.p.x, this.p.y);
    }

  }

  hover(){
    if(this.isEndZone) return;

  }

  deploy(){
    if(this.isEndZone) return;
  }
}
