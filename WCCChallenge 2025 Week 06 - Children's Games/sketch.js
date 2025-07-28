/*
Author: Project Somedays
Date: 2025-02-15
Title: WCCChallenge 2025 Week 06 - Children's Games

Loved Mancala growing up. Thought I'd try my hand at making my first bot also.

Refactoring: I don't love how you have to follow the gameflow through functions, but also, out of time 🤷
*/

const startingRocks = 4;
const gameSpacesPerPlayer = 6;
const totalSpacesPerRow = gameSpacesPerPlayer + 2;
let w;
let rockSize;
let gameSpaceSpacing;
let rowYOffset;
let isPlayer1Turn = true;
let prevPlayer1Turn = true;
let isChangingTurns = false;
let turnTransitionFrames = 120;
let turnProgress = 0;
let startTurnTransitionFrame = 0;
let rotZ = 0;
let selectedSpace = null;
let isOverValidSpace = false;
let player1Col, player2Col;
let player1Score, player2Score;
let p1 = true;
let p2 = false;


let spaces = [];


function setup() {
  createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight), WEBGL);
  w = min(windowWidth, windowHeight);
  rockSize = w/50;
  noStroke();
  gameSpaceSpacing = w / totalSpacesPerRow;
  rowYOffset = width/4;

  player1Col = color(255, 0, 0);
  player2Col = color(0,0,255);

  // player 1 spots
  for(let i = 0; i <= gameSpacesPerPlayer; i++){
    let player = true;
    let x = -width/2 - gameSpaceSpacing/2 + (i + 2) * gameSpaceSpacing;
    let isEndZone = i === gameSpacesPerPlayer;
    let y = isEndZone ? 0 : rowYOffset;
    spaces.push(new GameSpace(x,y,player, isEndZone));
  }

  for(let i = 0; i <= gameSpacesPerPlayer; i++){
    let player = false;
    let x = -gameSpaceSpacing/2 + width/2 - (i+1) * gameSpaceSpacing;
    let isEndZone = i === gameSpacesPerPlayer;
    let y = isEndZone ? 0 : -rowYOffset;
    spaces.push(new GameSpace(x,y,player, isEndZone));
  }

}



function draw() {
  background(220);

  evalMouseOver();

  let gameEnd = getPlayerSpacesByZone(p1, false).every(space => space.rocks === 0) || getPlayerSpacesByZone(p2, false).every(space => space.rocks === 0)
  if(gameEnd){
    let totalRemainingRocksP1 = getPlayerSpacesByZone(p1, false).reduce((accumulator, current) => accumulator + current.rocks, 0);
    getPlayerSpacesByZone(p1, true)[0].addRock(totalRemainingRocksP1);
    let totalRemainingRocksP2 =  getPlayerSpacesByZone(p1, false).reduce((accumulator, current) => accumulator + current.rocks, 0);
    getPlayerSpacesByZone(p2, true)[0].addRock(totalRemainingRocksP2);
    updateScores();
    removeAllRocks(p1);
    endGame();
  }


  if(isChangingTurns){
    turnProgress = (frameCount - startTurnTransitionFrame)/turnTransitionFrames;
    rotZ = isPlayer1Turn ? map(easeInOutElastic(turnProgress), 0, 1, 0, PI) : map(easeInOutElastic(turnProgress), 0, 1, PI, 0);
    rotateY(rotZ);
    if(turnProgress === 1){
      isChangingTurns = false;
      turnProgress = 0;
      isPlayer1Turn = !isPlayer1Turn;
    }
  }

  rotateZ(rotZ);
  for(let space of spaces){
    space.show();
  }

  showPredictedEndPoint();


  // orbitControl();
}

function getPlayerSpacesByZone(player, isEndZone){
  return spaces.filter(space => space.player === player && space.isEndZone === isEndZone)
}

function mousePressed(){
  if(isOverValidSpace && mouseButton === LEFT){
    let lastIndex = distributeRocks(selectedSpace);
    selectedSpace = null;
    handleLastIndex(lastIndex);
  }
}

