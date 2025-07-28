class Whirlpool {
  constructor() {
    this.terrain = [];
    this.initTerrain();
  }

  raiseHeight(gridX, gridY, amt) {
    this.terrain[gridX][gridY] += amt;
  }

  initTerrain() {
    for (let x = 0; x < width / params.waterRes; x++) {
      let row = [];
      for (let z = 0; z < width / params.waterRes; z++) {
        // Vertex for the current row
        let xPos = -width / 2 + x * params.waterRes;
        let zPos = -width / 2 + z * params.waterRes;

        let depth = cubicOrSteeperEasing(xPos, zPos, 0, 0) * params.whirlpoolDepth;
        row[z] = createVector(xPos, depth, zPos);
      }
      this.terrain[x] = row;
    }
  }

  update() {
    for (let x = 0; x < width / params.waterRes; x++) {
      let xPos = -width / 2 + x * params.waterRes;
      if (params.extraWaterRandomisation) xPos += map2DNoise(xPos, params.noiseProgRate, -width / 50, width / 50);
      for (let z = 0; z < width / params.waterRes; z++) {
        let zPos = -width / 2 + z * params.waterRes;
        if (params.extraWaterRandomisation) zPos += map2DNoise(zPos, params.noiseProgRate, -width / 50, width / 50);
        let noiseHeight = map3DNoise(xPos, zPos, params.noiseProgRate, -params.waveSize, params.waveSize);
        let depth = cubicOrSteeperEasing(xPos, zPos, 0, 0) * params.whirlpoolDepth;
        this.terrain[x][z].set(xPos, depth + noiseHeight, zPos);
      }
    }
  }

  show() {
    for (let x = 0; x < width / params.waterRes - 1; x++) {
      beginShape(TRIANGLE_STRIP);
      for (let z = 0; z < width / params.waterRes; z++) {
        // Vertex for the current row

        vertex(this.terrain[x][z].x, this.terrain[x][z].y, this.terrain[x][z].z);

        // Vertex for the next row (same column)
        vertex(this.terrain[x + 1][z].x, this.terrain[x + 1][z].y, this.terrain[x + 1][z].z);
      }
      endShape();
    }
  }
}
