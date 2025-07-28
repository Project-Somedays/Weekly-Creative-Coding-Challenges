let params, gui;

// Marching Cubes Terrain with 3D Perlin Noise + Time Offset
// Grid parameters
const gridSize = 16; // Reduced for better performance and debugging
const cellSize = 6; // Increased for visibility

// Animation
let time = 0;

// Pair of vertex indices for each edge on the cube
const edgeVertexIndices = [
	[0, 1],
	[1, 3],
	[3, 2],
	[2, 0],
	[4, 5],
	[5, 7],
	[7, 6],
	[6, 4],
	[0, 4],
	[1, 5],
	[3, 7],
	[2, 6],
];
// Marching cubes lookup table (edge table)
let edgeTable = [
  0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
  0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
  0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
  0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
  0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
  0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
  0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
  0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
  0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
  0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
  0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
  0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
  0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
  0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
  0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
  0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
  0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
  0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
  0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
  0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
  0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
  0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
  0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
  0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
  0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
  0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
  0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
  0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
  0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
  0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
  0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
  0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
];

// Simplified triangle table for basic cases --> https://gist.github.com/dwilliamson/c041e3454a713e58baf6e4f8e5fffecd
// let triTable = [
//   [],
//   [0, 8, 3],
//   [0, 1, 9],
//   [1, 8, 3, 9, 8, 1],
//   [1, 2, 10],
//   [0, 8, 3, 1, 2, 10],
//   [9, 2, 10, 0, 2, 9],
//   [2, 8, 3, 2, 10, 8, 10, 9, 8],
//   [3, 11, 2],
//   [0, 11, 2, 8, 11, 0],
//   [1, 9, 0, 2, 3, 11],
//   [1, 11, 2, 1, 9, 11, 9, 8, 11],
//   [3, 10, 1, 11, 10, 3],
//   [0, 10, 1, 0, 8, 10, 8, 11, 10],
//   [3, 9, 0, 3, 11, 9, 11, 10, 9],
//   [9, 8, 10, 10, 8, 11]
//   // Add more cases as needed - this is a minimal set
// ];
const triTable = [
  [ -1 ],
	[ 0, 3, 8, -1 ],
	[ 0, 9, 1, -1 ],
	[ 3, 8, 1, 1, 8, 9, -1 ],
	[ 2, 11, 3, -1 ],
	[ 8, 0, 11, 11, 0, 2, -1 ],
	[ 3, 2, 11, 1, 0, 9, -1 ],
	[ 11, 1, 2, 11, 9, 1, 11, 8, 9, -1 ],
	[ 1, 10, 2, -1 ],
	[ 0, 3, 8, 2, 1, 10, -1 ],
	[ 10, 2, 9, 9, 2, 0, -1 ],
	[ 8, 2, 3, 8, 10, 2, 8, 9, 10, -1 ],
	[ 11, 3, 10, 10, 3, 1, -1 ],
	[ 10, 0, 1, 10, 8, 0, 10, 11, 8, -1 ],
	[ 9, 3, 0, 9, 11, 3, 9, 10, 11, -1 ],
	[ 8, 9, 11, 11, 9, 10, -1 ],
	[ 4, 8, 7, -1 ],
	[ 7, 4, 3, 3, 4, 0, -1 ],
	[ 4, 8, 7, 0, 9, 1, -1 ],
	[ 1, 4, 9, 1, 7, 4, 1, 3, 7, -1 ],
	[ 8, 7, 4, 11, 3, 2, -1 ],
	[ 4, 11, 7, 4, 2, 11, 4, 0, 2, -1 ],
	[ 0, 9, 1, 8, 7, 4, 11, 3, 2, -1 ],
	[ 7, 4, 11, 11, 4, 2, 2, 4, 9, 2, 9, 1, -1 ],
	[ 4, 8, 7, 2, 1, 10, -1 ],
	[ 7, 4, 3, 3, 4, 0, 10, 2, 1, -1 ],
	[ 10, 2, 9, 9, 2, 0, 7, 4, 8, -1 ],
	[ 10, 2, 3, 10, 3, 4, 3, 7, 4, 9, 10, 4, -1 ],
	[ 1, 10, 3, 3, 10, 11, 4, 8, 7, -1 ],
	[ 10, 11, 1, 11, 7, 4, 1, 11, 4, 1, 4, 0, -1 ],
	[ 7, 4, 8, 9, 3, 0, 9, 11, 3, 9, 10, 11, -1 ],
	[ 7, 4, 11, 4, 9, 11, 9, 10, 11, -1 ],
	[ 9, 4, 5, -1 ],
	[ 9, 4, 5, 8, 0, 3, -1 ],
	[ 4, 5, 0, 0, 5, 1, -1 ],
	[ 5, 8, 4, 5, 3, 8, 5, 1, 3, -1 ],
	[ 9, 4, 5, 11, 3, 2, -1 ],
	[ 2, 11, 0, 0, 11, 8, 5, 9, 4, -1 ],
	[ 4, 5, 0, 0, 5, 1, 11, 3, 2, -1 ],
	[ 5, 1, 4, 1, 2, 11, 4, 1, 11, 4, 11, 8, -1 ],
	[ 1, 10, 2, 5, 9, 4, -1 ],
	[ 9, 4, 5, 0, 3, 8, 2, 1, 10, -1 ],
	[ 2, 5, 10, 2, 4, 5, 2, 0, 4, -1 ],
	[ 10, 2, 5, 5, 2, 4, 4, 2, 3, 4, 3, 8, -1 ],
	[ 11, 3, 10, 10, 3, 1, 4, 5, 9, -1 ],
	[ 4, 5, 9, 10, 0, 1, 10, 8, 0, 10, 11, 8, -1 ],
	[ 11, 3, 0, 11, 0, 5, 0, 4, 5, 10, 11, 5, -1 ],
	[ 4, 5, 8, 5, 10, 8, 10, 11, 8, -1 ],
	[ 8, 7, 9, 9, 7, 5, -1 ],
	[ 3, 9, 0, 3, 5, 9, 3, 7, 5, -1 ],
	[ 7, 0, 8, 7, 1, 0, 7, 5, 1, -1 ],
	[ 7, 5, 3, 3, 5, 1, -1 ],
	[ 5, 9, 7, 7, 9, 8, 2, 11, 3, -1 ],
	[ 2, 11, 7, 2, 7, 9, 7, 5, 9, 0, 2, 9, -1 ],
	[ 2, 11, 3, 7, 0, 8, 7, 1, 0, 7, 5, 1, -1 ],
	[ 2, 11, 1, 11, 7, 1, 7, 5, 1, -1 ],
	[ 8, 7, 9, 9, 7, 5, 2, 1, 10, -1 ],
	[ 10, 2, 1, 3, 9, 0, 3, 5, 9, 3, 7, 5, -1 ],
	[ 7, 5, 8, 5, 10, 2, 8, 5, 2, 8, 2, 0, -1 ],
	[ 10, 2, 5, 2, 3, 5, 3, 7, 5, -1 ],
	[ 8, 7, 5, 8, 5, 9, 11, 3, 10, 3, 1, 10, -1 ],
	[ 5, 11, 7, 10, 11, 5, 1, 9, 0, -1 ],
	[ 11, 5, 10, 7, 5, 11, 8, 3, 0, -1 ],
	[ 5, 11, 7, 10, 11, 5, -1 ],
	[ 6, 7, 11, -1 ],
	[ 7, 11, 6, 3, 8, 0, -1 ],
	[ 6, 7, 11, 0, 9, 1, -1 ],
	[ 9, 1, 8, 8, 1, 3, 6, 7, 11, -1 ],
	[ 3, 2, 7, 7, 2, 6, -1 ],
	[ 0, 7, 8, 0, 6, 7, 0, 2, 6, -1 ],
	[ 6, 7, 2, 2, 7, 3, 9, 1, 0, -1 ],
	[ 6, 7, 8, 6, 8, 1, 8, 9, 1, 2, 6, 1, -1 ],
	[ 11, 6, 7, 10, 2, 1, -1 ],
	[ 3, 8, 0, 11, 6, 7, 10, 2, 1, -1 ],
	[ 0, 9, 2, 2, 9, 10, 7, 11, 6, -1 ],
	[ 6, 7, 11, 8, 2, 3, 8, 10, 2, 8, 9, 10, -1 ],
	[ 7, 10, 6, 7, 1, 10, 7, 3, 1, -1 ],
	[ 8, 0, 7, 7, 0, 6, 6, 0, 1, 6, 1, 10, -1 ],
	[ 7, 3, 6, 3, 0, 9, 6, 3, 9, 6, 9, 10, -1 ],
	[ 6, 7, 10, 7, 8, 10, 8, 9, 10, -1 ],
	[ 11, 6, 8, 8, 6, 4, -1 ],
	[ 6, 3, 11, 6, 0, 3, 6, 4, 0, -1 ],
	[ 11, 6, 8, 8, 6, 4, 1, 0, 9, -1 ],
	[ 1, 3, 9, 3, 11, 6, 9, 3, 6, 9, 6, 4, -1 ],
	[ 2, 8, 3, 2, 4, 8, 2, 6, 4, -1 ],
	[ 4, 0, 6, 6, 0, 2, -1 ],
	[ 9, 1, 0, 2, 8, 3, 2, 4, 8, 2, 6, 4, -1 ],
	[ 9, 1, 4, 1, 2, 4, 2, 6, 4, -1 ],
	[ 4, 8, 6, 6, 8, 11, 1, 10, 2, -1 ],
	[ 1, 10, 2, 6, 3, 11, 6, 0, 3, 6, 4, 0, -1 ],
	[ 11, 6, 4, 11, 4, 8, 10, 2, 9, 2, 0, 9, -1 ],
	[ 10, 4, 9, 6, 4, 10, 11, 2, 3, -1 ],
	[ 4, 8, 3, 4, 3, 10, 3, 1, 10, 6, 4, 10, -1 ],
	[ 1, 10, 0, 10, 6, 0, 6, 4, 0, -1 ],
	[ 4, 10, 6, 9, 10, 4, 0, 8, 3, -1 ],
	[ 4, 10, 6, 9, 10, 4, -1 ],
	[ 6, 7, 11, 4, 5, 9, -1 ],
	[ 4, 5, 9, 7, 11, 6, 3, 8, 0, -1 ],
	[ 1, 0, 5, 5, 0, 4, 11, 6, 7, -1 ],
	[ 11, 6, 7, 5, 8, 4, 5, 3, 8, 5, 1, 3, -1 ],
	[ 3, 2, 7, 7, 2, 6, 9, 4, 5, -1 ],
	[ 5, 9, 4, 0, 7, 8, 0, 6, 7, 0, 2, 6, -1 ],
	[ 3, 2, 6, 3, 6, 7, 1, 0, 5, 0, 4, 5, -1 ],
	[ 6, 1, 2, 5, 1, 6, 4, 7, 8, -1 ],
	[ 10, 2, 1, 6, 7, 11, 4, 5, 9, -1 ],
	[ 0, 3, 8, 4, 5, 9, 11, 6, 7, 10, 2, 1, -1 ],
	[ 7, 11, 6, 2, 5, 10, 2, 4, 5, 2, 0, 4, -1 ],
	[ 8, 4, 7, 5, 10, 6, 3, 11, 2, -1 ],
	[ 9, 4, 5, 7, 10, 6, 7, 1, 10, 7, 3, 1, -1 ],
	[ 10, 6, 5, 7, 8, 4, 1, 9, 0, -1 ],
	[ 4, 3, 0, 7, 3, 4, 6, 5, 10, -1 ],
	[ 10, 6, 5, 8, 4, 7, -1 ],
	[ 9, 6, 5, 9, 11, 6, 9, 8, 11, -1 ],
	[ 11, 6, 3, 3, 6, 0, 0, 6, 5, 0, 5, 9, -1 ],
	[ 11, 6, 5, 11, 5, 0, 5, 1, 0, 8, 11, 0, -1 ],
	[ 11, 6, 3, 6, 5, 3, 5, 1, 3, -1 ],
	[ 9, 8, 5, 8, 3, 2, 5, 8, 2, 5, 2, 6, -1 ],
	[ 5, 9, 6, 9, 0, 6, 0, 2, 6, -1 ],
	[ 1, 6, 5, 2, 6, 1, 3, 0, 8, -1 ],
	[ 1, 6, 5, 2, 6, 1, -1 ],
	[ 2, 1, 10, 9, 6, 5, 9, 11, 6, 9, 8, 11, -1 ],
	[ 9, 0, 1, 3, 11, 2, 5, 10, 6, -1 ],
	[ 11, 0, 8, 2, 0, 11, 10, 6, 5, -1 ],
	[ 3, 11, 2, 5, 10, 6, -1 ],
	[ 1, 8, 3, 9, 8, 1, 5, 10, 6, -1 ],
	[ 6, 5, 10, 0, 1, 9, -1 ],
	[ 8, 3, 0, 5, 10, 6, -1 ],
	[ 6, 5, 10, -1 ],
	[ 10, 5, 6, -1 ],
	[ 0, 3, 8, 6, 10, 5, -1 ],
	[ 10, 5, 6, 9, 1, 0, -1 ],
	[ 3, 8, 1, 1, 8, 9, 6, 10, 5, -1 ],
	[ 2, 11, 3, 6, 10, 5, -1 ],
	[ 8, 0, 11, 11, 0, 2, 5, 6, 10, -1 ],
	[ 1, 0, 9, 2, 11, 3, 6, 10, 5, -1 ],
	[ 5, 6, 10, 11, 1, 2, 11, 9, 1, 11, 8, 9, -1 ],
	[ 5, 6, 1, 1, 6, 2, -1 ],
	[ 5, 6, 1, 1, 6, 2, 8, 0, 3, -1 ],
	[ 6, 9, 5, 6, 0, 9, 6, 2, 0, -1 ],
	[ 6, 2, 5, 2, 3, 8, 5, 2, 8, 5, 8, 9, -1 ],
	[ 3, 6, 11, 3, 5, 6, 3, 1, 5, -1 ],
	[ 8, 0, 1, 8, 1, 6, 1, 5, 6, 11, 8, 6, -1 ],
	[ 11, 3, 6, 6, 3, 5, 5, 3, 0, 5, 0, 9, -1 ],
	[ 5, 6, 9, 6, 11, 9, 11, 8, 9, -1 ],
	[ 5, 6, 10, 7, 4, 8, -1 ],
	[ 0, 3, 4, 4, 3, 7, 10, 5, 6, -1 ],
	[ 5, 6, 10, 4, 8, 7, 0, 9, 1, -1 ],
	[ 6, 10, 5, 1, 4, 9, 1, 7, 4, 1, 3, 7, -1 ],
	[ 7, 4, 8, 6, 10, 5, 2, 11, 3, -1 ],
	[ 10, 5, 6, 4, 11, 7, 4, 2, 11, 4, 0, 2, -1 ],
	[ 4, 8, 7, 6, 10, 5, 3, 2, 11, 1, 0, 9, -1 ],
	[ 1, 2, 10, 11, 7, 6, 9, 5, 4, -1 ],
	[ 2, 1, 6, 6, 1, 5, 8, 7, 4, -1 ],
	[ 0, 3, 7, 0, 7, 4, 2, 1, 6, 1, 5, 6, -1 ],
	[ 8, 7, 4, 6, 9, 5, 6, 0, 9, 6, 2, 0, -1 ],
	[ 7, 2, 3, 6, 2, 7, 5, 4, 9, -1 ],
	[ 4, 8, 7, 3, 6, 11, 3, 5, 6, 3, 1, 5, -1 ],
	[ 5, 0, 1, 4, 0, 5, 7, 6, 11, -1 ],
	[ 9, 5, 4, 6, 11, 7, 0, 8, 3, -1 ],
	[ 11, 7, 6, 9, 5, 4, -1 ],
	[ 6, 10, 4, 4, 10, 9, -1 ],
	[ 6, 10, 4, 4, 10, 9, 3, 8, 0, -1 ],
	[ 0, 10, 1, 0, 6, 10, 0, 4, 6, -1 ],
	[ 6, 10, 1, 6, 1, 8, 1, 3, 8, 4, 6, 8, -1 ],
	[ 9, 4, 10, 10, 4, 6, 3, 2, 11, -1 ],
	[ 2, 11, 8, 2, 8, 0, 6, 10, 4, 10, 9, 4, -1 ],
	[ 11, 3, 2, 0, 10, 1, 0, 6, 10, 0, 4, 6, -1 ],
	[ 6, 8, 4, 11, 8, 6, 2, 10, 1, -1 ],
	[ 4, 1, 9, 4, 2, 1, 4, 6, 2, -1 ],
	[ 3, 8, 0, 4, 1, 9, 4, 2, 1, 4, 6, 2, -1 ],
	[ 6, 2, 4, 4, 2, 0, -1 ],
	[ 3, 8, 2, 8, 4, 2, 4, 6, 2, -1 ],
	[ 4, 6, 9, 6, 11, 3, 9, 6, 3, 9, 3, 1, -1 ],
	[ 8, 6, 11, 4, 6, 8, 9, 0, 1, -1 ],
	[ 11, 3, 6, 3, 0, 6, 0, 4, 6, -1 ],
	[ 8, 6, 11, 4, 6, 8, -1 ],
	[ 10, 7, 6, 10, 8, 7, 10, 9, 8, -1 ],
	[ 3, 7, 0, 7, 6, 10, 0, 7, 10, 0, 10, 9, -1 ],
	[ 6, 10, 7, 7, 10, 8, 8, 10, 1, 8, 1, 0, -1 ],
	[ 6, 10, 7, 10, 1, 7, 1, 3, 7, -1 ],
	[ 3, 2, 11, 10, 7, 6, 10, 8, 7, 10, 9, 8, -1 ],
	[ 2, 9, 0, 10, 9, 2, 6, 11, 7, -1 ],
	[ 0, 8, 3, 7, 6, 11, 1, 2, 10, -1 ],
	[ 7, 6, 11, 1, 2, 10, -1 ],
	[ 2, 1, 9, 2, 9, 7, 9, 8, 7, 6, 2, 7, -1 ],
	[ 2, 7, 6, 3, 7, 2, 0, 1, 9, -1 ],
	[ 8, 7, 0, 7, 6, 0, 6, 2, 0, -1 ],
	[ 7, 2, 3, 6, 2, 7, -1 ],
	[ 8, 1, 9, 3, 1, 8, 11, 7, 6, -1 ],
	[ 11, 7, 6, 1, 9, 0, -1 ],
	[ 6, 11, 7, 0, 8, 3, -1 ],
	[ 11, 7, 6, -1 ],
	[ 7, 11, 5, 5, 11, 10, -1 ],
	[ 10, 5, 11, 11, 5, 7, 0, 3, 8, -1 ],
	[ 7, 11, 5, 5, 11, 10, 0, 9, 1, -1 ],
	[ 7, 11, 10, 7, 10, 5, 3, 8, 1, 8, 9, 1, -1 ],
	[ 5, 2, 10, 5, 3, 2, 5, 7, 3, -1 ],
	[ 5, 7, 10, 7, 8, 0, 10, 7, 0, 10, 0, 2, -1 ],
	[ 0, 9, 1, 5, 2, 10, 5, 3, 2, 5, 7, 3, -1 ],
	[ 9, 7, 8, 5, 7, 9, 10, 1, 2, -1 ],
	[ 1, 11, 2, 1, 7, 11, 1, 5, 7, -1 ],
	[ 8, 0, 3, 1, 11, 2, 1, 7, 11, 1, 5, 7, -1 ],
	[ 7, 11, 2, 7, 2, 9, 2, 0, 9, 5, 7, 9, -1 ],
	[ 7, 9, 5, 8, 9, 7, 3, 11, 2, -1 ],
	[ 3, 1, 7, 7, 1, 5, -1 ],
	[ 8, 0, 7, 0, 1, 7, 1, 5, 7, -1 ],
	[ 0, 9, 3, 9, 5, 3, 5, 7, 3, -1 ],
	[ 9, 7, 8, 5, 7, 9, -1 ],
	[ 8, 5, 4, 8, 10, 5, 8, 11, 10, -1 ],
	[ 0, 3, 11, 0, 11, 5, 11, 10, 5, 4, 0, 5, -1 ],
	[ 1, 0, 9, 8, 5, 4, 8, 10, 5, 8, 11, 10, -1 ],
	[ 10, 3, 11, 1, 3, 10, 9, 5, 4, -1 ],
	[ 3, 2, 8, 8, 2, 4, 4, 2, 10, 4, 10, 5, -1 ],
	[ 10, 5, 2, 5, 4, 2, 4, 0, 2, -1 ],
	[ 5, 4, 9, 8, 3, 0, 10, 1, 2, -1 ],
	[ 2, 10, 1, 4, 9, 5, -1 ],
	[ 8, 11, 4, 11, 2, 1, 4, 11, 1, 4, 1, 5, -1 ],
	[ 0, 5, 4, 1, 5, 0, 2, 3, 11, -1 ],
	[ 0, 11, 2, 8, 11, 0, 4, 9, 5, -1 ],
	[ 5, 4, 9, 2, 3, 11, -1 ],
	[ 4, 8, 5, 8, 3, 5, 3, 1, 5, -1 ],
	[ 0, 5, 4, 1, 5, 0, -1 ],
	[ 5, 4, 9, 3, 0, 8, -1 ],
	[ 5, 4, 9, -1 ],
	[ 11, 4, 7, 11, 9, 4, 11, 10, 9, -1 ],
	[ 0, 3, 8, 11, 4, 7, 11, 9, 4, 11, 10, 9, -1 ],
	[ 11, 10, 7, 10, 1, 0, 7, 10, 0, 7, 0, 4, -1 ],
	[ 3, 10, 1, 11, 10, 3, 7, 8, 4, -1 ],
	[ 3, 2, 10, 3, 10, 4, 10, 9, 4, 7, 3, 4, -1 ],
	[ 9, 2, 10, 0, 2, 9, 8, 4, 7, -1 ],
	[ 3, 4, 7, 0, 4, 3, 1, 2, 10, -1 ],
	[ 7, 8, 4, 10, 1, 2, -1 ],
	[ 7, 11, 4, 4, 11, 9, 9, 11, 2, 9, 2, 1, -1 ],
	[ 1, 9, 0, 4, 7, 8, 2, 3, 11, -1 ],
	[ 7, 11, 4, 11, 2, 4, 2, 0, 4, -1 ],
	[ 4, 7, 8, 2, 3, 11, -1 ],
	[ 9, 4, 1, 4, 7, 1, 7, 3, 1, -1 ],
	[ 7, 8, 4, 1, 9, 0, -1 ],
	[ 3, 4, 7, 0, 4, 3, -1 ],
	[ 7, 8, 4, -1 ],
	[ 11, 10, 8, 8, 10, 9, -1 ],
	[ 0, 3, 9, 3, 11, 9, 11, 10, 9, -1 ],
	[ 1, 0, 10, 0, 8, 10, 8, 11, 10, -1 ],
	[ 10, 3, 11, 1, 3, 10, -1 ],
	[ 3, 2, 8, 2, 10, 8, 10, 9, 8, -1 ],
	[ 9, 2, 10, 0, 2, 9, -1 ],
	[ 8, 3, 0, 10, 1, 2, -1 ],
	[ 2, 10, 1, -1 ],
	[ 2, 1, 11, 1, 9, 11, 9, 8, 11, -1 ],
	[ 11, 2, 3, 9, 0, 1, -1 ],
	[ 11, 0, 8, 2, 0, 11, -1 ],
	[ 3, 11, 2, -1 ],
	[ 1, 8, 3, 9, 8, 1, -1 ],
	[ 1, 9, 0, -1 ],
	[ 8, 3, 0, -1 ],
	[ -1 ]
]

