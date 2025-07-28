let img;
let aspectRatio;
let gui, params;
let cw;
let ch;
let angle;
let buffer;
let gl;
let myShader, copied;
// https://editor.p5js.org/cacheflowe/sketches/TKFuqnxVE

function preload(){
  img = loadImage("AllFlags.jpg");
  aspectRatio = img.width/img.height;
}


function setup() {
  let aspectRatio = img.width / img.height;

    // Calculate canvas dimensions to fit the window while maintaining aspect ratio
    if (windowWidth / windowHeight > aspectRatio) {
        // Window is wider than the image's aspect ratio, so height is the limiting factor
        ch = windowHeight;
        cw = ch * aspectRatio;
    } else {
        // Window is taller or has the same aspect ratio, so width is the limiting factor
        cw = windowWidth;
        ch = cw / aspectRatio;
    }

    createCanvas(canvasWidth, canvasHeight, WEBGL);
    image(img, 0, 0, canvasWidth, canvasHeight);

 


  gui = new lil.GUI();
  params = {
    radius: 0.1
  }
  gui.add(params, 'radius', 0.001, 1.0, 0.001);

  myShader = createShader(vert, frag);
  // shader(myShader); // compile shader
  image(img, 0, 0);

  
 
}

function draw() {

  // get previous frame
  // let prevFrameImg = get();

  // 2. Pass uniforms to pg2's shader instance (not the main canvas's shader)
  // pg2.setUniform("uTime", millis() / 1000.0);
  // pg2.setUniform("uResolution", [width, height]);
  // pg2.setUniform('tex', pg1); // Pass the content of pg1 (the previous frame) as the input texture
  // pg2.setUniform('radius', params.radius);
  // pg2.setUniform('mouse', [map(mouseX,0, width, 1, 0), map(mouseY, 0, height, 0, 1*aspectRatio)]);
  // pg2.setUniform('angle', map(noise(frameCount*0.01), 0, 1, 0 , TWO_PI));

  // // 3. Draw a plane/rectangle to pg2. This renders the *new* frame's content to pg2's framebuffer using the shader.
  // pg2.rect(0, 0, 1, 1);

  // // 4. Draw the content of pg2 (the current frame's rendered output) to the main canvas.
  // // The main canvas uses its default drawing methods for this.
  // image(pg2, -width/2, -height/2, width, height);

  // // 5. Swap buffers for the next frame
  // let temp = pg1;
  // pg1 = pg2;
  // pg2 = temp;
}

let vert = `
	attribute vec3 aPosition;
	attribute vec2 aTexCoord;

	varying vec2 vUV;

	void main() {
		vUV = aTexCoord;

		vec4 position = vec4(aPosition, 1.0);
		position.xy = position.xy * 2.0 - 1.0;
		gl_Position = position;
	}
`;
let frag = `
	precision highp float;

	// we need our texcoords for drawing textures
	varying vec2 vUV;

	// images are sent to the shader as a variable type called sampler2D
	uniform sampler2D tex;

  uniform vec2 mouse;
  uniform float radius;
  uniform float angle;
  

	void main() {
		// by default, our texcoords will be upside down
    // let's flip them vertically and horizontally
		vec2 uv = vec2(1.0) - vUV;
    vec2 newUV = uv;

    float d = distance(uv, mouse);
    if(d < radius){
      // Calculate heading from brush center to pixel
      vec2 diff = uv - mouse;
      float h = atan(diff.y, diff.x); // heading() equivalent

      // Rotate the pixel's position around the brush center
      float x = mouse.x + d * cos(h + angle);
      float y = mouse.y + d * sin(h + angle);

      // Update the new pixel coordinate
      newUV = vec2(x, y);
    }

		// we can access our image by using the GLSL shader function texture2D()
		// texture2D expects a sampler2D, and texture coordinates as it's input
		vec4 texColor = texture2D(tex, newUV);

		// lets invert the colors just for fun
		gl_FragColor = texColor;
	}
`;

function windowResized() {
    // Recalculate canvas size if the window is resized
    let aspectRatio = img.width / img.height;
    if (windowWidth / windowHeight > aspectRatio) {
        canvasHeight = windowHeight;
        canvasWidth = canvasHeight * aspectRatio;
    } else {
        canvasWidth = windowWidth;
        canvasHeight = canvasWidth / aspectRatio;
    }
    resizeCanvas(canvasWidth, canvasHeight);
    image(img, 0, 0, canvasWidth, canvasHeight); // Redraw the image scaled
}