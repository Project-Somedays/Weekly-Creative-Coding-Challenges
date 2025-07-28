  /*
  Author: Project Somedays
  Date: Started 2024-07-28, "finished" 2024-11-10
  Title: WCCChallenge - Reproduction

  I remember some game from way back when where you could make a looping little dancing character.
  Who's the best dancer I know? The Jiggler from Adventure time 🥳: https://youtu.be/HS_GbPdF_QI?si=f44TMG_z0qBW1_69&t=108
	
	Finishing off a project from "Draggable" that I ran out of time on from a few months back

  Recording the positions during record mode and then boomeranging them back = REPRODUCTION of user input.

  INTERACTION/INSTRUCTIONS
  You animate the body and each limb one at a time

  Step 1: Select CurrentlyAnimating from dropdown
  Step 2: Hit Space to start record mode
  Step 3: Click and drag to record positions
  Step 4: Release to finish recording
  Step 5: Repeat for all body parts

  'FollowPathMode' in the lil-gui window to view

  MUSIC
  - "The Dance Music" by moodmode: https://pixabay.com/music/upbeat-the-dance-music-211276/
  - "Upbeat Pop Dance" by Vivaleum: https://pixabay.com/music/pop-upbeat-pop-dance-186805/
  - "AMALGAM" by Rockot: https://pixabay.com/music/future-bass-amalgam-217007/

  IMAGES
  - Jiggler: https://static.wikia.nocookie.net/adventuretimewithfinnandjake/images/c/cc/The_Jiggler.png/revision/latest?cb=20120620191026
  - Recording Sign: https://www.freepik.com/icon/recording_11736738
	- The Adventure Time lounge room: https://live.staticflickr.com/2442/3992568609_1d3f13761f_b.jpg


  */

  let params, gui;
  let recordingMode;
  let song1, song2, song3;
  let maxLength;
  let armSegments = 20;
  let canvas;

  let positions = [];
  let startFrame = 0;
  let jigglerImg;
  let jigglerScl;

  let boomerang = [];
  let songs;
  let selectedSong;
  let isRecording = false;
  let bodyPosRecorder, armLeft, legLeft, rightArm, legRight;
  let house;
  let showInstructions = false;
  let recordingSign;
  let calibrationHeight = 1347;
  let calibrationWidth = 1347;
  let xScl, yScl;

  function toggleShowInstructions(){
    showInstructions = !showInstructions;
  }

  function wipeRecordingFromCurrent(){
    params.currentlyAnimating.reset();
    console.log(`Animation wiped from ${params.currentlyAnimating.name}`);
  }


  function preload(){
    song1 = loadSound("the-dance-music-211276.mp3");
    song2 = loadSound("upbeat-pop-dance-186805.mp3");
    song3 = loadSound("amalgam-217007.mp3");
    jigglerImg = loadImage("The_Jiggler.png");
    house = loadImage("Adventure Time House.jpg");
    recordingSign = loadImage("recording_11736738.png");
  }

  function setup() {
    // canvas = createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
    canvas = createCanvas(1080, 1080); 
    canvas.elt.tabIndex = 0;
		rectMode(CENTER);
    gui = new lil.GUI();
    jigglerScl = 0.6*height/1080;
    maxLength = 0.33 * width;
    imageMode(CENTER);
    xScl = width/calibrationWidth;
    yScl = height/calibrationHeight;
    armLeft = {posRecorder : new PosRecorder("Arm Left"), limb : new Limb(createVector(190.5*xScl, 192.5*yScl), createVector(mouseX, mouseY), 20, maxLength)};
    armRight = {posRecorder : new PosRecorder("Arm Right"), limb : new Limb(createVector(-175.5*xScl, 208.5*yScl), createVector(mouseX, mouseY), 20, maxLength)};
    legRight = {posRecorder : new PosRecorder("Leg Right"), limb : new Limb(createVector(-77.5*xScl, 334.5*yScl), createVector(mouseX, mouseY), 10, maxLength*0.6)};
    legLeft = {posRecorder : new PosRecorder("Leg Left"), limb : new Limb(createVector(107.5*xScl, 337.5*yScl), createVector(mouseX, mouseY), 10, maxLength*0.6)};
    selectedSong = song1;
    
    fill(255);
    textSize(height/25);
    textAlign(CENTER, CENTER);

    bodyPosRecorder = new PosRecorder("Jiggler Body");
    
    frameRate(60);

    params = {
      "Playback Mode": false,
      song: song1,
      currentlyAnimating: bodyPosRecorder,
      "Toggle Instructions": toggleShowInstructions,
      "Reset Animation" : wipeRecordingFromCurrent
    }
    
    gui.add(params, 'selectedSong', {"The Dance Music": song1, "Upbeat Pop Dance": song2, "AMALGAM": song3})
      .onChange(value => {
        selectedSong.stop();
        selectedSong = value;
        selectedSong.loop();
      });
    
    gui.add(params, 'Playback Mode')
      .onChange(value => {
        if(value) startLoop();
      })

    gui.add(params, 'currentlyAnimating', {'body': bodyPosRecorder, 'left arm': armLeft.posRecorder, 'right arm': armRight.posRecorder, 'left leg': legLeft.posRecorder, 'right leg': legRight.posRecorder})
    .onChange(value => {
      canvas.elt.focus();
      console.log(`Now animating ${value.name}`);
  });

    gui.add(params, 'Toggle Instructions');
    gui.add(params, 'Reset Animation');

    params.song.play();
  }

  function startLoop(){
    startFrame = 0
  }

  function draw() {
    background(0);

    if(showInstructions){
			noStroke();
			fill(255);
      text("Instructions\n\nIt's a dance party!\n1. Select CurrentlyAnimating from dropdown\n2. Hit Space to start record mode\n3. Click and drag to record positions\n4. Release to finish recording\n5. Repeat for all body parts\n\n'FollowPathMode' to view\n\n'Toggle Instructions' to show/hide", width/2, height/2);
      return;
    }

    // show the adventure time loungeroom
    image(house, width/2, height/2, house.width * height/house.height, height);

    fill(255);
    
    if(params["Playback Mode"]){
      if(bodyPosRecorder.boomerang.length > 0) bodyPosRecorder.loopBiz();
      push();
      let p = bodyPosRecorder.boomerang.length === 0 ? createVector(width/2, height/2) :  bodyPosRecorder.getCurrentCoords();
      translate(p.x, p.y);
      // left arm
      playbackLimb(armLeft);
      // left leg
      playbackLimb(legLeft);
      
			// body
      image(jigglerImg, 0, 0, jigglerImg.width * jigglerScl, jigglerImg.height * jigglerScl);
      
      
      // right arm
      playbackLimb(armRight);
      // right leg
      playbackLimb(legRight);
      pop();
      
      
      
      return;
    }
    
		// show standby mode
		if(!isRecording){
			textSize(height/30)
			noStroke();
			fill(255);
			rect(width/2, height/8, width, height/4);
			fill(0);
			text("Standby Mode\nHit Space then Click and Drag to Record. Release to stop\nOR Hit Space and move around. Hit Space again to stop\nClick 'Playback Mode' to see it all come together!", width/2, height/8);
		}
		
		// so there's not a double-up on recording positions
		if(isRecording && !mouseIsPressed) params.currentlyAnimating.addPos(mouseX, mouseY);
    
		switch(params.currentlyAnimating.name){
      case "Jiggler Body":
        showRecordingJigglerBody();
        break;
      case "Arm Left":
        showRecordingLimb(armLeft.limb);
        showDefaultPosJigglerBody();
        break;
      case "Arm Right":
        showDefaultPosJigglerBody();
        showRecordingLimb(armRight.limb)
        break;
      case "Leg Left":
        showDefaultPosJigglerBody();
        showRecordingLimb(legLeft.limb);
        break;
      case "Leg Right":
        showDefaultPosJigglerBody();
        showRecordingLimb(legRight.limb);
        break;
      default:
        break;
    }

    // flash the recording symbol
    if(isRecording && cos(frameCount * TWO_PI/120) > -0.66) image(recordingSign, width/2, height/8, recordingSign.width * 0.1 * height / recordingSign.height, 0.1*height);
  
	}

  function playbackLimb(thisLimb){
    if(thisLimb.posRecorder.boomerang.length === 0) return; // do nothing if we haven't recorded yet

    thisLimb.posRecorder.loopBiz();
    let target = thisLimb.posRecorder.getCurrentCoords();
    thisLimb.limb.setTarget(target);
    thisLimb.limb.update();
    push();
    translate(-width/2, -height/2);
    thisLimb.limb.show();
    pop();
  }

  function showRecordingLimb(thisLimb){
    thisLimb.setTarget(createVector(mouseX, mouseY));
    thisLimb.update();
    thisLimb.show();
  }

  function showRecordingJigglerBody(){
    push();
    translate(mouseX, mouseY);
    // let a = map(this.boomerang[this.index])
    image(jigglerImg, 0, 0, jigglerImg.width*jigglerScl, jigglerImg.height*jigglerScl);
    pop();
  }

  function showDefaultPosJigglerBody(){
    push();
    translate(width/2, height/2);
    // let a = map(this.boomerang[this.index])
    image(jigglerImg, 0, 0, jigglerImg.width*jigglerScl, jigglerImg.height*jigglerScl);
    pop();
  }

  function mouseDragged(){
    if(isRecording) params.currentlyAnimating.addPos(mouseX, mouseY);
  }

  function keyPressed(){
    if (key.toLowerCase() === 'c' && keyIsDown(CONTROL)) {
      copyMousePositionToClipboard();
    }

    switch(key.toLowerCase()){
      case 'm':
        if(selectedSong.isPlaying()){
          selectedSong.stop();
        }else {
          selectedSong.loop();
        }
        break;
      case 'r':
        params.currentlyAnimating.reset() 
        break;
      case ' ':
        isRecording = !isRecording;
				if(!isRecording) finishRecording(); // i.e. when we've finished the recording
        break;
      default:
        break;
    }
    
  }

  function mouseReleased(){
    if(isRecording){
      finishRecording();
      isRecording = false;
    }
  }

	function finishRecording(){
		params.currentlyAnimating.makeBoomerang();
		console.log(`${params.currentlyAnimating.name} animation captured`);
		console.log("Boomerang recorded. Click 'Follow Mode' to play back.");
	}

  // function windowResized(){
  //   resizeCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  //   xScl = width/calibrationWidth;
  //   yScl = height/calibrationHeight;
  // }


  function copyMousePositionToClipboard() {
    let offset = p5.Vector.sub(createVector(mouseX, mouseY), createVector(width/2, height/2));
    const positionText = `createVector(${offset.x}*xScl, ${offset.y}*yScl)`;
    navigator.clipboard.writeText(positionText)
      .then(() => {
        console.log('Mouse position copied to clipboard:', positionText);
      })
      .catch(err => {
        console.error('Failed to copy mouse position:', err);
      });
  }