// 3D scalar field
let scalarField = [];

// Vertices for rendering
let vertices = [];

function setup() {
  createCanvas(800, 600, WEBGL);

  gui = new lil.GUI();
  params = {
    threshold: 0.5,
    noiseScale: 0.02,
    timeScale: 0.0003,
    amplitude: 1.5,
    terraceHeight: 0.3,
    terraceSmoothing: 0.1
  }

  gui.add(params, 'threshold', 0, 1, 0.01);
  gui.add(params, 'noiseScale', 0, 0.1, 0.001);
  gui.add(params, 'timeScale', 0, 0.001, 0.00001);
  gui.add(params, 'amplitude', 0, 3, 0.1);
  gui.add(params, 'terraceHeight', 0, 1, 0.01);
  gui.add(params, 'terraceSmoothing', 0, 1, 0.01);

  // Initialize scalar field
  initScalarField();
}

function draw() {
  background(20, 30, 50);
  
  setupThreePointLighting();
  
  // Camera controls
  orbitControl();
  
  // Update time for animation
  time += params.timeScale;
  
  // Update scalar field with 4D noise
  updateScalarField();
  
  // Generate mesh using marching cubes
  generateMesh();
  
  // Render the terrain
  renderTerrain();
  
  // Fallback: draw a simple test cube if no vertices
  if (vertices.length === 0) {
    push();
    fill(255, 0, 0);
    noStroke();
    box(50);
    pop();
  }
}

