/*
| Author          | Project Somedays                    
| Title           | WCCChallenge 2026 Week 24 - "Beaufiful Burnout"
| 📅 Started      | 2025-06-14
| 📅 Completed    | 2025-06-14       
| 🕒 Taken        | 2hrs                 
| 🤯 Concept      | Modern Life Simulator X1000
| 🔎 Focus        | Whimsy
| 🤖 AI-use       | Trialling copilot - is autocomplete on speed. And equally wrong sometimes. 🪳 hunting/fixes also.

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Keep on top of tasks and make sure you recharge from time to time!

👉INTERACTION👈
Aim and Click

📦RESOURCES📦
- Coolors.co

🤔TO IMPROVE🤔
- Sound effects! Maybe a heartbeat that gets faster as energy gets lower? Or a coffee sip sound when you get the caffeine bonus?
- More varied task behaviours - maybe some that split into smaller tasks when hit, or some that move faster?
- Power-ups! Maybe a "meditation" power-up that gives you a temporary shield, or a "vacation" power-up that clears all tasks on screen.
- More visual feedback for hits - maybe a little explosion animation when you hit a task, or a screen shake when the head gets hit.
 
🎓LESSONS LEARNED🎓
- Copilot defs speeds things up - those task profiles would have taken me a hot minute to create
*/

let hittables = [];
let headAngle;
let energyLevel = 100;
let heads = [];
let currentHeadIx;
let headSize, headAspectRatio;
let bg;
let aim;
let bullets = [];
let bulletImg;
let endScreen;
let endHead;
let c;
let taskFreqency = 30; // how many frames between task spawns, lower is more frequent
let vel = 5;
let caffeineBonus = 1;
let caffeineStartFrame = 0;
let taskProfiles;
let caffeineDuration = 150; // how many frames the caffeine bonus lasts
let maxTaskSize = 4;


let healthBarCols = ["#e06666","#ea9999", "#ffe599","#b6d7a8", "#6aa84f"];

// effects for each task type
const effectExhaust = () => energyLevel = max(0, energyLevel - 10);
const effectCaffeine = () => {
    caffeineBonus = 2;
    caffeineStartFrame = frameCount;
}
const effectRecouperate = () => energyLevel = min(100, energyLevel + 20);
    

async function setup() {
    createCanvas(min(windowHeight, windowWidth), min(windowHeight, windowWidth));
    frameRate(30);
    pixelDensity(1);
    headSize = width * 0.3;
     // Adjust this value based on your head image's aspect ratio
    imageMode(CENTER);

    c = new p5.Vector(width/2, height/2);

    bulletImg = await loadImage('/assets/battery.png');
    bg = await loadImage('/assets/background.jpg');
    aim = await loadImage('/assets/reticle.png');
    endScreen = await loadImage('/assets/backgroundOnFire.jpg');
    heads = await Promise.all([
        loadImage('/assets/level0.png'),
        loadImage('/assets/level1.png'),
        loadImage('/assets/level2.png'),
        loadImage('/assets/level3.png'),
        loadImage('/assets/level4.png'),
    ]);

    taskProfiles = {
        "appointment": {icon: await loadImage('/assets/appointment.png'), effect: effectExhaust},
        "bed": {icon: await loadImage('/assets/bed.png'), effect: effectRecouperate},
        "bill": {icon: await loadImage('/assets/bill.png'), effect: effectExhaust},
        "bottle": {icon: await loadImage('/assets/bottle.png'), effect: effectExhaust},
        "coffee": {icon: await loadImage('/assets/coffee.png'), effect: effectCaffeine},
        "deadline": {icon: await loadImage('/assets/deadline.png'), effect: effectExhaust},
        "dishes": {icon: await loadImage('/assets/dishes.png'), effect: effectExhaust},
        "fenderbender": {icon: await loadImage('/assets/fenderbender.png'), effect: effectExhaust},
        "fine": {icon: await loadImage('/assets/fine.png'), effect: effectExhaust},
        "facebook": {icon: await loadImage('/assets/facebook.png'), effect: effectExhaust},
        "gardening": {icon: await loadImage('/assets/gardening.png'), effect: effectRecouperate},
        "gmail": {icon: await loadImage('/assets/gmail.png'), effect: effectExhaust},
        "gym": {icon: await loadImage('/assets/gym.png'), effect: effectRecouperate},
        "injury": {icon: await loadImage('/assets/injury.png'), effect: effectExhaust},
        "instagram": {icon: await loadImage('/assets/instagram.png'), effect: effectExhaust},
        "laundry": {icon: await loadImage('/assets/laundry.png'), effect: effectExhaust},
        "nappy": {icon: await loadImage('/assets/nappy.png'), effect: effectExhaust},
        "nature": {icon: await loadImage('/assets/nature.png'), effect: effectRecouperate},
        "parents": {icon: await loadImage('/assets/parents.png'), effect: effectExhaust},
        "pills": {icon: await loadImage('/assets/pills.png'), effect: effectExhaust},
        "presentation": {icon: await loadImage('/assets/presentation.png'), effect: effectExhaust},
        "pressure": {icon: await loadImage('/assets/pressure.png'), effect: effectExhaust},
        "runninglate": {icon: await loadImage('/assets/runninglate.png'), effect: effectExhaust},
        "running": {icon: await loadImage('/assets/running.png'), effect: effectRecouperate},
        "sms": {icon: await loadImage('/assets/sms.png'), effect: effectExhaust},
        "linkedin": {icon: await loadImage('/assets/linkedin.png'), effect: effectExhaust},
        "nature": {icon: await loadImage('/assets/nature.png'), effect: effectRecouperate},
        "presentation": {icon: await loadImage('/assets/presentation.png'), effect: effectExhaust},
        "shopping": {icon: await loadImage('/assets/shopping.png'), effect: effectExhaust},
        "twitter": {icon: await loadImage('/assets/twitter.png'), effect: effectExhaust},
    }

    
    endHead = await loadImage('/assets/level-1.png');
    if(endHead) aspectRatio = endHead.width / endHead.height;

    noCursor();
}

