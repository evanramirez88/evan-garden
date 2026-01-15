/**
 * Poisson Disk Sampling
 * Creates organically distributed points that maintain minimum distance from each other.
 * Used for placing nodes in the generative background.
 */

interface Point {
  x: number;
  y: number;
}

/**
 * Generate points using Poisson disk sampling algorithm
 * @param width - Width of the sampling area
 * @param height - Height of the sampling area
 * @param minDistance - Minimum distance between points
 * @param maxAttempts - Maximum attempts to place a point (default: 30)
 * @returns Array of points
 */
export function poissonDiskSample(
  width: number,
  height: number,
  minDistance: number,
  maxAttempts: number = 30
): Point[] {
  const cellSize = minDistance / Math.SQRT2;
  const gridWidth = Math.ceil(width / cellSize);
  const gridHeight = Math.ceil(height / cellSize);

  // Grid to track which cells have points
  const grid: (Point | null)[][] = Array(gridWidth)
    .fill(null)
    .map(() => Array(gridHeight).fill(null));

  const points: Point[] = [];
  const activeList: Point[] = [];

  // Helper to get grid coordinates
  const toGrid = (p: Point): [number, number] => [
    Math.floor(p.x / cellSize),
    Math.floor(p.y / cellSize),
  ];

  // Helper to check if point is valid (far enough from neighbors)
  const isValid = (p: Point): boolean => {
    if (p.x < 0 || p.x >= width || p.y < 0 || p.y >= height) {
      return false;
    }

    const [gx, gy] = toGrid(p);

    // Check neighboring cells in a 5x5 grid
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const nx = gx + dx;
        const ny = gy + dy;

        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const neighbor = grid[nx][ny];
          if (neighbor) {
            const dist = Math.hypot(p.x - neighbor.x, p.y - neighbor.y);
            if (dist < minDistance) {
              return false;
            }
          }
        }
      }
    }

    return true;
  };

  // Add a point to the sample
  const addPoint = (p: Point): void => {
    points.push(p);
    activeList.push(p);
    const [gx, gy] = toGrid(p);
    grid[gx][gy] = p;
  };

  // Generate random point in annulus around given point
  const generateAround = (p: Point): Point => {
    const angle = Math.random() * Math.PI * 2;
    const radius = minDistance * (1 + Math.random());
    return {
      x: p.x + Math.cos(angle) * radius,
      y: p.y + Math.sin(angle) * radius,
    };
  };

  // Start with a random point
  const firstPoint: Point = {
    x: Math.random() * width,
    y: Math.random() * height,
  };
  addPoint(firstPoint);

  // Process active list
  while (activeList.length > 0) {
    const randomIndex = Math.floor(Math.random() * activeList.length);
    const point = activeList[randomIndex];

    let found = false;
    for (let i = 0; i < maxAttempts; i++) {
      const candidate = generateAround(point);
      if (isValid(candidate)) {
        addPoint(candidate);
        found = true;
        break;
      }
    }

    if (!found) {
      activeList.splice(randomIndex, 1);
    }
  }

  return points;
}