function setupThreePointLighting() {
  // 1. KEY LIGHT (main light) - brightest, from upper front-left
  directionalLight(
    255, 255, 240,        // Warm white color
    -0.5, -0.8, -0.3      // Direction: upper front-left
  );
  
  // 2. FILL LIGHT - softer, from opposite side to fill shadows
  directionalLight(
    120, 140, 160,        // Cooler, dimmer light
    0.8, -0.2, -0.1       // Direction: upper front-right
  );
  
  // 3. RIM/BACK LIGHT - creates separation from background
  directionalLight(
    180, 200, 255,        // Cool backlight
    0.2, 0.5, 0.8         // Direction: from behind and above
  );
  
  // 4. AMBIENT LIGHT - soft overall illumination to prevent pure black shadows
  ambientLight(
    30, 35, 40            // Very dim ambient
  );
}

function initScalarField() {
  scalarField = [];
  for (let x = 0; x <= gridSize; x++) {
    scalarField[x] = [];
    for (let y = 0; y <= gridSize; y++) {
      scalarField[x][y] = [];
      for (let z = 0; z <= gridSize; z++) {
        scalarField[x][y][z] = 0;
      }
    }
  }
}

function updateScalarField() {
  for (let x = 0; x <= gridSize; x++) {
    for (let y = 0; y <= gridSize; y++) {
      for (let z = 0; z <= gridSize; z++) {
        // 3D Perlin noise with time as y-offset for 4D-like behavior
        let worldX = x * params.noiseScale;
        let worldY = y * params.noiseScale;
        let worldZ = z * params.noiseScale;
        
        // Use time as an offset in the z dimension to create evolution
        let timeOffset = time * 50; // Scale time for better animation speed
        let baseNoise = noise(worldX, worldY + timeOffset, worldZ);
        
        // Apply terracing effect
        let terraced = applyTerracing(baseNoise);
        
        // Height-based falloff (creates ground plane)
        let heightFalloff = map(y, 0, gridSize, 1, -0.5);
        
        scalarField[x][y][z] = terraced * params.amplitude + heightFalloff;
      }
    }
  }
}

