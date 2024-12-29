import type { Page } from 'puppeteer'

/**
 * This injects a box into the page that moves with the mouse.
 * Useful for debugging.
 */
async function installMouseHelper (page: Page): Promise<void> {
  await page.evaluateOnNewDocument(() => {
    const attachListener = (): void => {
      const box = document.createElement('p-mouse-pointer')
      const styleElement = document.createElement('style')
      styleElement.innerHTML = `
        p-mouse-pointer {
          pointer-events: none;
          position: absolute;
          top: 0;
          z-index: 9999999;
          left: 0;
          width: 48px;
          height: 48px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath fill='%23FFF' stroke='%23000' stroke-width='2' d='M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z'%3E%3C/path%3E%3C/svg%3E") no-repeat center center;
          background-size: contain;
          margin: -24px 0 0 -24px;
          padding: 0;
          transition: transform .2s;
          transform: translate(10px, 20px);
        }
        p-mouse-pointer.button-1 {
          transition: none;
          transform: scale(0.8);
        }
        p-mouse-pointer.button-2 {
          transition: none;
          border-color: rgba(0,0,255,0.9);
        }
        p-mouse-pointer.button-3 {
          transition: none;
          border-radius: 4px;
        }
        p-mouse-pointer.button-4 {
          transition: none;
          border-color: rgba(255,0,0,0.9);
        }
        p-mouse-pointer.button-5 {
          transition: none;
          border-color: rgba(0,255,0,0.9);
        }
        p-mouse-pointer-hide {
          display: none
        }
      `
      document.head.appendChild(styleElement)
      document.body.appendChild(box)
      document.addEventListener(
        'mousemove',
        (event) => {
          console.log('event')
          box.style.left = String(event.pageX) + 'px'
          box.style.top = String(event.pageY) + 'px'
          box.classList.remove('p-mouse-pointer-hide')
          updateButtons(event.buttons)
        },
        true
      )
      document.addEventListener(
        'mousedown',
        (event) => {
          updateButtons(event.buttons)
          box.classList.add('button-' + String(event.which))
          box.classList.remove('p-mouse-pointer-hide')
        },
        true
      )
      document.addEventListener(
        'mouseup',
        (event) => {
          updateButtons(event.buttons)
          box.classList.remove('button-' + String(event.which))
          box.classList.remove('p-mouse-pointer-hide')
        },
        true
      )
      document.addEventListener(
        'mouseleave',
        (event) => {
          updateButtons(event.buttons)
          box.classList.add('p-mouse-pointer-hide')
        },
        true
      )
      document.addEventListener(
        'mouseenter',
        (event) => {
          updateButtons(event.buttons)
          box.classList.remove('p-mouse-pointer-hide')
        },
        true
      )
      function updateButtons (buttons): void {
        for (let i = 0; i < 5; i++) {
          box.classList.toggle(
            'button-' + String(i),
            Boolean(buttons & (1 << i))
          )
        }
      }
    }
    if (document.readyState !== 'loading') {
      attachListener()
    } else {
      window.addEventListener('DOMContentLoaded', attachListener, false)
    }
  })
}

export default installMouseHelper
