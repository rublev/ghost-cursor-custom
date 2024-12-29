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

// Custom easing function for human-like movement
const ease = (t: number): number => {
  // Quick acceleration followed by slow deceleration
  // Accelerate quickly in first 30% of movement
  if (t < 0.3) {
    return t * t * 3.33 // Quadratic acceleration
  }
  // Slow deceleration for remaining 70%
  const decel = (t - 0.3) / 0.7
  return 0.3 + (1 - 0.3) * (1 - Math.pow(1 - decel, 3))
}

// Generate a smooth path between two points
export function * path (
  start: Vector,
  end: Vector,
  speed: number = 1
): Generator<Vector> {
  // Number of steps - more steps = smoother movement
  const steps = Math.max(50, Math.floor(100 / speed))

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    yield interpolate(start, end, ease(t))
  }
}