function applyTerracing(value) {
  // Create terraced/stepped effect
  let stepped = Math.floor(value / params.terraceHeight) * params.terraceHeight;
  let smooth = lerp(stepped, value, params.terraceSmoothing);
  return smooth;
}

function generateMesh() {
  vertices = [];
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        let cubeIndex = 0;
        
        // Sample the 8 corners of the cube
        let cubeBiz = [
          scalarField[x][y][z],
          scalarField[x + 1][y][z],
          scalarField[x + 1][y + 1][z],
          scalarField[x][y + 1][z],
          scalarField[x][y][z + 1],
          scalarField[x + 1][y][z + 1],
          scalarField[x + 1][y + 1][z + 1],
          scalarField[x][y + 1][z + 1]
        ];
        
        // Determine which vertices are below the threshold
        for (let i = 0; i < 8; i++) {
          if (cubeBiz[i] < params.threshold) {
            cubeIndex |= (1 << i);
          }
        }
        
        // Skip empty cubes
        if (edgeTable[cubeIndex] === 0) continue;
        
        // Find intersection points on edges
        let vertList = new Array(12);
        
        if (edgeTable[cubeIndex] & 1) {
          vertList[0] = interpolateVertex(
            createVector(x, y, z),
            createVector(x + 1, y, z),
            cubeBiz[0], cubeBiz[1]
          );
        }
        if (edgeTable[cubeIndex] & 2) {
          vertList[1] = interpolateVertex(
            createVector(x + 1, y, z),
            createVector(x + 1, y + 1, z),
            cubeBiz[1], cubeBiz[2]
          );
        }
        if (edgeTable[cubeIndex] & 4) {
          vertList[2] = interpolateVertex(
            createVector(x + 1, y + 1, z),
            createVector(x, y + 1, z),
            cubeBiz[2], cubeBiz[3]
          );
        }
        if (edgeTable[cubeIndex] & 8) {
          vertList[3] = interpolateVertex(
            createVector(x, y + 1, z),
            createVector(x, y, z),
            cubeBiz[3], cubeBiz[0]
          );
        }
        if (edgeTable[cubeIndex] & 16) {
          vertList[4] = interpolateVertex(
            createVector(x, y, z + 1),
            createVector(x + 1, y, z + 1),
            cubeBiz[4], cubeBiz[5]
          );
        }
        if (edgeTable[cubeIndex] & 32) {
          vertList[5] = interpolateVertex(
            createVector(x + 1, y, z + 1),
            createVector(x + 1, y + 1, z + 1),
            cubeBiz[5], cubeBiz[6]
          );
        }
        if (edgeTable[cubeIndex] & 64) {
          vertList[6] = interpolateVertex(
            createVector(x + 1, y + 1, z + 1),
            createVector(x, y + 1, z + 1),
            cubeBiz[6], cubeBiz[7]
          );
        }
        if (edgeTable[cubeIndex] & 128) {
          vertList[7] = interpolateVertex(
            createVector(x, y + 1, z + 1),
            createVector(x, y, z + 1),
            cubeBiz[7], cubeBiz[4]
          );
        }
        if (edgeTable[cubeIndex] & 256) {
          vertList[8] = interpolateVertex(
            createVector(x, y, z),
            createVector(x, y, z + 1),
            cubeBiz[0], cubeBiz[4]
          );
        }
        if (edgeTable[cubeIndex] & 512) {
          vertList[9] = interpolateVertex(
            createVector(x + 1, y, z),
            createVector(x + 1, y, z + 1),
            cubeBiz[1], cubeBiz[5]
          );
        }
        if (edgeTable[cubeIndex] & 1024) {
          vertList[10] = interpolateVertex(
            createVector(x + 1, y + 1, z),
            createVector(x + 1, y + 1, z + 1),
            cubeBiz[2], cubeBiz[6]
          );
        }
        if (edgeTable[cubeIndex] & 2048) {
          vertList[11] = interpolateVertex(
            createVector(x, y + 1, z),
            createVector(x, y + 1, z + 1),
            cubeBiz[3], cubeBiz[7]
          );
        }
        
        // Create triangles using proper triangle table
        addTrianglesForCube(cubeIndex, vertList);
      }
    }
  }
}

