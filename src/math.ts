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

// Basic vector operations needed by spoof.ts
export const direction = (a: Vector, b: Vector): Vector => ({
  x: b.x - a.x,
  y: b.y - a.y
})

export const magnitude = (a: Vector): number =>
  Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2))

// Get center of any element
const getBoxCenter = (box: BoundingBox): Vector => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2
})

// For compatibility with the rest of the library
export const overshoot = (coordinate: Vector, radius: number): Vector =>
  coordinate

// Simple linear path between two points
export const bezierCurve = (
  start: Vector,
  finish: Vector | BoundingBox,
  spreadOverride?: number
): Bezier => {
  // Always move to center of elements
  const end: Vector = 'width' in finish ? getBoxCenter(finish) : finish

  // Create a straight line path
  return new Bezier(
    start,
    start, // Control point 1 same as start
    end, // Control point 2 same as end
    end
  )
}

// Simple speed calculation for smooth acceleration/deceleration
export const bezierCurveSpeed = (
  t: number,
  P0: Vector,
  P1: Vector,
  P2: Vector,
  P3: Vector
): number => {
  // Smooth acceleration and deceleration using sine
  return Math.sin(t * Math.PI) * 0.5 + 0.5
}
