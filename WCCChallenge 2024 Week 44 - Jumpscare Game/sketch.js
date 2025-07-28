// Game state variables
let player;
let victims = [];
let obstacles = [];
let scarePoints = 0;
let gameOver = false;

function setup() {
  createCanvas(800, 600);
  // Initialize player
  player = {
    x: 50,
    y: 50,
    size: 20,
    speed: 4,
    visible: false
  };
  
  // Create victims with patrol patterns
  victims = [
    {
      x: 300,
      y: 200,
      direction: 0,
      fovAngle: PI/2,
      fovRange: 150,
      patrolPoints: [{x: 300, y: 200}, {x: 500, y: 200}],
      currentPoint: 0,
      speed: 2,
      scared: false
    },
    {
      x: 600,
      y: 400,
      direction: PI,
      fovAngle: PI/2,
      fovRange: 150,
      patrolPoints: [{x: 600, y: 400}, {x: 600, y: 200}],
      currentPoint: 0,
      speed: 2,
      scared: false
    }
  ];
  
  // Create noise-making obstacles
  obstacles = [
    {x: 200, y: 300, width: 40, height: 40, noiseRadius: 60},
    {x: 400, y: 150, width: 40, height: 40, noiseRadius: 60},
    {x: 600, y: 300, width: 40, height: 40, noiseRadius: 60}
  ];
}

function draw() {
  background(50);
  
  if (!gameOver) {
    handlePlayerMovement();
    updateVictims();
    checkDetection();
    checkScares();
  }
  
  // Draw everything
  drawObstacles();
  drawVictims();
  drawPlayer();
  
  // Draw score and game over
  fill(255);
  noStroke();
  textSize(20);
  text(`Scares: ${scarePoints}`, 20, 30);
  
  if (gameOver) {
    textAlign(CENTER);
    textSize(40);
    text("GAME OVER!", width/2, height/2);
    textSize(20);
    text("Press R to restart", width/2, height/2 + 40);
  }
}

function handlePlayerMovement() {
  // Move player with WASD or arrow keys
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) player.x -= player.speed;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) player.x += player.speed;
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) player.y -= player.speed;
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) player.y += player.speed;
  
  // Keep player in bounds
  player.x = constrain(player.x, 0, width);
  player.y = constrain(player.y, 0, height);
  
  // Check if player is near any noise-making obstacles
  player.visible = false;
  for (let obs of obstacles) {
    let d = dist(player.x, player.y, obs.x + obs.width/2, obs.y + obs.height/2);
    if (d < obs.noiseRadius) {
      player.visible = true;
      break;
    }
  }
}

function updateVictims() {
  for (let victim of victims) {
    if (!victim.scared) {
      // Move toward current patrol point
      let target = victim.patrolPoints[victim.currentPoint];
      let angle = atan2(target.y - victim.y, target.x - victim.x);
      victim.x += cos(angle) * victim.speed;
      victim.y += sin(angle) * victim.speed;
      victim.direction = angle;
      
      // Check if reached patrol point
      if (dist(victim.x, victim.y, target.x, target.y) < 5) {
        victim.currentPoint = (victim.currentPoint + 1) % victim.patrolPoints.length;
      }
    }
  }
}

function checkDetection() {
  for (let victim of victims) {
    if (victim.scared) continue;
    
    // Check if player is in victim's FOV
    let angleToPlayer = atan2(player.y - victim.y, player.x - victim.x);
    let angleDiff = abs(angleToPlayer - victim.direction);
    angleDiff = min(angleDiff, TWO_PI - angleDiff);
    
    let distToPlayer = dist(player.x, player.y, victim.x, victim.y);
    
    if (player.visible && distToPlayer < victim.fovRange && angleDiff < victim.fovAngle/2) {
      gameOver = true;
    }
  }
}

function checkScares() {
  for (let victim of victims) {
    if (!victim.scared) {
      let d = dist(player.x, player.y, victim.x, victim.y);
      if (d < 30 && !player.visible) {
        victim.scared = true;
        scarePoints++;
      }
    }
  }
}

function drawPlayer() {
  push();
  if (player.visible) {
    fill(255, 0, 0, 150);
  } else {
    fill(0, 255, 0, 150);
  }
  noStroke();
  circle(player.x, player.y, player.size);
  pop();
}

function drawVictims() {
  for (let victim of victims) {
    push();
    if (victim.scared) {
      fill(100, 100, 255);
    } else {
      fill(255);
      // Draw FOV
      fill(255, 255, 0, 30);
      arc(victim.x, victim.y, victim.fovRange * 2, victim.fovRange * 2, 
          victim.direction - victim.fovAngle/2, 
          victim.direction + victim.fovAngle/2);
    }
    noStroke();
    circle(victim.x, victim.y, 30);
    // Direction indicator
    stroke(0);
    line(victim.x, victim.y, 
         victim.x + cos(victim.direction) * 20,
         victim.y + sin(victim.direction) * 20);
    pop();
  }
}

function drawObstacles() {
  for (let obs of obstacles) {
    push();
    // Draw noise radius
    fill(255, 0, 0, 20);
    noStroke();
    circle(obs.x + obs.width/2, obs.y + obs.height/2, obs.noiseRadius * 2);
    // Draw obstacle
    fill(150);
    rect(obs.x, obs.y, obs.width, obs.height);
    pop();
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    setup();
    gameOver = false;
    scarePoints = 0;
  }
}