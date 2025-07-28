
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
        let z = -sin(3*t);
        return createVector(x,y,z);
    }

    function twothreetorusknot(t){
        let x = cos(2*t)*(2 + cos(3*t));
        let y = sin(2*t)*(2 + cos(3*t));
        let z = 3*sin(3*t);
        return createVector(x,y,z);
    }

   

    function pqtorusknot(p, q, t){
        let r = cos(q*t)+ 1
        let x = r*cos(p*t);
        let y = r*sin(p*t);
        let z = -sin(q*t);
        return createVector(x,y,z);
    }

    function pqtorusknot_2_3(t){
        let p = 2;
        let q = 3;
        let r = cos(q*t)+ 1
        let x = r*cos(p*t);
        let y = r*sin(p*t);
        let z = -sin(q*t);
        return createVector(x,y,z);
    }
    function pqtorusknot_3_4(t){
        let p = 3;
        let q = 4;
        let r = cos(q*t)+ 1
        let x = r*cos(p*t);
        let y = r*sin(p*t);
        let z = -sin(q*t);
        return createVector(x,y,z);
    }

    function pqtorusknot_2_5(t){
        let p = 2;
        let q = 5;
        let r = cos(q*t)+ 1
        let x = r*cos(p*t);
        let y = r*sin(p*t);
        let z = -sin(q*t);
        return createVector(x,y,z);
    }

    function eightknot(t){
        let x = 10*(cos(t) + cos(3*t)) + cos(2*t) + cos(4*t);
        let y = 6*sin(t) + 10*sin(3*t);
        let z = 4*sin(3*t)*sin(5*t / 2) + 4*sin(4*t) - 2*sin(6*t);
        return createVector(x,y,z).mult(0.15);
    }

    function cinquefoilknotk2(u){
        let k = 2;
        let t = map(u, 0, TWO_PI, 0, 4*(k+2)*PI);
        let x = cos(t)*( 2 - cos(2*t/(2*k + 1)) );
        let y = sin(t)*( 2 - cos(2*u/(2*k + 1)) );
        let z = -sin(2*t/(2*k + 1));
        return createVector(x,y,z).mult(1.1);
// where 0 < u < (4 k + 2) pi
    }

    function cinquefoilknotk3(u){
        let k = 3;
        let t = map(u, 0, TWO_PI, 0, 4*(k+2)*PI);
        let x = cos(t)*( 2 - cos(2*t/(2*k + 1)) );
        let y = sin(t)*( 2 - cos(2*u/(2*k + 1)) );
        let z = -sin(2*t/(2*k + 1));
        return createVector(x,y,z).mult(1.1);
// where 0 < u < (4 k + 2) pi
    }

    function cinquefoilknotk4(u){
        let k = 4;
        let t = map(u, 0, TWO_PI, 0, 4*(k+2)*PI);
        let x = cos(t)*( 2 - cos(2*t/(2*k + 1)) );
        let y = sin(t)*( 2 - cos(2*u/(2*k + 1)) );
        let z = -sin(2*t/(2*k + 1));
        return createVector(x,y,z).mult(1.1);
// where 0 < u < (4 k + 2) pi
    }


    function grannyKnot(u){
        let x = -22*cos(u) - 128*sin(u) - 44*cos(3*u) - 78*sin(3*u)
        let y = -10*cos(2*u) - 27*sin(2*u) + 38*cos(4*u) + 46*sin(4*u);
        let z = 70*cos(3*u) - 40*sin(3*u);
        return createVector(x,y,z).mult(0.02);
    }
    
    function fourThreeTorusKnot(t){
        let x =  cos(3*t) * (3 + cos(4*t));
        let y = sin(3*t) * (3 + cos(4*t));
        let z = sin(4*t);
        return createVector(x,y,z).mult(1.05);
    }

    function fiveTwoTorusKnot(t){
        let x =  cos(2*t) * (3 + cos(5*t));
        let y = sin(2*t) * (3 + cos(5*t));
        let z = sin(5*t);
        return createVector(x,y,z);
    }

    function lissajousKnot(t, nx, ny, nz, phaseX= 0, phaseY= 0, phaseZ = 0){
        let x = cos(nx*t + phaseX);
        let y = cos(ny*t + phaseY);
        let z = cos(nz*t + phaseZ);
        return createVector(x,y,z);
    }

    function threeTwistKnot(t){
        return lissajousKnot(t, 3,2,7,0.7,0.2,0).mult(2.5);
    }

    function stevedoreknot(t){
        return lissajousKnot(t, 3, 2, 5, 1.5, 0.2, 0).mult(2.5);
    }

    function squareKnot(t){
        return lissajousKnot(t, 3, 5, 7, 0.7, 1.0).mult(2.5);
    }

    function eightTWoOneKnot(t){
        return lissajousKnot(t, 3,4,7,0.1,0.7,0).mult(2.5);
    }

