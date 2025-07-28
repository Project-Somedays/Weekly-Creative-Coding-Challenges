// class Hill{
//   constructor(world){
//     this.pts = []
//     this.pts.push({x: width, y: height}); // bottom LH Corner
//     for(let i = n; i >= 0; i--){
//       let x = step * (n - i);
//       let y = getY(x); // y will go smoothly from the bottom of the screen to the top 
//       this.pts.push({x: x, y: y});
//     }
//     this.pts.push({x:0, y: height}); // botton RH corner

//     this.body = Bodies.fromVertices(width, height, this.pts, {isStatic: true});
//     World.add(world, this.body);
//   }

//   show(){
//     fill(0);
//     noStroke();
//     beginShape();
//     vertex(0, height);
//     for(let p of this.pts){
//       vertex(p.x, p.y);
//     }
//     vertex(width, height);
//     endShape();
//   }
// }


// class Hill{
//   constructor(world){
//     this.world = world; // Store world for adding body

//     // We'll define the vertices for the Matter.js body
//     // relative to an assumed origin for the polygon, and then
//     // Matter.js will compute the center of mass.
//     // The key is to create a closed polygon that outlines your hill shape.
//     let hillVertices = [];

//     // Add bottom-left corner of the polygon
//     hillVertices.push({x: 0, y: height});

//     // Add points along the top curve of the hill
//     // These points should be relative to the (0,0) of the *polygon*
//     // but since our hill extends across the whole width, we can use absolute screen coords here.
//     for(let i = 0; i < n + 1; i++){
//       let x = step * i;
//       let y = getY(x);
//       hillVertices.push({x: x, y: y});
//     }

//     // Add bottom-right corner of the polygon to close the shape
//     hillVertices.push({x: width, y: height});

//     // Use Bodies.fromVertices.
//     // Matter.js will calculate the center (x, y) for this polygon based on the vertices you provide.
//     // So, we don't need to explicitly calculate a 'center' here for 'fromVertices'.
//     // Just providing the vertices is enough.
//     // The poly-decomp library (which you've included) helps Matter.js handle concave shapes.
//     this.body = Matter.Bodies.fromVertices(width / 2, height / 2, hillVertices, {
//         isStatic: true,
//         label: 'Hill'
//     });

//     // IMPORTANT: Matter.js calculates the actual center of the body based on the vertices.
//     // The 'x' and 'y' in Bodies.fromVertices determine where that calculated center will be placed.
//     // For a full-width hill, setting it to (width/2, height/2) should generally work,
//     // as Matter.js will shift the body so its calculated centroid aligns with (width/2, height/2).

//     World.add(this.world, this.body); // Add to the Matter.js world
//   }

//   show(){
//     fill(0); // Black for the hill
//     noStroke();
//     beginShape();
//     // Draw the hill using the actual vertices from the Matter.js body
//     // This ensures your p5.js drawing matches the physics shape precisely.
//     for(let i = 0; i < this.body.vertices.length; i++){
//       vertex(this.body.vertices[i].x, this.body.vertices[i].y);
//     }
//     endShape(); // Close the shape
//   }
// }

// class Hill {
//   constructor(world) {
//     this.world = world;

//     // --- Define vertices relative to the desired placement point (e.g., bottom-left corner) ---
//     let localHillVertices = [];

//     // Assuming the bottom-left corner of the hill in its local coordinate system is (0,0).
//     // The first point is now relative to this local origin.
//     // localHillVertices.push({ x: 0, y: 0 }); // No need to explicitly add this if it's the assumed origin for the rest

//     // Add points along the top curve of the hill.
//     // These need to be adjusted relative to the local origin (0,0) for the hill's shape.
//     // Since our hill is positioned from x=0 to x=width, and its bottom is at y=height,
//     // we need to offset the y-coordinates.
//     for (let i = 0; i < n + 1; i++) {
//       let x = step * i;
//       let y = getY(x); // This getY gives absolute screen Y
//       // To make it relative to the bottom-left corner (0, height),
//       // subtract 'height' from the Y coordinate.
//       // So, a point at screen (x, Y_screen) becomes (x, Y_screen - height) in local coords.
//       localHillVertices.push({ x: x, y: y - height });
//     }

//     // Add bottom-right corner, relative to local (0,0) which is screen (0, height).
//     // So, screen (width, height) becomes (width, 0) in local coords.
//     localHillVertices.push({ x: width, y: 0 });

//     // Now, create the body.
//     // The (x, y) here specifies where the *calculated centroid* of the 'localHillVertices' shape
//     // should be placed in the *world*.
//     // If we want the bottom-left of our 'localHillVertices' (which is (0,0) in local space)
//     // to be at screen (0, height), we need to compute the offset.

//     // A simpler way for a full-screen bottom shape is to just let Matter.js calculate the centroid
//     // from the absolute screen coordinates (as you had before but with the fix for the polygon shape),
//     // and then use Body.setPosition to put it where you want.

//     // Let's use the absolute screen coordinates for vertices but then
//     // use setPosition to move it. This is often more intuitive for full-screen static geometry.
//     let absoluteHillVertices = [];
//     absoluteHillVertices.push({ x: 0, y: height }); // Bottom-left
//     for(let i = 0; i < n + 1; i++){
//       let x = step * i;
//       let y = getY(x);
//       absoluteHillVertices.push({ x: x, y: y }); // Points along the curve
//     }
//     absoluteHillVertices.push({ x: width, y: height }); // Bottom-right

//     // Create the body. Matter.js will calculate its centroid from `absoluteHillVertices`.
//     // The initial (0,0) for fromVertices doesn't matter much for static bodies if you immediately reposition.
//     this.body = Matter.Bodies.fromVertices(0, 0, absoluteHillVertices, { // Use 0,0 for initial pos
//         isStatic: true,
//         label: 'Hill'
//     });

//     // Now, explicitly set the position of the *body's centroid* to where it would naturally be
//     // if the vertices were drawn in place. Matter.js's fromVertices will calculate this for you.
//     // The position Matter.js calculates for the body after creation is its centroid.
//     // We want the hill to span from (0, height) to (width, height) and up to its curve.
//     // So we position the body to align with its calculated bounds.
//     Matter.Body.setPosition(this.body, {
//         x: this.body.bounds.min.x + (this.body.bounds.max.x - this.body.bounds.min.x) / 2,
//         y: this.body.bounds.min.y + (this.body.bounds.max.y - this.body.bounds.min.y) / 2
//     });


//     World.add(this.world, this.body);
//   }

//   show() {
//     fill(0); // Black for the hill
//     noStroke();
//     beginShape();
//     // Drawing using the actual vertices from the Matter.js body ensures
//     // that the p5.js drawing perfectly matches the physics shape.
//     for (let i = 0; i < this.body.vertices.length; i++) {
//       vertex(this.body.vertices[i].x, this.body.vertices[i].y);
//     }
//     endShape(CLOSE);
//   }
// }