function interpolateVertex(p1, p2, val1, val2) {
  if (abs(params.threshold - val1) < 0.00001) return p1.copy();
  if (abs(params.threshold - val2) < 0.00001) return p2.copy();
  if (abs(val1 - val2) < 0.00001) return p1.copy();
  
  let mu = (params.threshold - val1) / (val2 - val1);
  return p5.Vector.lerp(p1, p2, mu);
}

function addTrianglesForCube(cubeIndex, vertList) {
  // Use the triangle table for proper winding
  if (cubeIndex < triTable.length && triTable[cubeIndex].length > 0) {
    let triangles = triTable[cubeIndex];
    
    for (let i = 0; i < triangles.length; i += 3) {
      let v1 = vertList[triangles[i]];
      let v2 = vertList[triangles[i + 1]];
      let v3 = vertList[triangles[i + 2]];
      
      if (v1 && v2 && v3) {
        vertices.push(v1, v2, v3);
      }
    }
  } else {
    // Fallback: create triangles from available vertices with consistent winding
    let validVerts = vertList.filter(v => v !== undefined);
    
    if (validVerts.length >= 3) {
      // Create a fan of triangles with consistent winding
      for (let i = 1; i < validVerts.length - 1; i++) {
        vertices.push(validVerts[0], validVerts[i], validVerts[i + 1]);
      }
    }
  }
}