function draw() {
    // show background
    if(bg) image(bg, width / 2, height / 2, width, height);

    // every 20 seconds, increase task frequency
    if(frameCount % (20 * 30) === 0){
        taskFreqency = max(5, taskFreqency - 1); // lower is more frequent, with a minimum of 5 frames between spawns
        // console.log("Increased task frequency! Current frequency: " + taskFreqency);
    }


    

    // decide how stressed Pete is based on energy level
    currentHeadIx = constrain(floor(energyLevel / 20), 0, 4);
    
    // wobble head around for fun
    headAngle = map(noise(frameCount * 0.01), 0, 1, -PI / 16, PI / 16);

    // show head
    push();
    translate(width / 2, height / 2);
    rotate(headAngle);
    fill(255, 0, 0);
    if(heads[currentHeadIx]) {
        image(heads[currentHeadIx], 0, 0, headSize, headSize / (heads[currentHeadIx].width/ heads[currentHeadIx].height));
    }
    pop();

    // spawn tasks randomly
    if(frameCount % taskFreqency === 0){
        let taskType = taskProfiles[random(Object.keys(taskProfiles))]; // choose a random task type        tasks = new Hittable(random)
        let task = new Hittable(taskType.icon, floor(random(1, maxTaskSize)), random(TWO_PI), random(-0.05, 0.05), taskType.effect);
        hittables.push(task);
     }
    

    // move the tasks toward the head and display them
    hittables.forEach(task => {
        task.update();
        task.display();
    });

    // deal with bullets
    bullets.forEach(bullet => {
        bullet.update();
        bullet.display();
    });
    cleanUpBullets();

    // detect collisions
    detectCollisions();
    detectHeadHits();
    // clean up tasks
    cleanUpTasks();
    // display health bar
    displayHealth();

    // end game
    
    if(energyLevel <= 0){
        push();
        translate(width/2 + random(width*0.1), height/2 + random(height*0.1));
        if(endScreen) image(endScreen, 0,0, width*1.1, height*1.1);
        if(endHead) image(endHead, 0,0, width*0.75, width*0.75 / aspectRatio);
        pop();
    }

    // end caffeine bonus after duration
    if(caffeineBonus > 1 && frameCount - caffeineStartFrame > caffeineDuration){
        caffeineBonus = 1;
        // console.log("Caffeine bonus ended.");
    }       
    
    // if coffeeMode show coffee symbols around head
        if(caffeineBonus > 1){
            for(let i = 0; i < 5; i++){
                let angle = random(TWO_PI);
                let radius = random(headSize / 2, headSize);
                let x = width / 2 + cos(angle) * radius;
                let y = height / 2 + sin(angle) * radius;
                if(taskProfiles["coffee"].icon) image(taskProfiles["coffee"].icon, x, y, 30, 30);
            }
        }

    // show reticle - needs to be on top always for aiming
    if(aim) image(aim, mouseX, mouseY, 50, 50);

}


