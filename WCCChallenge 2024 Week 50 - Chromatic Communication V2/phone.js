    class Phone{
        constructor(start, colour){
            this.pt = start.copy();
            this.curvePts = [];
            this.colour = colour;
            this.generateCurve();
            this.isCurrentMaster = false;
        }
        
        setColour(){
            this.colour = currentColour;
        }

        showMessage(){
            let t = progress <= 0.5 ? 2*progress : (1 - progress)*2;
            let p = getCurvePoint(this.pt, t);
            push();
            translate(p.x, p.y, p.z);
            fill(currentColour);
            noStroke();
            sphere((0.025)*width);
            pop();
            
        }

        showPt(){
            fill(255);
            push();
            translate(this.pt.x, this.pt.y, this.pt.z);
            sphere(10);
            pop();
        }

        generateCurve(){
            this.curvePts = [];
            for(let t = 0; t <= 1; t += 1/params.chordPathSteps){
                this.curvePts.push(getCurvePoint(this.pt, t));
            }
        }

        showCurve(){
            noFill();
            stroke(params.chordColour);
            let thicknessMultiplier = this.isCurrentMaster ? 5 : 1;
            strokeWeight(params.chordThickness * thicknessMultiplier);
            beginShape();
            for(let pt of this.curvePts){
                vertex(pt.x, pt.y, pt.z);
            }
            endShape();
        }

        showPhone(){
            push();
            // Translate to point on sphere
            translate(this.pt.x, this.pt.y, this.pt.z);
            let normal = this.pt.copy().normalize();
            
            // Create rotation matrix to align with normal vector
            const up = createVector(0, 1, 0);
            const rotationAxis = up.cross(normal);
            const rotationAngle = Math.acos(up.dot(normal));
            
            // Apply rotation
            rotate(rotationAngle, rotationAxis);
            
            // Draw box (long edge parallel to radius)
            noStroke();
            fill(this.colour);
            box(params.phoneSize*w/sqrt(2), params.phoneSize*w, params.phoneSize*0.2*w);  // Tall box oriented vertically
            
            pop();
        }
    }