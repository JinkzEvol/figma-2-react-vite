import { describe, it, expect } from 'vitest'
import { extractAllStyles } from '../../styleExtractors'
import type { FigmaNode } from '../../types'

// T009 Gradient angle calculation test (will fail until implemented). Assumes future enhancement to compute angle.

describe('gradient angle', () => {
  it('produces linear-gradient with expected stop order and (placeholder) angle', () => {
    const node: FigmaNode = {
      id:'g1', name:'grad', type:'RECTANGLE',
      absoluteBoundingBox:{ x:0,y:0,width:100,height:100 },
      fills: [{
        type: 'GRADIENT_LINEAR',
        gradientHandlePositions:[{x:0,y:0},{x:1,y:0},{x:1,y:1}],
        gradientStops:[
          { position:0, color:{ r:1,g:0,b:0,a:1 } },
          { position:1, color:{ r:0,g:0,b:1,a:1 } }
        ]
      }]
    }
    const css = extractAllStyles(node)
    expect(css.background).toContain('linear-gradient(')
    // Placeholder expected angle not yet computed: test forces failure until angle logic exists.
    // Once implemented, update expected pattern, e.g. linear-gradient(90deg, ...)
    expect(css.background).toMatch(/linear-gradient\(.+rgba\(255, 0, 0, 1\)/)
  })
})
