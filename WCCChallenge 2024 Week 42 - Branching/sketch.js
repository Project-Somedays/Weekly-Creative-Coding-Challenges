/*
Author: Project Somedays
Date: 2024-10-14
Title: WCCChallenge 2024 Week 42 - Branching

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

IK arms are reaching for a random point on a sphere around their anchor point

*/


let params, gui;

let baseArms = [];
let allArms = [];
let alphaArm;
let cpt;
let baseArmBiz, secondaryArmBiz, tertiaryArmBiz, colourBiz;




function setup(){
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createCanvas(1080, 1080, WEBGL);
  pixelDensity(1);

  cpt = createVector(0,0,0);

  gui = new lil.GUI();
  params = {
    bgColour: "#000000",
    armColour: "#6f2da8",
    noiseSpeed : 1/1200,
    curl: 0.33,
    useNormalMaterial : true,
    baseArmCount: 5,
    baseArmSegments: 10,
    secondaryArmSegments: 8, 
    tertiaryArmSegments: 6,
    knuckleSize: 0.66,
    baseArmFirstBranchKnuckle: 4,
    baseArmThickness: width/40,
    baseArmSegmentLength: width/100,
    secondaryArmThickness: width/60,
    secondaryArmFirstBranchKnuckle: 2,
    secondaryArmSegmentLength: width/200,
    tertiaryArmThickness: width/80,
    tertiaryArmSegmentLength: width/300
  }

  gui.add(params, 'noiseSpeed', 1/2400, 1/30);
  gui.add(params, 'knuckleSize', 0, 1).onChange(value => {
    for(let arm of allArms){
      arm.setKnuckleProportion(value);
    }
  });
  gui.add(params, 'curl', 0, 1);
  colourBiz = gui.addFolder("Colour Biz");
  colourBiz.addColor(params, 'bgColour');
  colourBiz.addColor(params, 'armColour').onChange(value => {
    for(let arm of allArms){
      arm.setCol(value);
    }
  });
  colourBiz.add(params, 'useNormalMaterial').onChange(value => {
    for(let arm of allArms){
      arm.setNormalMaterialState(value);
    }
  })
  
  // Base Arm Biz
  baseArmBiz = gui.addFolder("Base Arm Biz");
  baseArmBiz.add(params, 'baseArmCount', 1, 10, 1).onChange(_ => allArms = generateArms());
  baseArmBiz.add(params, 'baseArmSegments', 5, 20, 1).onChange(_ => allArms = generateArms());
  baseArmBiz.add(params, 'baseArmFirstBranchKnuckle', 0, params.baseArmSegments-1, 1).onChange(_ => allArms = generateArms());
  baseArmBiz.add(params, 'baseArmThickness', width/500, width/20).onChange(value => {
    let baseArms = allArms.filter(e => e.type === 'BASE');
    for(let arm of baseArms){
      arm.setSegmentThickness(value);
    }
  });
  baseArmBiz.add(params, 'baseArmSegmentLength', width/100, width/10).onChange(value => {
    let baseArms = allArms.filter(e => e.type === 'BASE');
    for(let arm of baseArms){
      arm.setSegmentLength(value);
    }
  });

  // Secondary Arm Biz
  secondaryArmBiz = gui.addFolder("Secondary Arm Biz");
  secondaryArmBiz.add(params, 'secondaryArmSegments', 4, 10, 1).onChange(_ => allArms = generateArms());
  secondaryArmBiz.add(params, 'secondaryArmFirstBranchKnuckle', 0, params.secondaryArmSegments -1, 1).onChange(_ => allArms = generateArms());;
  secondaryArmBiz.add(params, 'secondaryArmThickness', width/500, width/20).onChange(value => {
    let theseArms = allArms.filter(e => e.type === 'SECONDARY');
    for(let arm of theseArms){
      arm.setSegmentThickness(value);
    }
  });
  secondaryArmBiz.add(params, 'secondaryArmSegmentLength', width/100, width/10).onChange(value => {
    let theseArms = allArms.filter(e => e.type === 'SECONDARY');
    for(let arm of theseArms){
      arm.setSegmentLength(value);
    }
  });

  // TertiaryArmBiz
  tertiaryArmBiz = gui.addFolder("Tertiary Arm Biz");
  tertiaryArmBiz.add(params, 'tertiaryArmSegments', 1, 10, 1).onChange(_ => allArms = generateArms());
  tertiaryArmBiz.add(params, 'tertiaryArmThickness', width/500, width/20).onChange(value => {
    let theseArms = allArms.filter(e => e.type === 'TERTIARY');
    for(let arm of theseArms){
      arm.setSegmentThickness(value);
    }
  });
  tertiaryArmBiz.add(params, 'tertiaryArmSegmentLength', width/100, width/10).onChange(value => {
    let baseArms = allArms.filter(e => e.type === 'TERTIARY');
    for(let arm of baseArms){
      arm.setSegmentLength(value);
    }
  });


  // alphaArm = new Arm(cpt, 20, width/40, width/100);

  allArms = generateArms();
  


  describe("Cthulu-esque 3D Inverse Kinematics creature reaches for we know not");
}



function draw(){
  background(params.bgColour);

  directionalLight(255,255, 255, 0.5,-0.5,0);
  directionalLight(255, 255, 255, -0.5, -0.5, 0);
  directionalLight(255, 255, 255, 0.5, 0.5, 0);
  directionalLight(255, 255, 255, -0.5, 0.5, 0);
  
 
  for(let arm of allArms){
    arm.update();
    arm.show();
  }

  orbitControl();
}


function generateArms(){
  let allArms = [];
  for(let i = 0; i < params.baseArmCount; i++){
    let baseArm = new Arm(cpt, params.baseArmSegments, width/40, width/100, params.knuckleSize, "BASE", true, params.armColour);
    for(let j = params.baseArmFirstBranchKnuckle; j < baseArm.segments.length; j++){
      let newBranch = new Arm(baseArm.segments[j].b, params.secondaryArmSegments, width/60, width/200, params.knuckleSize, "SECONDARY", true, params.armColour);
      newBranch.setParent(baseArm, j);
      for(let k = params.secondaryArmFirstBranchKnuckle; k < newBranch.segments.length; k++){
        let auxBranch = new Arm(newBranch.segments[k].b, params.tertiaryArmSegments, width/80, width/300, params.knuckleSize, "TERTIARY", true, params.armColour);
        auxBranch.setParent(newBranch, k);
        allArms.push(auxBranch);
      }
      allArms.push(newBranch);
    }

    allArms.push(baseArm);
  }

  return allArms;

}


function randomPointOnSphere(radius, noiseOffset, cx, cy, cz) {
  // Generate smooth random values using Perlin noise
  let theta = noise(noiseOffset + frameCount*TWO_PI*params.noiseSpeed) * PI;     // Latitude (0 to π)
  let phi = noise(noiseOffset + 100 + frameCount*TWO_PI*params.noiseSpeed) * TWO_PI; // Longitude (0 to 2π)

  // Convert spherical coordinates (theta, phi) to Cartesian (x, y, z)
  let r = radius * (1 - params.curl)/2;
  let x = r * sin(theta) * cos(phi);
  let y = r * sin(theta) * sin(phi);
  let z = r * cos(theta);

  // Return the point as a vector
  return createVector(x + cx, y + cy, z + cz);
}

// function windowResized(){
//   resizeCanvas(windowWidth, windowHeight, WEBGL);
//   allArms = generateArms();
// }