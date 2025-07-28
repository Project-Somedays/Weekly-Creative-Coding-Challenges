class Cubicle{
    constructor(x,y,z, rotation){
        this.group = new THREE.Group();
        this.group.position.set(x,y,z);
        this.group.rotation.y = rotation;
        // walls
        for(let i = 0; i < 4; i++){
            let w = i <= 2 ? 1 : 0.5;
            const wallGeometry = new THREE.BoxGeometry(w, 1, 0.05);
            const wallMaterial = new THREE.MeshStandardMaterial(0xffffff);
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.castShadow = true; // Enable shadow casting
            wall.receiveShadow = true; // Enable shadow receiving
            wall.rotation.y = (i +1) * HALF_PI;
            switch(i){
                case 0:
                    wall.position.x = -w*0.475;
                    wall.position.z = 0;
                    break;
                case 1:
                    wall.position.x = 0;
                    wall.position.z = -w*0.475;
                    break;
                case 2:
                    wall.position.x = w*0.475;
                    wall.position.z = 0;
                    break;
                case 3:
                    wall.position.x = w*0.475;
                    wall.position.z = w;
                    break;
            }
            this.group.add(wall);
        }

        const desk = new THREE.Mesh(
                new THREE.BoxGeometry(0.25, 0.05, 0.95),
                new THREE.MeshStandardMaterial(0x964B00)
            )
            desk.position.x = 0.3;
            desk.castShadow = true; // Enable shadow casting
            desk.receiveShadow = true; // Enable shadow receiving
            this.group.add(desk)
    }
}

class CubicleBlock{
    constructor(x,y,z){
        this.group = new THREE.Group();
        this.group.position.set(x,y,z);
        for(let i = 0; i < 4; i++){
            let a = -(i + 0.5)* HALF_PI;
            const cubicle = new Cubicle(0.75*cos(a), 0, 0.75*sin(a), i < 2 ? PI : 0);
            this.group.add(cubicle.group);
        }
        // const ceilingGeometry = new THREE.PlaneGeometry(4, 4);
        // const ceilingMaterial = new THREE.MeshStandardMaterial({
        //     color: 0xffffff,
        //     emissive: 0x444444, // Makes it glow
        //     emissiveIntensity: 5
        // });
        // const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        // ceiling.position.y = 2.5;
        // ceiling.rotation.x = -Math.PI / 2;
        // this.group.add(ceiling);
    }

    update(){
        this.group.position.z += params.speed;
    }
}
