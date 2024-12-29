export interface Vector {
  x: number
  y: number
}

export const origin: Vector = { x: 0, y: 0 }

// Simple linear interpolation between two points
export const interpolate = (start: Vector, end: Vector, t: number): Vector => ({
  x: start.x + (end.x - start.x) * t,
  y: start.y + (end.y - start.y) * t
})

// Generate a smooth path between two points
export function * path (
  start: Vector,
  end: Vector,
  speed: number = 1
): Generator<Vector> {
  // Number of steps - more steps = smoother movement
  const steps = Math.max(50, Math.floor(100 / speed))

  for (let i = 0; i <= steps; i++) {
    // Smooth easing using sine
    const t = Math.sin(((i / steps) * Math.PI) / 2)
    yield interpolate(start, end, t)
  }
}
