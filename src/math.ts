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

// Simplified bezier curve that creates a more direct path
export const bezierCurve = (
  start: Vector,
  finish: Vector | BoundingBox,
  spreadOverride?: number
): Bezier => {
  const end: Vector =
    'x' in finish && !('width' in finish)
      ? finish
      : {
          x: finish.x + finish.width / 2,
          y: finish.y + finish.height / 2
        }

  // Create control points that are closer to the line for more direct movement
  const dir = direction(start, end)
  const dist = magnitude(dir)
  const unit = div(dir, dist)

  // Control points at 1/3 and 2/3 of the distance
  const cp1 = add(start, mult(unit, dist * 0.33))
  const cp2 = add(start, mult(unit, dist * 0.66))

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
  const B1 =
    3 * (1 - t) ** 2 * (P1.x - P0.x) +
    6 * (1 - t) * t * (P2.x - P1.x) +
    3 * t ** 2 * (P3.x - P2.x)
  const B2 =
    3 * (1 - t) ** 2 * (P1.y - P0.y) +
    6 * (1 - t) * t * (P2.y - P1.y) +
    3 * t ** 2 * (P3.y - P2.y)
  return Math.sqrt(B1 ** 2 + B2 ** 2)
}
