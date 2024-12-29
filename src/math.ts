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
  // More steps for slower speed = smoother movement
  const steps = Math.max(50, Math.floor(100 / speed))

  for (let i = 0; i <= steps; i++) {
    // Smooth easing using a combination of sine and cubic for better deceleration
    const t = i / steps
    const ease = Math.sin((t * Math.PI) / 2) * (1 - t * t * 0.3 + t * 0.5)
    yield interpolate(start, end, ease)
  }
}
