import { Bezier } from 'bezier-js'

export interface Vector {
  x: number
  y: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface TimedVector extends Vector {
  timestamp: number
}
export const origin: Vector = { x: 0, y: 0 }

// Basic vector operations
export const sub = (a: Vector, b: Vector): Vector => ({
  x: a.x - b.x,
  y: a.y - b.y
})
export const div = (a: Vector, b: number): Vector => ({
  x: a.x / b,
  y: a.y / b
})
export const mult = (a: Vector, b: number): Vector => ({
  x: a.x * b,
  y: a.y * b
})
export const add = (a: Vector, b: Vector): Vector => ({
  x: a.x + b.x,
  y: a.y + b.y
})

export const direction = (a: Vector, b: Vector): Vector => sub(b, a)
export const magnitude = (a: Vector): number =>
  Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2))

// Added back for compatibility, but now just returns the original coordinate
export const overshoot = (coordinate: Vector, radius: number): Vector =>
  coordinate

// Get the center point of a bounding box
const getBoxCenter = (box: BoundingBox): Vector => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2
})

// Simplified bezier curve that creates a smoother path
export const bezierCurve = (
  start: Vector,
  finish: Vector | BoundingBox,
  spreadOverride?: number
): Bezier => {
  // Always get center point if it's a bounding box
  const end: Vector = 'width' in finish ? getBoxCenter(finish) : finish

  const dir = direction(start, end)
  const dist = magnitude(dir)

  // Adjust control points based on distance for smoother movement
  // const midPoint = add(start, mult(dir, 0.5))

  // For shorter distances, make curve gentler
  const curveIntensity = Math.min(dist / 800, 0.3)

  // Create slight arc for more natural movement
  const perpendicular = { x: -dir.y, y: dir.x }
  const normalizedPerp = mult(
    div(perpendicular, magnitude(perpendicular)),
    dist * curveIntensity
  )

  // Control points form a slight arc
  const cp1 = add(add(start, mult(dir, 0.25)), mult(normalizedPerp, 0.5))
  const cp2 = add(add(start, mult(dir, 0.75)), mult(normalizedPerp, 0.5))

  return new Bezier(start, cp1, cp2, end)
}

// Calculate speed based on distance for smooth acceleration/deceleration
export const bezierCurveSpeed = (
  t: number,
  P0: Vector,
  P1: Vector,
  P2: Vector,
  P3: Vector
): number => {
  // Slower at start and end, faster in middle
  const speedFactor = Math.sin(t * Math.PI) * 0.5 + 0.5

  const B1 =
    3 * (1 - t) ** 2 * (P1.x - P0.x) +
    6 * (1 - t) * t * (P2.x - P1.x) +
    3 * t ** 2 * (P3.x - P2.x)
  const B2 =
    3 * (1 - t) ** 2 * (P1.y - P0.y) +
    6 * (1 - t) * t * (P2.y - P1.y) +
    3 * t ** 2 * (P3.y - P2.y)

  return Math.sqrt(B1 ** 2 + B2 ** 2) * speedFactor
}
