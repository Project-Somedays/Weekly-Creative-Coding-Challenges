/*
Author: Project Somedays
Date: 2024-12-08
Title: WCCChallenge - Void

Look, not my best work but also pretty time poor this week so... 🤷 I think it's a good start anyway. 

Liberal use of ChatGPT "things you might scream into the void" and Claude.ai for most of the rest. 

Resources:
	- Font: https://fonts.google.com/share?selection.family=Noto+Color+Emoji|Staatliches

Spin-Off Ideas that I don't have time for:
 - Speech to text so the user can scream their own message into the void
 - Implement void as shader. Getting the hole in the centre is very computationally heavy.

Help:
 - Curious why there's a black background to the font?
 
  */


let meshVerts = [];
let originalVerts = [];
const res = 10;
const holeRadius = 0.4; // Proportion of canvas width for the hole
let speech;

let font;
let phrases = [
  "Why?", 
  "Help!", 
  "No!", 
  "Stop!", 
  "Wait!", 
  "Go away!", 
  "Come back!", 
  "Forever!", 
  "Never!", 
  "Always!", 
  "Again?", 
  "How dare you!", 
  "Unbelievable!", 
  "Impossible!", 
  "Save me!", 
  "Take me with you!", 
  "Leave me alone!", 
  "I can't!", 
  "I won't!", 
  "Why me?", 
  "What's the point?", 
  "Make it stop!", 
  "Do something!", 
  "Say something!", 
  "Nothing matters!", 
  "Everything matters!", 
  "It's all a lie!", 
  "I'm done!", 
  "I'm lost!", 
  "I'm scared!", 
  "It hurts!", 
  "It doesn't hurt!", 
  "I tried!", 
  "I failed!", 
  "I'm sorry!", 
  "I'm not sorry!", 
  "What if?", 
  "If only!", 
  "Please!", 
  "Thanks for nothing!", 
  "Come on!", 
  "Is that all?", 
  "Do better!", 
  "Try harder!", 
  "Let go!", 
  "Hold on!", 
  "It's over!", 
  "It's not over!", 
  "I exist!", 
  "Do I exist?",
  "Why not?", 
  "What now?", 
  "Seriously?", 
  "Really?", 
  "Fix this!", 
  "Undo it!", 
  "Do it!", 
  "Stay!", 
  "Leave!", 
  "Run!", 
  "Fall!", 
  "Fly!", 
  "Jump!", 
  "Cry!", 
  "Laugh!", 
  "Burn!", 
  "Freeze!", 
  "Shatter!", 
  "Break!", 
  "Heal!", 
  "Forget me!", 
  "Remember me!", 
  "Look at me!", 
  "Don't look at me!", 
  "Love me!", 
  "Hate me!", 
  "Listen to me!", "Ignore me!", "Trust me!", 
  "Don't trust me!", "Give up!", "Don't give up!", "Fight me!", 
  "Help me!", "Spare me!", "Destroy me!", "Save yourself!", "Run away!", 
  "Don't leave!", "Why here?", "Why now?", "Show yourself!", 
  "Hide away!", "It's too late!", "It's not too late!", "I can't hear you!", 
  "I see you!", "I don't see you!", "Wake up!", "Go to sleep!"
];

let letters=  [];

function preload() {
  font = loadFont("Staatliches-Regular.ttf"); // Preload the font. For 3D to work, we need a font file (not a linked font).
  
}



function setup() {
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createCanvas(1080, 1080, WEBGL);
  speech = new p5.Speech();
  speech.listVoices();
  speech.setRate(1.25);
  textFont(font);
  textSize(width/20);
  textAlign(CENTER, CENTER);
  noCursor();
  pixelDensity(1);  
  // Create original and deformable vertices
  for(let x = 0; x < res; x++){
    for(let z = 0; z < res; z++){
      // Create original positioning
      let xPos = -width/2 + x * width/res;
      let zPos = -width/2 + z * width/res;
      
      let yPos = sin(x * 0.1) * cos(z * 0.1) * 20; // Base terrain variation
      
      let vert = createVector(xPos, yPos, zPos);
      meshVerts.push(vert);
      originalVerts.push(vert.copy());
    }
  }
}

function draw() {
  background(0);
  lights();
  
  // Rotate scene slightly for depth perception
  rotateX(-PI/6);
  translate(0,width/4,-width/3);
  scream();
  showScreams();
  
  // Animate deformation
  let t = frameCount * 0.05;
  
  // Recreate vertices with animation
  for(let x = 0; x < res; x++){
    for(let z = 0; z < res; z++){
      let index = x * res + z;
      let orig = originalVerts[index];
      let current = meshVerts[index];
      
      // Calculate distance from center
      let centerDist = dist(orig.x, 0, orig.z, 0, 0, 0);
      let normalizedCenterDist = centerDist / (width/2);
      
      // Twisting effect
      let twistAngle = sin(-t + centerDist * 0.1) * PI/4;
      
      // Scrunching effect
      let scrunch = sin(-t * 1.3 + centerDist * 0.2) * 50;
      
      // Downward pull in center (strongest at center)
      let centerPull = map(centerDist, 0, width/2, 100, 0);
      let yPull = sin(-t) * centerPull;
      
      // Rotate around Y axis
      let rotatedX = orig.x * cos(twistAngle) - orig.z * sin(twistAngle);
      let rotatedZ = orig.x * sin(twistAngle) + orig.z * cos(twistAngle);
      
      // Update vertex position
      current.x = rotatedX;
      current.z = rotatedZ;
      current.y = orig.y + 
                  sin(x * 0.1) * cos(z * 0.1) * 20 + // Original terrain
                  scrunch + 
                  yPull;
      
      // Mark whether this vertex is in the hole
      current.inHole = normalizedCenterDist <= holeRadius;
    }
  }
  
  // Render mesh
  stroke(0, 50);
  fill(200, 200, 255, 200);
  
  for(let x = 0; x < res - 1; x++){
    for(let z = 0; z < res - 1; z++){
      // Get four corners of the current quad
      let tl = meshVerts[x*res + z];
      let tr = meshVerts[x*res + (z+1)];
      let bl = meshVerts[(x+1)*res + z];
      let br = meshVerts[(x+1)*res + (z+1)];
      
      // Check if the quad should be rendered
      if (!tl.inHole && !tr.inHole && !bl.inHole && !br.inHole) {
        // First triangle
        beginShape(TRIANGLES);
        vertex(tl.x, tl.y, tl.z);
        vertex(tr.x, tr.y, tr.z);
        vertex(bl.x, bl.y, bl.z);
        endShape();
        
        // Second triangle
        beginShape(TRIANGLES);
        vertex(tr.x, tr.y, tr.z);
        vertex(br.x, br.y, br.z);
        vertex(bl.x, bl.y, bl.z);
        endShape();
      }
    }
  }

  orbitControl();
}

