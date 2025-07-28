
    function knotPt(beta, a, b, c){
        let r = a * b * sin(0.5 * PI + 6 * beta)
        let theta = 4 * beta
        let phi = c * PI * sin(6 * beta)
        // r = 0.8 + 1.6 * sin(6 * beta)
        // theta = 2 * beta
        // phi = 0.6 * PI * sin(12 * beta)

        let x = r * cos(phi) * cos(theta)
        let y = r * cos(phi) * sin(theta)
        let z = r * sin(phi);

        return createVector(x,y,z);
    }

    function trefoil(t){
        let x = sin(t) + 2*sin(2*t);
        let y = cos(t) - 2*cos(2*t);
        let z = -sin(3*t)*cycleVariable(0.5, 2, 1000);
        return createVector(x,y,z);
    }

    function twothreetorusknot(t){
        let x = cos(2*t)*(2 + cos(3*t));
        let y = sin(2*t)*(2 + cos(3*t));
        let z = 3*sin(3*t) * cycleVariable(0.5,1.5, 1000);
        return createVector(x,y,z);
    }

    function cycleVariable(minVal, maxVal, cycleFrames, offset = 0){
        return map(0.5*(-cos(frameCount*TWO_PI/cycleFrames + offset)+ 1),0,1,minVal,maxVal);
    }

    function pqtorusknot(p, q, t){
        // q = q*cycleVariable(0.5, 1.5, 1500);
        // p = p*cycleVariable(1.5, 0.5, 1500);
        let r = cos(q*t)+ 1
        let x = r*cos(p*t);
        let y = r*sin(p*t);
        let z = -sin(q*t)*cycleVariable(0.5, 1.5, 1000);
        return createVector(x,y,z);
    }