function fireBullet(){
    let angleToMouse = atan2(mouseY - height / 2, mouseX - width / 2);
    let bullet = new Bullet(angleToMouse, random(-0.05, 0.05));
    bullets.push(bullet);
    energyLevel = max(0, energyLevel - 1*caffeineBonus);
    console.log("Fired bullet! Energy level: " + energyLevel);
}

function cleanUpTasks(){
    for(let i = hittables.length - 1; i >= 0; i--){
        if(hittables[i].health <= 0){
            hittables.splice(i, 1);
        }
    }
}

function cleanUpBullets(){
    for(let i = bullets.length - 1; i >= 0; i--){
        if(bullets[i].pos.x < 0 || bullets[i].pos.x > width || bullets[i].pos.y < 0 || bullets[i].pos.y > height){
            bullets.splice(i, 1);
        }
    }
}

function detectCollisions(){
    for(let b of bullets){
        for(let t of hittables){
            let d = dist(b.pos.x, b.pos.y, t.pos.x, t.pos.y);
            if(d < t.health * 25){ // collision detected, using health as proxy for size
                t.health -= 1; // reduce task health
                b.pos = createVector(-100, -100); // move bullet off-screen to be cleaned up
                // console.log("Hit task! Task health: " + t.health);
                if(t.health <= 0){
                    t.effect(); // apply task effect if destroyed
                }
                break; // stop checking other tasks for this bullet
            }
        }
    }   // placeholder for future collision detection between bullets and tasks  
}

function detectHeadHits(){
    for(let t of hittables){
        let d = dist(t.pos.x, t.pos.y, width/2, height/2);
        if(d < headSize/2){ // collision detected
            energyLevel = max(0, energyLevel - 10); // reduce energy level
            t.pos = createVector(-100, -100); // move task off-screen to be cleaned up
            // console.log("Head hit! Energy level: " + energyLevel);
        }
    }
}

function mousePressed(){
    fireBullet();
}

class Bullet{
    constructor(dir, angularVel){
        this.pos = createVector(width / 2, height / 2);
        this.vel = p5.Vector.fromAngle(dir).mult(vel * caffeineBonus);
        this.angle = dir;
        this.angularVel = angularVel;
    }

    update(){
        this.pos.add(this.vel);
        this.angle += this.angularVel;
    }

    display(){
        if(!bulletImg) return;
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);
        imageMode(CENTER);
        image(bulletImg, 0, 0, 50, 50);
     
        pop();
    }
}

function displayHealth(){
    // multi-coloured bar
    push();
    translate(width*0.1, height*0.9)
    for(let i = 0; i < 5; i++){
        fill(healthBarCols[i]);
        rect(i * (width*0.8/5), 0, width*0.8/5, height*0.05);
    }
    pop();

    let healthX = map(energyLevel, 0, 100, width*0.1, width*0.9);
    fill(255);
    rect(healthX - 5, height*0.9 - 5, 10, height*0.05 + 10);
    
}

class Hittable{
    constructor(icon, strength, angle, angularVel, effect){
        let a = random(TWO_PI);
        this.icon = icon;
        this.health = strength;
        this.pos = createVector(1.1*width*cos(a), 1.1*width*sin(a));
        this.vel = p5.Vector.sub(createVector(width/2, height/2), this.pos).setMag(2);
        this.angle = angle;
        this.angularVel = angularVel;
        this.effect = effect;
    }


    update(){
        this.pos.add(this.vel);
        this.angle += this.angularVel;
    }

    display(){
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);
        imageMode(CENTER);
        image(this.icon, 0, 0, this.health * 50, this.health * 50);
        pop();
    }
}