function scream(){
  // Randomly add new phrases
  if (frameCount % 50 === 0) {
    speech.set
    let newPhrase = random(phrases)
    letters.push({
      phrase: newPhrase,
      x: random(-width/16, width/16),
      y: -height,
      z: random(-width/16, width/16),
      // Introduce more chaotic rotation with noise
      rotSpeed: {
        x: random(-0.01, 0.01),
        y: random(-0.01, 0.01),
        z: random(-0.01, 0.01)
      },
      // Initial random rotation
      currentRot: {
        x: random(TWO_PI),
        y: random(TWO_PI),
        z: random(TWO_PI)
      }
    });
    speech.speak(newPhrase);
  }
  
}

function showScreams(){

  for (let i = letters.length - 1; i >= 0; i--) {
    push();
    
    // Translate to letter's position
    translate(letters[i].x, letters[i].y, letters[i].z);
    
    // Update and apply chaotic rotations
    letters[i].currentRot.x += letters[i].rotSpeed.x;
    letters[i].currentRot.y += letters[i].rotSpeed.y;
    letters[i].currentRot.z += letters[i].rotSpeed.z;
    
    // Apply rotations with more erratic movement
    rotateX(letters[i].currentRot.x);
    rotateY(letters[i].currentRot.y);
    rotateZ(letters[i].currentRot.z);
    
    // Move letter straight down
    letters[i].y += height/150;
    
    // Draw the letter A
    fill(0, 100, 200);
    text(letters[i].phrase, 0, 0);
    
    pop();
    
    // Remove letters that have passed halfway
    if (letters[i].y > height/4) {
      letters.splice(i, 1);
    }
  }
}


// let meshVerts = [];
// let originalVerts = [];
// const res = 50;

// function setup() {
//   createCanvas(1080, 1080, WEBGL);
  
//   // Create original and deformable vertices
//   for(let x = 0; x < res; x++){
//     for(let z = 0; z < res; z++){
//       // Create original positioning
//       let xPos = -width/2 + x * width/res;
//       let zPos = -width/2 + z * width/res;
      
//       // Calculate distance from center
//       let centerDist = dist(xPos, 0, zPos, 0, 0, 0);
      
//       let yPos = sin(x * 0.1) * cos(z * 0.1) * 20; // Base terrain variation
      
//       let vert = createVector(xPos, yPos, zPos);
//       meshVerts.push(vert);
//       originalVerts.push(vert.copy());
//     }
//   }
// }

// function draw() {
//   background(0);
//   lights();
  
//   // Rotate scene slightly for depth perception
//   rotateX(-PI/6);
//   translate(0,0,-width/4);
  
//   // Animate deformation
//   let t = frameCount * 0.05;
  
//   // Recreate vertices with animation
//   for(let x = 0; x < res; x++){
//     for(let z = 0; z < res; z++){
//       let index = x * res + z;
//       let orig = originalVerts[index];
//       let current = meshVerts[index];
      
//       // Calculate distance from center
//       let centerDist = dist(orig.x, 0, orig.z, 0, 0, 0);
      
//       // Twisting effect
//       let twistAngle = sin(t + centerDist * 0.1) * PI/4;
      
//       // Scrunching effect
//       let scrunch = sin(t * 1.3 + centerDist * 0.2) * 50;
      
//       // Downward pull in center (strongest at center)
//       let centerPull = map(centerDist, 0, width/2, -100, 0);
//       let yPull = sin(t) * centerPull;
      
//       // Rotate around Y axis
//       let rotatedX = orig.x * cos(twistAngle) - orig.z * sin(twistAngle);
//       let rotatedZ = orig.x * sin(twistAngle) + orig.z * cos(twistAngle);
      
//       // Update vertex position
//       current.x = rotatedX;
//       current.z = rotatedZ;
//       current.y = orig.y + 
//                   sin(x * 0.1) * cos(z * 0.1) * 20 + // Original terrain
//                   scrunch + 
//                   yPull;
//     }
//   }
  
//   // Render mesh
//   stroke(0, 50);
//   fill(200, 200, 255, 200);
  
//   for(let x = 0; x < res - 1; x++){
//     beginShape(TRIANGLE_STRIP);
//     for(let z = 0; z < res; z++){
//       let vrow = meshVerts[(x+1)*res + z];
//       vertex(vrow.x, vrow.y, vrow.z);
      
//       let vnextrow = meshVerts[x*res + z];
//       vertex(vnextrow.x, vnextrow.y, vnextrow.z);
//     }
//     endShape();
//   }

//   orbitControl();
// }