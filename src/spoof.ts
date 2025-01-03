import type { ElementHandle, Page, BoundingBox, CDPSession } from 'puppeteer'
import debug from 'debug'
import { type Vector, path } from './math'
export { default as installMouseHelper } from './mouse-helper'

const log = debug('ghost-cursor')

interface MoveOptions {
  waitForSelector?: number
  moveDelay?: number
  moveSpeed?: number
}

interface ClickOptions extends MoveOptions {
  waitForClick?: number
}

interface GhostCursor {
  click: (
    selector?: string | ElementHandle,
    options?: ClickOptions
  ) => Promise<void>
  move: (
    selector: string | ElementHandle,
    options?: MoveOptions
  ) => Promise<void>
  moveTo: (destination: Vector, options?: MoveOptions) => Promise<void>
}

/** Helper function to wait a specified number of milliseconds */
const delay = async (ms: number): Promise<void> => {
  if (ms < 1) return
  return await new Promise((resolve) => setTimeout(resolve, ms))
}

/** Get CDP client for mouse control */
const getCDPClient = (page: any): CDPSession =>
  typeof page._client === 'function' ? page._client() : page._client

/** Get center point of a bounding box */
const getBoxCenter = (box: BoundingBox): Vector => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2
})

/** Get element's bounding box */
const getElementBox = async (
  page: Page,
  element: ElementHandle
): Promise<BoundingBox> => {
  const box = await element.boundingBox()
  if (box === null) {
    return await element.evaluate((el: Element) => el.getBoundingClientRect())
  }
  return box
}

export const createCursor = (
  page: Page,
  start: Vector = { x: 0, y: 0 }
): GhostCursor => {
  let previous: Vector = start

  // Move the mouse along a path
  const tracePath = async (vectors: Generator<Vector>): Promise<void> => {
    const cdpClient = getCDPClient(page)

    for (const point of vectors) {
      try {
        await cdpClient.send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: point.x,
          y: point.y,
          button: 'none',
          buttons: 0
        })
        previous = point
        await delay(10) // Small delay for smooth movement
      } catch (error) {
        if (!page.browser().isConnected()) {
          return
        }
        log('Warning: could not move mouse:', error)
      }
    }
  }

  return {
    async click (
      selector?: string | ElementHandle,
      options: ClickOptions = {}
    ): Promise<void> {
      if (typeof selector !== 'undefined') {
        await this.move(selector, options)
      }

      await delay(options.waitForClick ?? 0)

      const cdpClient = getCDPClient(page)

      // Mouse down event
      await cdpClient.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: previous.x,
        y: previous.y,
        button: 'left',
        buttons: 1,
        clickCount: 1
      })

      await delay(50) // Small delay between down and up

      // Mouse up event
      await cdpClient.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: previous.x,
        y: previous.y,
        button: 'left',
        buttons: 0,
        clickCount: 1
      })

      await delay(options.moveDelay ?? 0)
    },

    async move (
      selector: string | ElementHandle,
      options: MoveOptions = {}
    ): Promise<void> {
      let element: ElementHandle<Element>

      if (typeof selector === 'string') {
        if (
          options.waitForSelector !== undefined &&
          options.waitForSelector > 0
        ) {
          await page.waitForSelector(selector, {
            timeout: options.waitForSelector
          })
        }
        const elem = await page.$(selector)
        if (elem == null) {
          throw new Error(`Could not find element with selector "${selector}"`)
        }
        element = elem
      } else {
        element = selector
      }

      // Ensure element is in view
      await element.evaluate((el) => el.scrollIntoView({ block: 'center' }))
      await delay(100) // Wait for scroll

      const box = await getElementBox(page, element)
      const destination = getBoxCenter(box)
      await tracePath(path(previous, destination, options.moveSpeed))
      await delay(options.moveDelay ?? 0)
    },

    async moveTo (
      destination: Vector,
      options: MoveOptions = {}
    ): Promise<void> {
      await tracePath(path(previous, destination, options.moveSpeed))
      await delay(options.moveDelay ?? 0)
    }
  }
}