function distributeRocks(selectedSpace){
  let rockCount = selectedSpace.rocks;
  selectedSpace.removeRocks();
  let startingIndex = spaces.indexOf(selectedSpace) + 1;
  let currentIndex = startingIndex;
  for(let i = 0; i < rockCount; i++){
    currentIndex = (startingIndex + i)%((gameSpacesPerPlayer+1)*2);
    if(spaces[currentIndex].isEndZone && spaces[currentIndex].player !== isPlayer1Turn) currentIndex = (currentIndex  + 1)% totalSpacesPerRow*2;// you can't put rocks in your opponent's endzone
    spaces[currentIndex].addRock(1);
  }

  // if our last rock ends up in our endZone, then we get another go!
  let lastIndex = (startingIndex - 1 + rockCount)%((gameSpacesPerPlayer+1)*2);
  
  return lastIndex;
}


function updateScores(){
  player1Score = spaces.filter(space => space.isEndZone && space.player)[0].rocks;
  player2Score = spaces.filter(space => space.isEndZone && !space.player)[0].rocks;
}

function removeAllRocks(player){
  for(let space of spaces){
    if(space.player !== player || space.isEndZone) continue;
    space.removeRocks();
  }
}



function handleLastIndex(lastIndex){
  let lastSpace = spaces[lastIndex];
  console.log(`Last index: ${lastIndex} --> Last Space endzone?: ${lastSpace.isEndZone} of ${isPlayer1Turn ? "Player 1" : "Player 2"}`);
  let opponentCorrespondingSpace = spaces[(gameSpacesPerPlayer*2 - lastIndex)];

  // if the last spot is in the endzone, have another go
  if(lastSpace.isEndZone && lastSpace.player === isPlayer1Turn){
    console.log(`Player ${isPlayer1Turn ? 1 : 2} gets another go! 😊`);
    return;
  }
   
  // if you're last is in a blank spot on your side, it goes to the endzone AND you steal whatever is opposite you
  if(lastSpace.rocks === 1){
    console.log(opponentCorrespondingSpace.rocks > 0 ? "Ooh! Steal! Nice move 😈" : "Home run! Straight to the endzone!")
    let currentPlayerEndZone = spaces.filter(space => space.isEndZone && space.player === isPlayer1Turn)[0];
    currentPlayerEndZone.addRock(lastSpace.rocks + opponentCorrespondingSpace.rocks);
    lastSpace.removeRocks();
    opponentCorrespondingSpace.removeRocks();
    endTurn();
    return
  } 
  
  // by default, it's the other player's turn
  console.log(isPlayer1Turn ? "Now it's player 2's turn" : "Now it's player 1's turn")
  endTurn();
  return;
  
}

function endTurn(){
  startTurnTransitionFrame = frameCount;
  isChangingTurns = true;
  updateScores();
}





  function determineWinner(){

  }

  function endGame(){
    let endGameText;
    if(player1Score > player2Score){
      endGameText = "Player 1 Wins"
    } else if(player1Score === player2Score){
      endGameText = "Tie"
    } else{
      endGameText = "Player 2 Wins!"
    }
    let cnv = createGraphics(width, height);
    cnv.background(0,100);
    cnv.fill(255);
    cnv.noStroke();
    cnv.textSize(height/2);
    cnv.textAlign(CENTER, CENTER);
    cnv.text(`GAME OVER\n${endGameText}`);
    
    // draw the endGameScreen
    texture(cnv);
    push();
    translate(0,0,width/4);
    rect(0,0,width, height);
    pop();
  
    noLoop();
  }



  function evalMouseOver(){
    for(let space of spaces.filter(s => s.player === isPlayer1Turn && !s.isEndZone)){
      space.setMouseOver(mouseX - width / 2, mouseY - height/2);
    }

    isOverValidSpace = spaces.some(space => space.mouseOver); // the only options are your own spaces 
  }

  

  


  function keyPressed(){
    if(key === ' ') showGameState();
  }

  function showGameState(){
    for(let i = 0; i < spaces.length; i++){
      let space = spaces[i];
      console.log(`Space ${i}: ${space.player ? "Player 1" : "Player 2"}, currentRocks: ${space.rocks} isEndZone: ${space.isEndZone} `);
    }
  }

  function showPredictedEndPoint(){
    if(keyIsDown(ENTER) && selectedSpace){
      let selectedSpaceIndex = spaces.indexOf(selectedSpace);
      let rockCount = selectedSpace.rocks;
      let lastIndex = (selectedSpaceIndex + rockCount)%((gameSpacesPerPlayer+1)*2);
      spaces[lastIndex].highlight();
      spaces[gameSpacesPerPlayer*2 - lastIndex].highlight();
    }
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