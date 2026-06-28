/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 15 - "Pattern"
| 📅 Started      | 2025-04-12   
| 📅 Completed    | 2025-04-12       
| 🕒 Taken        | ~2hrs                     
| 🤯 Concept      | Interference patterns from 3 point sources
| 🔎 Focus        | Even MORE p5.Strands practice
| 🤖 AI-use       | Using Gemini's Guided Learning mode = just prompts you step by step through the process
Super handy.

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

📃The Algorithm📃
Set points on the screen
Look at the distance of each pixel to that point
Set brightness based on some sine wave based on that distance
Average the brightnesses to each source 

👉INTERACTION👈
Play with the controls

🎓 LESSONS LEARNED 🎓
- Turns out Gemini's Guided Learning Feature is pretty good at forcing you to do the work!

📦RESOURCES📦
- Easings.net
- Coolors.co for the palettes


🤔TO IMPROVE/FUTURE PLANS🤔
- User-movable point sources
- More adjustments
- Smoothstep to implement a tighter colour ramp to make the output less blurry?
Is definitely a problem due to averaging. 


*/
let interferencePatternShader;
let gui, params;
let colourA, colourB;
let t1 = 0;
let t2 = 0
let t3 = 0;
let p1, p2, p3;

let palettes = {
  "funky fusion": "#ff0f7b, #f89b29",
  "ocean breeze": "#0061ff, #60efff",
  "twilight firecracker": "#08415c, #cc2936",
  "mystic aqua": "#264653, #2a9d8f",
  "tropical sunset": "#ffba49, #20a39e",
  "cinnamon apricot": "#432371, #faae7b",
  "midnight forest": "#00272b, #e0ff4f",
  "navy cherry": "#0a2463, #fb3640",
  "frozen mystery": "#30c5d2, #471069"
}

function shaderCallback() {
    const colourA_Uni = uniformVector4(() => hexToVec4(colourA));
    const colourB_Uni = uniformVector4(() => hexToVec4(colourB));
    const p1_vec = uniformVector2(() => [p1.x, p1.y]);
    const p2_vec = uniformVector2(() => [p2.x, p2.y]);
    const p3_vec = uniformVector2(() => [p3.x, p3.y]);
    const p1_compress_Uni = uniformFloat(() => params.p1Compress);
    const p2_compress_Uni = uniformFloat(() => params.p2Compress);
    const p3_compress_Uni = uniformFloat(() => params.p3Compress);
    const t1_Uni = uniformFloat(() => t1);
    const t2_Uni = uniformFloat(() => t2);
    const t3_Uni = uniformFloat(() => t3);

    
    // 1. Create a variable to share data between shader stages
    let uv = sharedVec2();

    // 2. Grab the texture coordinates during the vertex input stage
    worldInputs.begin();
    uv = worldInputs.texCoord;
    worldInputs.end();

    finalColor.begin();
    // 1. Get position and calculate distance

    // 2. Calculate the wave
    function getBrightness(p, compression, t){
        const d = distance(uv, p);
        return  0.5 * (-cos(PI * t + d * compression) + 1);
    }

    const b1 = getBrightness(p1_vec, p1_compress_Uni, t1_Uni);
    const b2 = getBrightness(p2_vec, p2_compress_Uni, t2_Uni);
    const b3 = getBrightness(p3_vec, p3_compress_Uni, t3_Uni);

    const avBright = (b1 + b2 + b3)/3;
    
    // 3. Output the color
    const myColor = mix(colourA_Uni, colourB_Uni, avBright); 
    finalColor.set(myColor);
    finalColor.end(); 
}



function setup() {
    createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight), WEBGL);
    interferencePatternShader = buildColorShader(shaderCallback);
    noStroke();
    const getRandomNormP = () => {
        return createVector(random(width)/width, random(height)/height)
    }
    p1 = getRandomNormP();
    p2 = getRandomNormP();
    p3 = getRandomNormP();

    gui = new lil.GUI();
    params = {
        palette: "cinnamon apricot",
        p1Compress: 50,
        p2Compress: 50,
        p3Compress: 50,
        p1Rate: 0.635,
        p2Rate: 0.635,
        p3Rate: 0.635,
    }

    gui.add(params, 'palette', Object.keys(palettes)).onChange(() => setColoursByPaletteSelection());
    gui.add(params, 'p1Compress', 10, 200, 0.1);
    gui.add(params, 'p2Compress', 10, 200, 0.1);
    gui.add(params, 'p3Compress', 10, 200, 0.1);
    gui.add(params, 'p1Rate', 0.6, 0.7, 0.001);
    gui.add(params, 'p2Rate', 0.6, 0.7, 0.001);
    gui.add(params, 'p3Rate', 0.6, 0.7, 0.001);

    setColoursByPaletteSelection();
}

function hexToVec4(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, 1.0];
}

function setColoursByPaletteSelection(){
    const chosenPalette = palettes[params.palette].split(", ");
    colourA = chosenPalette[0];
    colourB = chosenPalette[1];
}

function draw() {
    background(220);
    t1 += PI * params.p1Rate;
    t2 += PI * params.p2Rate;
    t3 += PI * params.p3Rate;
    shader(interferencePatternShader);
    plane(width, height);
}