function renderTerrain() {
  push();
  
  // Center the terrain
  translate(-gridSize * cellSize / 2, 0, -gridSize * cellSize / 2);
  
  // Material properties
  fill(120, 200, 120);
  // noStroke(); // Remove stroke for cleaner look
  
  // Draw triangles
  for (let i = 0; i < vertices.length; i += 3) {
    if (vertices[i] && vertices[i + 1] && vertices[i + 2]) {
      let v1 = vertices[i].copy().mult(cellSize);
      let v2 = vertices[i + 1].copy().mult(cellSize);
      let v3 = vertices[i + 2].copy().mult(cellSize);
      
      // Add some height-based coloring
      let avgHeight = (v1.y + v2.y + v3.y) / 3;
      let colorFactor = map(avgHeight, -gridSize * cellSize * 0.5, gridSize * cellSize * 0.5, 0.3, 1);
      fill(120 * colorFactor, 200 * colorFactor, 120 * colorFactor);
      
      beginShape(TRIANGLES);
      vertex(v1.x, v1.y, v1.z);
      vertex(v2.x, v2.y, v2.z);
      vertex(v3.x, v3.y, v3.z);
      endShape();
    }
  }
  
  pop();
}

// Optional: Add keyboard controls
function keyPressed() {
  if (key === 'r' || key === 'R') {
    time = 0; // Reset animation
  }
}

